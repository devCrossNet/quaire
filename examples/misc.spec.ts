import { Quaire, QuaireComponentType, QuaireItem, QuaireNavigationItem } from '../src';

describe('misc', () => {
  const items: Array<QuaireItem> = [
    {
      id: 1,
      navigationItemId: 2,
      resultProperty: 'foo',
      dependsOnResultProperties: [],
      componentType: QuaireComponentType.SINGLE_SELECT,
      question: 'Question 1',
      description: 'Description 1',
      required: true,
      selectOptions: [
        {
          label: 'Option 1',
          value: 'option 1',
          nextItemId: 2,
        },
        {
          label: 'Option 2',
          value: 'option 2',
          nextItemId: 2,
        },
      ],
    },
    {
      id: 2,
      navigationItemId: 3,
      resultProperty: 'bar',
      dependsOnResultProperties: ['foo'],
      componentType: QuaireComponentType.RANGE_SLIDER,
      question: 'Question 2',
      description: 'Description 2',
      required: true,
      rangeOption: {
        foo: {
          'option 1': {
            range: [1, 99],
            nextItemId: 3,
          },
          'option 2': {
            range: [100, 199],
            nextItemId: 3,
          },
        },
      },
      defaultValue: {
        foo: {
          'option 1': [20, 50],
          'option 2': [120, 150],
        },
      },
    },
    {
      id: 3,
      navigationItemId: 4,
      resultProperty: 'baz',
      dependsOnResultProperties: ['foo'],
      componentType: QuaireComponentType.INPUT,
      question: 'Question 3',
      description: 'Description 3',
      required: true,
      inputOption: {
        foo: {
          'option 1': {
            type: 'text',
            placeholder: 'Enter a text',
            nextItemId: 1,
          },
          'option 2': {
            type: 'number',
            placeholder: 'Type a number',
            nextItemId: 1,
          },
        },
      },
      defaultValue: {
        foo: {
          'option 1': 'Value for option1',
          'option 2': 500,
        },
      },
    },
  ];
  const navigationItems: Array<QuaireNavigationItem> = [
    {
      id: 1,
      parentId: null,
      name: 'Category 1',
    },
    {
      id: 2,
      parentId: 1,
      name: 'Subcategory 1',
    },
    {
      id: 3,
      parentId: 1,
      name: 'Subcategory 2',
    },
    {
      id: 4,
      parentId: 1,
      name: 'Subcategory 2',
    },
  ];

  describe('components', () => {
    test('different default values for input and range components based on dependencies', () => {
      const Q = new Quaire({ items });

      let activeQuestion = Q.getActiveQuestion();
      expect(activeQuestion.question).toBe('Question 1');

      Q.saveAnswer('option 1');
      activeQuestion = Q.getActiveQuestion();

      expect(activeQuestion.question).toBe('Question 2');
      expect(activeQuestion.rangeOption).toEqual({ range: [1, 99], nextItemId: 3 });
      expect(activeQuestion.defaultValue).toEqual([20, 50]);

      Q.saveAnswer(activeQuestion.defaultValue);
      activeQuestion = Q.getActiveQuestion();

      expect(activeQuestion.question).toBe('Question 3');
      expect(activeQuestion.inputOption).toEqual({
        placeholder: 'Enter a text',
        type: 'text',
        nextItemId: 1,
      });
      expect(activeQuestion.defaultValue).toEqual('Value for option1');

      Q.saveAnswer(activeQuestion.defaultValue);
      expect(Q.getResult()).toEqual({
        foo: 'option 1',
        bar: [20, 50],
        baz: 'Value for option1',
      });

      // Jump to question 1 and choose different option
      Q.setActiveQuestionByQuestionId(1);
      Q.saveAnswer('option 2');
      activeQuestion = Q.getActiveQuestion();

      expect(Q.getValidationErrors()).toEqual({ '2': 'REQUIRED' });
      expect(activeQuestion.question).toBe('Question 2');
      expect(activeQuestion.rangeOption).toEqual({ range: [100, 199], nextItemId: 3 });
      expect(activeQuestion.defaultValue).toEqual([120, 150]);

      Q.saveAnswer(activeQuestion.defaultValue);
      activeQuestion = Q.getActiveQuestion();

      expect(activeQuestion.question).toBe('Question 3');
      expect(activeQuestion.inputOption).toEqual({
        placeholder: 'Type a number',
        type: 'number',
        nextItemId: 1,
      });
      expect(activeQuestion.defaultValue).toEqual(500);

      Q.saveAnswer(activeQuestion.defaultValue);
      expect(Q.getResult()).toEqual({
        foo: 'option 2',
        bar: [120, 150],
        baz: 500,
      });
    });
  });

  describe('navigation', () => {
    test('empty items and navigation', () => {
      const Q = new Quaire({ items: [] });

      expect(Q.getActiveQuestion()).toBeNull();
      expect(Q.getNavigation()).toEqual([]);
    });

    test('navigate via navigation item ID', () => {
      const Q = new Quaire({ items, navigationItems });

      Q.setActiveQuestionByNavigationItemId(3);
      expect(Q.getActiveQuestion().id).toBe(2);

      Q.setActiveQuestionByNavigationItemId(2);
      expect(Q.getActiveQuestion().id).toBe(1);

      Q.setActiveQuestionByNavigationItemId(1);
      expect(Q.getActiveQuestion().id).toBe(1);
    });
  });
});
