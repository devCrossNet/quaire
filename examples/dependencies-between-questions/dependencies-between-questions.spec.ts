import { Quaire } from '../../src';
import { items, navigationItems } from './data';

describe('dependencies-between-questions', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ items, navigationItems });
  });

  test('should have select options based on interdependencies', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.selectOptions).toEqual([
      {
        label: 'Option 1',
        nextItemId: 2,
        value: 'option 1',
      },
      {
        label: 'Option 2',
        nextItemId: 2,
        value: 'option 2',
      },
    ]);

    Q.saveAnswer('option 1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.selectOptions).toEqual([
      {
        label: 'Option 1.1',
        value: 'option 1.1',
        nextItemId: 3,
      },
      {
        label: 'Option 1.2',
        value: 'option 1.2',
        nextItemId: 3,
      },
    ]);

    Q.saveAnswer('option 1.1');

    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.selectOptions).toEqual([
      {
        label: 'Option 1.1.1',
        value: 'option 1.1.1',
      },
      {
        label: 'Option 1.1.2',
        value: 'option 1.1.2',
      },
    ]);

    Q.saveAnswer('option 1.1.1');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'option 1.1',
      baz: 'option 1.1.1',
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: 'Option 1.1',
          },
        ],
        value: 'Option 1',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        subNavigation: [],
        value: 'Option 1.1.1',
      },
    ]);
  });

  test('should react and validate later questions based on first question', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer('option 1.1');
    Q.saveAnswer('option 1.1.1');

    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'option 1.1',
      baz: 'option 1.1.1',
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: 'Option 1.1',
          },
        ],
        value: 'Option 1',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        subNavigation: [],
        value: 'Option 1.1.1',
      },
    ]);

    Q.setActiveQuestionByQuestionId(1);
    Q.saveAnswer('option 2');

    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      bar: null,
    });
    expect(Q.isValid()).toBeFalsy();
    expect(Q.getValidationErrors()).toEqual({
      '2': 'REQUIRED',
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
            componentType: 'SINGLE_SELECT',
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
        componentType: 'SINGLE_SELECT',
        hasValue: false,
        id: 3,
        isValid: false,
        name: 'Category 2',
        subNavigation: [],
        value: null,
      },
    ]);

    Q.saveAnswer('option 2.2');
    Q.saveAnswer('option 2.2.2');

    expect(Q.getResult()).toEqual({
      foo: 'option 2',
      bar: 'option 2.2',
      baz: 'option 2.2.2',
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: false,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: 'Option 2.2',
          },
        ],
        value: 'Option 2',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 3,
        isValid: true,
        name: 'Category 2',
        subNavigation: [],
        value: 'Option 2.2.2',
      },
    ]);
  });
});
