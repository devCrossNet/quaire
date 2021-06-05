import { Quaire } from '../../src';
import { items, navigationItems } from './data';

describe('branched-and-merged-flow', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ items, navigationItems });
  });

  test('should go through branch a', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');

    Q.saveAnswer(activeQuestion.defaultValue);

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 4');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 4');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: [50, 75],
      foobarbaz: 'option 1',
    });

    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        name: 'Category 1',
        subCategories: [
          {
            active: false,
            componentType: 'RANGE_SLIDER',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: [50, 75],
          },
        ],
        value: 'Option 1',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        name: 'Category 2',
        subCategories: [],
        value: 'Option 1',
      },
    ]);
  });

  test('should go through branch b', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 2');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    Q.saveAnswer(activeQuestion.defaultValue);

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 4');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 4');

    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      baz: 'user input',
      foobarbaz: 'option 1',
    });

    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        name: 'Category 1',
        subCategories: [
          {
            active: false,
            componentType: 'INPUT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: 'user input',
          },
        ],
        value: 'Option 2',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        name: 'Category 2',
        subCategories: [],
        value: 'Option 1',
      },
    ]);
  });
});
