import { Quaire } from '../../src';
import { items, navigationItems } from './data';

describe('linear-flow-with-loop', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ items, navigationItems });
  });

  test('should go through the linear flow and back to the first question', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');

    Q.saveAnswer('option 2');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');

    Q.saveAnswer('option 2');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'option 2',
      baz: 'option 2',
    });

    expect(Q.getNavigation()).toEqual([
      {
        active: true,
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
            value: 'Option 2',
          },
        ],
      },
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        value: 'Option 2',
        subCategories: [],
      },
    ]);
  });
});
