import { Quaire } from '../src';
import { items, navigationItems } from './dependencies-between-questions/data';

describe('restore state', () => {
  test('should restore state from existing result', () => {
    const Q = new Quaire({
      items,
      navigationItems,
      result: { foo: 'option 1', bar: 'option 1.2', baz: 'option 1.2.1' },
    });

    expect(Q.getActiveQuestion().selectOptions).toEqual([
      {
        label: 'Option 1.2.1',
        value: 'option 1.2.1',
      },
      {
        label: 'Option 1.2.2',
        value: 'option 1.2.2',
      },
    ]);
    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'option 1.2',
      baz: 'option 1.2.1',
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
            value: 'Option 1.2',
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
        value: 'Option 1.2.1',
      },
    ]);
  });

  test('should restore state from partially existing result', () => {
    const Q = new Quaire({ items, navigationItems, result: { foo: 'option 1', bar: 'option 1.2' } });

    expect(Q.getActiveQuestion().selectOptions).toEqual([
      {
        label: 'Option 1.2.1',
        value: 'option 1.2.1',
      },
      {
        label: 'Option 1.2.2',
        value: 'option 1.2.2',
      },
    ]);
    expect(Q.getResult()).toEqual({
      foo: 'option 1',
      bar: 'option 1.2',
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
            value: 'Option 1.2',
          },
        ],
        value: 'Option 1',
      },
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: false,
        id: 3,
        isValid: false,
        name: 'Category 2',
        subNavigation: [],
        value: null,
      },
    ]);
  });

  test('should restore state from empty existing result', () => {
    const Q = new Quaire({ items, navigationItems, result: {} });

    expect(Q.getActiveQuestion().selectOptions).toEqual([
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
    expect(Q.getResult()).toEqual({});
    expect(Q.getNavigation()).toEqual([
      {
        active: true,
        componentType: 'SINGLE_SELECT',
        hasValue: true,
        id: 1,
        isValid: false,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'SINGLE_SELECT',
            hasValue: false,
            id: 2,
            isValid: false,
            name: 'Subcategory 1',
            value: null,
          },
        ],
        value: null,
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
  });
});
