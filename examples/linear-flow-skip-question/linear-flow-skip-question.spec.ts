import { NO_VALUE, Quaire } from '../../src';
import { items, navigationItems } from './data';

describe('linear-flow', () => {
  let Q;

  beforeEach(() => {
    Q = new Quaire({ items, navigationItems });
  });

  test('should go through the linear flow and skip 2. question', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 2');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      baz: 'option 1',
    });

    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        value: 'Option 2',
        subCategories: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: false,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: null,
          },
        ],
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        value: 'Option 1',
        subCategories: [],
      },
    ]);
  });

  test('should answer the 2. question with the skip option', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');

    Q.saveAnswer(NO_VALUE);

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'NO_VALUE',
      baz: 'option 1',
    });

    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        value: 'Option 1',
        subCategories: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: 'NO_VALUE', // indicator that this question was answered with an "empty" value
          },
        ],
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        value: 'Option 1',
        subCategories: [],
      },
    ]);
  });
});
