import { QuaireComponentType, QuaireItem, QuaireNavigationItem } from '../../src';

export const items: QuaireItem[] = [
  {
    id: 1,
    resultProperty: 'foo',
    navigationItemId: 1,
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
    resultProperty: 'bar',
    navigationItemId: 2,
    dependsOnResultProperties: ['foo'],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'Question 2',
    description: 'Description 2',
    required: true,
    selectOptions: {
      foo: {
        'option 1': [
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
        ],
        'option 2': [
          {
            label: 'Option 2.1',
            value: 'option 2.1',
            nextItemId: 3,
          },
          {
            label: 'Option 2.2',
            value: 'option 2.2',
            nextItemId: 3,
          },
        ],
      },
    },
  },
  {
    id: 3,
    resultProperty: 'baz',
    navigationItemId: 3,
    dependsOnResultProperties: ['foo', 'bar'],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'Question 3',
    description: 'Description 3',
    required: true,
    selectOptions: {
      foo: {
        'option 1': {
          bar: {
            'option 1.1': [
              {
                label: 'Option 1.1.1',
                value: 'option 1.1.1',
              },
              {
                label: 'Option 1.1.2',
                value: 'option 1.1.2',
              },
            ],
            'option 1.2': [
              {
                label: 'Option 1.2.1',
                value: 'option 1.2.1',
              },
              {
                label: 'Option 1.2.2',
                value: 'option 1.2.2',
              },
            ],
          },
        },
        'option 2': {
          bar: {
            'option 2.1': [
              {
                label: 'Option 2.1.1',
                value: 'option 2.1.1',
              },
              {
                label: 'Option 2.1.2',
                value: 'option 2.1.2',
              },
            ],
            'option 2.2': [
              {
                label: 'Option 2.2.1',
                value: 'option 2.2.1',
              },
              {
                label: 'Option 2.2.2',
                value: 'option 2.2.2',
              },
            ],
          },
        },
      },
    },
  },
];

export const navigationItems: QuaireNavigationItem[] = [
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
    parentId: null,
    name: 'Category 2',
  },
];