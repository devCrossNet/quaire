import { NO_VALUE, QuaireErrorCode } from './constants.js';
import { Quaire } from './quaire.js';
import type {
  QuaireNavigationDefinition,
  QuaireNavigationItem,
  QuairePartialResult,
  QuaireQuestionDefinition,
  QuaireQuestionDefinitionBase,
} from './types.js';

const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'SINGLE_SELECT',
    key: 'plan',
    title: 'Which plan do you want?',
    navigationId: 'plan',
    required: true,
    options: [
      { label: 'Free', value: 'free', next: 3 },
      { label: 'Pro', value: 'pro', next: 2 },
    ],
  },
  {
    id: 2,
    type: 'INPUT',
    key: 'company',
    title: 'What is your company?',
    navigationId: 'company',
    required: true,
    next: 3,
  },
  {
    id: 3,
    type: 'BOOLEAN',
    key: 'newsletter',
    title: 'Do you want our newsletter?',
    navigationId: 'newsletter',
    required: true,
    defaultValue: false,
    trueLabel: 'Yes',
    falseLabel: 'No',
  },
];

const navigation: Array<QuaireNavigationDefinition> = [
  { id: 'company', parentId: 'plan', title: 'Company' }, // child before its parent
  { id: 'plan', title: 'Plan' },
  { id: 'newsletter', title: 'Newsletter', icon: 'mail' },
  { id: 'settings', parentId: 'newsletter', title: 'Settings' }, // child without question
  { id: 'orphan', parentId: 'unknown', title: 'Orphan' }, // child with unknown parent
  { id: 'empty', title: 'Empty' }, // parent without question and children
];

// keeps the navigation tests short
const summarize = (items: Array<QuaireNavigationItem>) =>
  items.map(({ id, value, active, hasValue, isValid, reachable, children }) => ({
    id,
    value,
    active,
    hasValue,
    isValid,
    reachable,
    ...(children ? { children: summarize(children) } : {}),
  }));

describe('Quaire', () => {
  describe('without questions', () => {
    test('should have no active question', () => {
      const Q = new Quaire({ questions: [], result: {} });

      Q.saveAnswer('anything');
      Q.goTo(1);
      Q.back();
      Q.reset();

      expect(Q.getState()).toEqual({
        activeQuestion: null,
        result: {},
        errors: {},
        navigation: [],
        path: [],
        progress: { answered: 0, total: 0 },
        isValid: true,
        isComplete: false,
        canGoBack: false,
      });
    });
  });

  describe('answers', () => {
    test('should start with the first question', () => {
      const Q = new Quaire({ questions });

      expect(Q.getActiveQuestion()).toEqual({
        ...questions[0],
        value: null,
        error: QuaireErrorCode.REQUIRED,
        isValid: false,
        hasValue: false,
      });
    });

    test('should move to the next question of the selected option', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('pro');

      expect(Q.getActiveQuestion().id).toBe(2);
    });

    test('should save false and 0 as answers', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('free');
      expect(Q.getActiveQuestion().defaultValue).toBe(false);

      Q.saveAnswer(false);
      expect(Q.getResult()).toEqual({ plan: 'free', newsletter: false });
      expect(Q.isValid()).toBe(true);
    });

    test('should stay on the question when the answer is invalid', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('enterprise');

      expect(Q.getActiveQuestion().id).toBe(1);
      expect(Q.getActiveQuestion().error).toBe(QuaireErrorCode.INVALID_OPTION);
      expect(Q.getResult()).toEqual({ plan: 'enterprise' });
      expect(Q.isValid()).toBe(false);
    });

    test('should stay on the last question and complete the flow', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('free');
      expect(Q.isComplete()).toBe(false);

      Q.saveAnswer(true);
      expect(Q.getActiveQuestion().id).toBe(3);
      expect(Q.isComplete()).toBe(true);
    });

    test('should stay on the question when the next question does not exist', () => {
      const Q = new Quaire({ questions: [{ ...questions[1], next: 99 }] });

      Q.saveAnswer('ACME');

      expect(Q.getActiveQuestion().id).toBe(2);
    });

    test('should accept NO_VALUE for skipped questions', () => {
      const Q = new Quaire({ questions, navigation });

      Q.saveAnswer('pro');
      Q.saveAnswer(NO_VALUE);

      expect(Q.getActiveQuestion().id).toBe(3);
      expect(Q.getErrors()).toEqual({ '3': QuaireErrorCode.REQUIRED });
      expect(Q.getNavigation()[0].children[0].value).toBe(NO_VALUE);
    });

    test('should use a custom validator', () => {
      const Q = new Quaire({
        questions: [
          {
            ...questions[1],
            validate: (value, result) =>
              String(value).endsWith('GmbH') || result.country !== 'DE' ? null : 'LEGAL_FORM_MISSING',
          },
        ],
        result: { country: 'DE' },
      });

      Q.saveAnswer('ACME');
      expect(Q.getErrors()).toEqual({ '2': 'LEGAL_FORM_MISSING' });

      Q.saveAnswer('ACME GmbH');
      expect(Q.getErrors()).toEqual({});
    });
  });

  describe('path', () => {
    test('should follow the answers from the first question', () => {
      const Q = new Quaire({ questions });

      expect(Q.getState().path).toEqual([1]);

      Q.saveAnswer('pro');
      expect(Q.getState().path).toEqual([1, 2, 3]);
    });

    test('should remove answers of a branch that is no longer taken', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('pro');
      Q.saveAnswer('ACME');
      Q.saveAnswer(true);
      Q.goTo(1);
      Q.saveAnswer('free');

      expect(Q.getResult()).toEqual({ plan: 'free', newsletter: true });
      expect(Q.getState().path).toEqual([1, 3]);
    });

    test('should only validate questions on the path', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('free');
      Q.saveAnswer(true);

      expect(Q.isValid()).toBe(true);
      expect(Q.getErrors()).toEqual({});
    });

    test('should validate unanswered questions with only one next question', () => {
      const Q = new Quaire({
        questions: [{ ...questions[1], id: 1, next: 2 }, { ...questions[1], key: 'name' }, questions[2]],
      });

      expect(Q.getState().path).toEqual([1, 2, 3]);
      expect(Q.getErrors()).toEqual({ '1': 'REQUIRED', '2': 'REQUIRED', '3': 'REQUIRED' });
    });

    test('should stop at a loop', () => {
      const Q = new Quaire({
        questions: [
          { ...questions[1], id: 1, next: 2 },
          { ...questions[2], id: 2, next: [{ when: { newsletter: true }, to: 1 }] },
        ],
      });

      Q.saveAnswer('ACME');
      Q.saveAnswer(true);

      expect(Q.getActiveQuestion().id).toBe(1);
      expect(Q.getState().path).toEqual([1, 2]);
      expect(Q.isComplete()).toBe(false);
    });

    test('should branch with conditions', () => {
      const age: QuaireQuestionDefinition = {
        id: 'age',
        type: 'INPUT',
        key: 'age',
        title: 'How old are you?',
        next: [{ when: { age: { gte: 18 } }, to: 'adult' }, { to: 'minor' }],
      };
      const adult = new Quaire({
        questions: [age, { ...questions[2], id: 'adult' }, { ...questions[2], id: 'minor' }],
      });
      const minor = new Quaire({
        questions: [age, { ...questions[2], id: 'adult' }, { ...questions[2], id: 'minor' }],
      });

      adult.saveAnswer(30);
      minor.saveAnswer(12);

      expect(adult.getActiveQuestion().id).toBe('adult');
      expect(minor.getActiveQuestion().id).toBe('minor');
    });

    test('should end the flow when no condition matches', () => {
      const Q = new Quaire({
        questions: [{ ...questions[1], next: [{ when: { company: 'ACME' }, to: 3 }] }, questions[2]],
      });

      Q.saveAnswer('Other');

      expect(Q.getActiveQuestion().id).toBe(2);
      expect(Q.isComplete()).toBe(true);
    });
  });

  describe('variants', () => {
    const variantQuestions: Array<QuaireQuestionDefinition> = [
      {
        id: 1,
        type: 'SINGLE_SELECT',
        key: 'animal',
        title: 'Which animal?',
        options: [
          { label: 'Dog', value: 'dog', next: 2 },
          { label: 'Cat', value: 'cat', next: 2 },
        ],
      },
      {
        id: 2,
        type: 'SINGLE_SELECT',
        key: 'breed',
        title: 'Which breed?',
        required: true,
        options: [],
        variants: [
          { when: { animal: 'dog' }, options: [{ label: 'Poodle', value: 'poodle' }] },
          { when: { animal: 'cat' }, options: [{ label: 'Siamese', value: 'siamese' }] },
        ],
      },
    ];

    test('should show the options of the matching variant', () => {
      const Q = new Quaire({ questions: variantQuestions });

      Q.saveAnswer('cat');

      expect(Q.getActiveQuestion()).toMatchObject({ options: [{ label: 'Siamese', value: 'siamese' }] });
    });

    test('should reset the answer when the variant changes', () => {
      const Q = new Quaire({ questions: variantQuestions });

      Q.saveAnswer('dog');
      Q.saveAnswer('poodle');
      Q.goTo(1);
      Q.saveAnswer('cat');

      expect(Q.getResult()).toEqual({ animal: 'cat', breed: null });
      expect(Q.getErrors()).toEqual({ '2': QuaireErrorCode.REQUIRED });
      expect(Q.getActiveQuestion().id).toBe(2);
    });

    test('should keep the answer when the variant does not change', () => {
      const Q = new Quaire({ questions: variantQuestions });

      Q.saveAnswer('dog');
      Q.saveAnswer('poodle');
      Q.goTo(1);
      Q.saveAnswer('dog');

      expect(Q.getResult()).toEqual({ animal: 'dog', breed: 'poodle' });
    });
  });

  describe('history', () => {
    test('should go back to the previous question', () => {
      const Q = new Quaire({ questions });

      expect(Q.canGoBack()).toBe(false);

      Q.saveAnswer('pro');
      Q.saveAnswer('ACME');
      expect(Q.canGoBack()).toBe(true);

      Q.back();
      expect(Q.getActiveQuestion().id).toBe(2);

      Q.back();
      expect(Q.getActiveQuestion().id).toBe(1);
      expect(Q.canGoBack()).toBe(false);
      expect(Q.getResult()).toEqual({ plan: 'pro', company: 'ACME' });
    });

    test('should jump to a question', () => {
      const Q = new Quaire({ questions });
      const state = Q.getState();

      Q.goTo(1);
      Q.goTo(99);
      expect(Q.getState()).toBe(state);

      Q.goTo('3');
      expect(Q.getActiveQuestion().id).toBe(3);

      Q.back();
      expect(Q.getActiveQuestion().id).toBe(1);
    });

    test('should keep the other answers when an answer changes', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('pro');
      Q.saveAnswer('ACME');
      Q.saveAnswer(true);
      Q.goTo(2);
      Q.saveAnswer('ACME GmbH');

      expect(Q.getActiveQuestion().id).toBe(3);
      expect(Q.getResult()).toEqual({ plan: 'pro', company: 'ACME GmbH', newsletter: true });
    });
  });

  describe('navigation', () => {
    test('should show the navigation of the flow', () => {
      const Q = new Quaire({ questions, navigation });

      expect(summarize(Q.getNavigation())).toEqual([
        {
          id: 'plan',
          value: null,
          active: true,
          hasValue: false,
          isValid: false,
          reachable: true,
          children: [{ id: 'company', value: null, active: false, hasValue: false, isValid: true, reachable: false }],
        },
        {
          id: 'newsletter',
          value: null,
          active: false,
          hasValue: false,
          isValid: true,
          reachable: false,
          children: [],
        },
      ]);
    });

    test('should show the answers and keep custom properties', () => {
      const Q = new Quaire({ questions, navigation });

      Q.saveAnswer('pro');
      Q.saveAnswer('ACME');
      Q.saveAnswer(false);

      const [plan, newsletter] = Q.getNavigation();

      expect(summarize([plan, newsletter])).toEqual([
        {
          id: 'plan',
          value: 'Pro',
          active: false,
          hasValue: true,
          isValid: true,
          reachable: true,
          children: [{ id: 'company', value: 'ACME', active: false, hasValue: true, isValid: true, reachable: true }],
        },
        { id: 'newsletter', value: 'No', active: true, hasValue: true, isValid: true, reachable: true, children: [] },
      ]);
      expect(newsletter).toMatchObject({ title: 'Newsletter', icon: 'mail', question: { id: 3, value: false } });
    });

    test('should derive a parent without question from its children', () => {
      const Q = new Quaire({
        questions,
        navigation: [
          { id: 'about', title: 'About' },
          { id: 'plan', parentId: 'about', title: 'Plan' },
          { id: 'company', parentId: 'about', title: 'Company' },
        ],
      });

      Q.saveAnswer('free');

      expect(summarize(Q.getNavigation())).toEqual([
        {
          id: 'about',
          value: null,
          active: false,
          hasValue: true,
          isValid: true,
          reachable: true,
          children: [
            { id: 'plan', value: 'Free', active: false, hasValue: true, isValid: true, reachable: true },
            { id: 'company', value: null, active: false, hasValue: false, isValid: true, reachable: false },
          ],
        },
      ]);
    });

    test('should show the answered question when a navigation item has more than one question', () => {
      const Q = new Quaire({
        questions: [
          { ...questions[1], id: 1, next: 2, navigationId: 'about' },
          { ...questions[1], key: 'name', navigationId: 'about' },
        ],
        navigation: [{ id: 'about', title: 'About' }],
      });

      expect(Q.getNavigation()[0].question.id).toBe(1);

      Q.goTo(2);
      Q.saveAnswer('Jane');

      expect(Q.getNavigation()[0].question.id).toBe(2);
    });

    test('should jump to a question via the navigation', () => {
      const Q = new Quaire({
        questions,
        navigation: [
          { id: 'about', title: 'About' },
          ...navigation.map((item) => ({ ...item, parentId: item.parentId ?? 'about' })),
        ],
      });

      Q.goToNavigationItem('newsletter');
      expect(Q.getActiveQuestion().id).toBe(3);

      Q.goToNavigationItem('about');
      expect(Q.getActiveQuestion().id).toBe(1);

      Q.goToNavigationItem('empty');
      expect(Q.getActiveQuestion().id).toBe(1);
    });
  });

  describe('state', () => {
    test('should return the same state until the flow changes', () => {
      const Q = new Quaire({ questions });
      const state = Q.getState();

      expect(Q.getState()).toBe(state);

      Q.saveAnswer('pro');
      expect(Q.getState()).not.toBe(state);
    });

    test('should notify subscribers about changes', () => {
      const Q = new Quaire({ questions });
      const listener = vi.fn();
      const unsubscribe = Q.subscribe(listener);

      Q.saveAnswer('pro');
      expect(listener).toHaveBeenCalledWith(Q.getState());

      unsubscribe();
      Q.saveAnswer('ACME');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('should not change the result that was passed in or returned', () => {
      const result = { plan: 'pro' };
      const Q = new Quaire({ questions, result });

      Q.saveAnswer('ACME');
      (Q.getResult() as Record<string, unknown>).plan = 'changed';

      expect(result).toEqual({ plan: 'pro' });
      expect(Q.getState().path).toEqual([1, 2, 3]);
      expect(Q.getActiveQuestion().id).toBe(3);
    });

    test('should count the progress on the path', () => {
      const Q = new Quaire({ questions });

      expect(Q.getProgress()).toEqual({ answered: 0, total: 1 });

      Q.saveAnswer('pro');
      expect(Q.getProgress()).toEqual({ answered: 1, total: 3 });

      Q.saveAnswer('ACME');
      Q.saveAnswer(true);
      expect(Q.getProgress()).toEqual({ answered: 3, total: 3 });
    });

    test('should reset the flow', () => {
      const Q = new Quaire({ questions });

      Q.saveAnswer('pro');
      Q.reset();

      expect(Q.getResult()).toEqual({});
      expect(Q.getActiveQuestion().id).toBe(1);
      expect(Q.canGoBack()).toBe(false);
    });
  });

  describe('restore', () => {
    test('should continue with the first open question', () => {
      const Q = new Quaire({ questions, result: { plan: 'pro' } });

      expect(Q.getActiveQuestion().id).toBe(2);
      expect(Q.canGoBack()).toBe(true);

      Q.back();
      expect(Q.getActiveQuestion().id).toBe(1);
    });

    test('should continue with an invalid answer', () => {
      const Q = new Quaire({ questions, result: { plan: 'pro', company: true } });

      expect(Q.getActiveQuestion().id).toBe(2);
      expect(Q.getErrors()).toEqual({ '2': QuaireErrorCode.INVALID_TYPE, '3': QuaireErrorCode.REQUIRED });
    });

    test('should show the last question of a complete result', () => {
      const Q = new Quaire({ questions, result: { plan: 'free', newsletter: true, other: 'kept' } });

      expect(Q.getActiveQuestion().id).toBe(3);
      expect(Q.isComplete()).toBe(true);
      expect(Q.getResult()).toEqual({ plan: 'free', newsletter: true, other: 'kept' });
    });

    test('should start with the first question for an empty result', () => {
      const Q = new Quaire({ questions, result: {} });

      expect(Q.getActiveQuestion().id).toBe(1);
      expect(Q.canGoBack()).toBe(false);
    });
  });

  describe('custom components', () => {
    type RatingDefinition = QuaireQuestionDefinitionBase<'RATING', { stars: number }>;

    const rating: RatingDefinition = { id: 1, type: 'RATING', key: 'rating', title: 'How do you like it?', stars: 5 };

    test('should use the component of a custom type', () => {
      const Q = new Quaire<{ rating: number }, RatingDefinition>({
        questions: [{ ...rating, navigationId: 'rating' }],
        navigation: [{ id: 'rating', title: 'Rating' }],
        components: {
          RATING: {
            hasValue: (value) => typeof value === 'number' && value > 0,
            validate: (definition: RatingDefinition, value) =>
              Number(value) <= definition.stars ? null : 'TOO_MANY_STARS',
            getDisplayValue: (_definition, value) => '★'.repeat(Number(value)),
          },
        },
      });

      Q.saveAnswer(0);
      expect(Q.getErrors()).toEqual({});
      expect(Q.getActiveQuestion().hasValue).toBe(false);

      Q.saveAnswer(6);
      expect(Q.getErrors()).toEqual({ '1': 'TOO_MANY_STARS' });

      Q.saveAnswer(3);
      expect(Q.getNavigation()[0].value).toBe('★★★');
      expect(Q.getActiveQuestion().stars).toBe(5);
    });

    test('should accept any value for a type without component', () => {
      const Q = new Quaire<object, RatingDefinition>({
        questions: [
          { ...rating, next: 2 },
          { ...rating, id: 2, key: 'other' },
        ],
      });

      Q.saveAnswer('great');

      expect(Q.getActiveQuestion().id).toBe(2);
      expect(Q.getResult()).toEqual({ rating: 'great' });
    });
  });

  describe('result type', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interfaces must work as result type
    interface MyResult {
      plan: 'free' | 'pro';
      newsletter: boolean;
    }

    test('should type the result with a custom result type', () => {
      const Q = new Quaire<MyResult>({ questions, result: { plan: 'free' } });

      expectTypeOf(Q.getResult().plan).toEqualTypeOf<'free' | 'pro' | null | undefined>();
      expectTypeOf(Q.getResult().newsletter).toEqualTypeOf<boolean | null | undefined>();
    });

    test('should infer the result type from the result option', () => {
      const Q = new Quaire({ questions, result: { plan: 'free' } });

      expectTypeOf(Q.getResult()).toEqualTypeOf<{ plan?: string | null }>();
    });

    test('should use unknown values without a custom result type', () => {
      const Q = new Quaire({ questions });

      expectTypeOf(Q.getResult()).toEqualTypeOf<QuairePartialResult>();
      expectTypeOf(Q.getActiveQuestion().value).toEqualTypeOf<unknown>();
    });
  });

  describe('performance', () => {
    test('should handle long flows with dependencies', () => {
      const longFlow: Array<QuaireQuestionDefinition> = Array.from({ length: 500 }, (_, index) => ({
        id: index,
        type: 'INPUT',
        key: `q${index}`,
        title: `Question ${index}`,
        required: true,
        next: index + 1 < 500 ? index + 1 : undefined,
        variants: index > 0 ? [{ when: { [`q${index - 1}`]: 'yes' }, placeholder: 'yes' }] : [],
      }));
      const Q = new Quaire({ questions: longFlow });
      const start = performance.now();

      longFlow.forEach(() => Q.saveAnswer('yes'));

      expect(Q.isComplete()).toBe(true);
      expect(performance.now() - start).toBeLessThan(2000);
    });
  });
});
