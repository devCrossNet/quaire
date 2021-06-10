import { items, navigationItems } from './data';
import { Quaire } from '../../src';
import { MyComponentType, MyQuaire } from './MyQuaire';

describe('custom-component-types', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new MyQuaire({ items, navigationItems });
  });

  test('should validate new component types based on dependent answers', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    Q.saveAnswer('option 1');
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');
    expect(activeQuestion.componentType).toBe(MyComponentType.MULTI_SELECT);
    expect(activeQuestion.selectOptions).toEqual([
      {
        label: 'Option 1',
        nextItemId: 3,
        value: 'option 1',
      },
      {
        label: 'Option 2',
        nextItemId: 3,
        value: 'option 2',
      },
    ]);

    Q.saveAnswer(['option 2', 'option 1']);
    activeQuestion = Q.getActiveQuestion();

    expect(activeQuestion.question).toBe('Question 3');
    expect(activeQuestion.componentType).toBe(MyComponentType.BOOLEAN);
    expect(activeQuestion.defaultValue).toBe(true);

    Q.saveAnswer(activeQuestion.defaultValue);
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: ['option 1', 'option 2'],
      baz: true,
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'MULTI_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: ['Option 1', 'Option 2'],
          },
        ],
        value: 'Option 1',
      },
      {
        active: false,
        componentType: 'BOOLEAN',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        subNavigation: [],
        value: true,
      },
    ]);

    // reset flow by choosing different answer
    Q.saveAnswer('option 2');
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');
    expect(activeQuestion.componentType).toBe(MyComponentType.MULTI_SELECT);
    expect(activeQuestion.selectOptions).toEqual([
      {
        label: 'Option 3',
        nextItemId: 3,
        value: 'option 3',
      },
      {
        label: 'Option 4',
        nextItemId: 3,
        value: 'option 4',
      },
    ]);
    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      bar: null,
      baz: true,
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: true,
            componentType: 'MULTI_SELECT',
            hasValue: false,
            id: 2,
            isValid: false,
            name: 'Subcategory 1',
            value: null,
          },
        ],
        value: 'Option 2',
      },
      {
        active: false,
        componentType: 'BOOLEAN',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        subNavigation: [],
        value: true,
      },
    ]);

    // provide wrong answer
    Q.saveAnswer('option 1');
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');

    // provide correct answer
    Q.saveAnswer(['option 3', 'option 4']);
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 3');
    expect(activeQuestion.defaultValue).toBe(false);

    Q.saveAnswer(activeQuestion.defaultValue);
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');

    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      bar: ['option 3', 'option 4'],
      baz: false,
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'MULTI_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: ['Option 3', 'Option 4'],
          },
        ],
        value: 'Option 2',
      },
      {
        active: false,
        componentType: 'BOOLEAN',
        hasValue: false,
        id: 3,
        isValid: false,
        name: 'Category 2',
        subNavigation: [],
        value: null,
      },
    ]);
  });
});
