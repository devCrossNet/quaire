import { QuaireDefinitionProblemCode } from './constants.js';
import { resolveDefinition, validateDefinition } from './definition.js';
import type { QuaireNavigationDefinition, QuaireQuestionDefinition } from './types.js';

describe('definition', () => {
  describe('resolveDefinition', () => {
    const question: QuaireQuestionDefinition = {
      id: 2,
      type: 'SINGLE_SELECT',
      key: 'bar',
      title: 'Bar',
      options: [],
      variants: [
        { when: { foo: 'a' }, options: [{ label: 'A1', value: 'a1' }] },
        { when: { foo: 'b' }, title: 'Bar for B', options: [{ label: 'B1', value: 'b1' }] },
      ],
    };

    test('should apply the first matching variant', () => {
      const { definition, variantIndex } = resolveDefinition(question, { foo: 'b' });

      expect(variantIndex).toBe(1);
      expect(definition).toEqual({
        id: 2,
        type: 'SINGLE_SELECT',
        key: 'bar',
        title: 'Bar for B',
        options: [{ label: 'B1', value: 'b1' }],
      });
    });

    test('should use the base definition without a matching variant', () => {
      const { definition, variantIndex } = resolveDefinition(question, {});

      expect(variantIndex).toBe(-1);
      expect(definition).toEqual({ id: 2, type: 'SINGLE_SELECT', key: 'bar', title: 'Bar', options: [] });
    });
  });

  describe('validateDefinition', () => {
    const navigation: Array<QuaireNavigationDefinition> = [
      { id: 'a', title: 'A' },
      { id: 'b', parentId: 'a', title: 'B' },
    ];
    const questions: Array<QuaireQuestionDefinition> = [
      {
        id: 1,
        type: 'SINGLE_SELECT',
        key: 'foo',
        title: 'Foo',
        navigationId: 'a',
        options: [
          { label: 'A', value: 'a', next: 2 },
          { label: 'B', value: 'b', next: '3' },
        ],
      },
      { id: 2, type: 'BOOLEAN', key: 'bar', title: 'Bar', next: [{ when: { bar: true }, to: 3 }, { to: 3 }] },
      { id: 3, type: 'INPUT', key: 'baz', title: 'Baz', navigationId: 'b' },
    ];

    test('should find no problems in a correct definition', () => {
      expect(validateDefinition({ questions, navigation })).toEqual([]);
    });

    test('should find duplicate IDs and keys', () => {
      const problems = validateDefinition({
        questions: [...questions, { ...questions[2], id: '3' }],
        navigation: [...navigation, { id: 'a', title: 'A again' }],
      });

      expect(problems.map((problem) => problem.code)).toEqual([
        QuaireDefinitionProblemCode.DUPLICATE_ID,
        QuaireDefinitionProblemCode.DUPLICATE_KEY,
        QuaireDefinitionProblemCode.DUPLICATE_NAVIGATION_ID,
      ]);
      expect(problems[0]).toEqual({
        code: QuaireDefinitionProblemCode.DUPLICATE_ID,
        message: 'The question ID "3" is used more than once.',
        questionId: '3',
      });
    });

    test('should find unknown types, next questions and navigation items', () => {
      const problems = validateDefinition({
        questions: [
          { ...questions[0], navigationId: 'x' },
          { ...questions[1], type: 'RATING' as 'BOOLEAN', next: 9 },
          { ...questions[2], variants: [{ when: { foo: 'a' }, next: [{ to: 8 }] }] },
        ],
        navigation: [...navigation, { id: 'c', parentId: 'y', title: 'C' }],
      });

      expect(problems.map((problem) => problem.message)).toEqual([
        'Question "1" has the unknown navigation ID "x".',
        'Question "2" has the unknown type "RATING".',
        'Question "2" leads to the unknown question "9".',
        'Question "3" leads to the unknown question "8".',
        'Navigation item "c" has the unknown parent "y".',
      ]);
    });

    test('should find questions that cannot be reached', () => {
      const problems = validateDefinition({ questions: [{ ...questions[1], next: undefined }, questions[2]] });

      expect(problems).toEqual([
        {
          code: QuaireDefinitionProblemCode.UNKNOWN_NAVIGATION,
          message: 'Question "3" has the unknown navigation ID "b".',
          questionId: 3,
        },
        {
          code: QuaireDefinitionProblemCode.UNREACHABLE,
          message: 'Question "3" cannot be reached from the first question.',
          questionId: 3,
        },
      ]);
    });

    test('should accept custom component types', () => {
      const rating = { ...questions[2], type: 'RATING' as 'INPUT', navigationId: undefined };

      expect(validateDefinition({ questions: [rating], components: { RATING: {} } })).toEqual([]);
    });

    test('should check options of variants', () => {
      const select = {
        ...questions[0],
        options: [],
        variants: [{ when: { foo: 'a' }, options: [{ label: 'X', value: 'x', next: 7 }] }],
      };

      expect(validateDefinition({ questions: [select] }).map((problem) => problem.code)).toEqual([
        QuaireDefinitionProblemCode.UNKNOWN_NEXT,
        QuaireDefinitionProblemCode.UNKNOWN_NAVIGATION,
      ]);
    });
  });
});
