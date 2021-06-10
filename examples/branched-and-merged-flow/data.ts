import { QuaireComponentType, QuaireItem, QuaireNavigationItem } from '../../src';

export const items: Array<QuaireItem> = [
  {
    id: 1, // Branch A/B
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
        nextItemId: 2, // branch A
      },
      {
        label: 'Option 2',
        value: 'option 2',
        nextItemId: 3, // branch B
      },
    ],
  },
  {
    id: 2, // branch A
    resultProperty: 'bar',
    navigationItemId: 2,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.RANGE_SLIDER,
    question: 'Question 2',
    description: 'Description 2',
    required: false,
    rangeOption: {
      range: [0, 100],
      nextItemId: 4, // Branch A/B
    },
    defaultValue: [50, 75],
  },
  {
    id: 3, // branch B
    resultProperty: 'baz',
    navigationItemId: 2,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.INPUT,
    question: 'Question 3',
    description: 'Description 3',
    required: false,
    inputOption: {
      type: 'text',
      placeholder: 'baz',
      nextItemId: 4, // Branch A/B
    },
    defaultValue: 'user input',
  },
  {
    id: 4, // Branch A/B
    resultProperty: 'foobarbaz',
    navigationItemId: 3,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'Question 4',
    description: 'Description 4',
    required: false,
    selectOptions: [
      {
        label: 'Option 1',
        value: 'option 1',
      },
      {
        label: 'Option 2',
        value: 'option 2',
      },
    ],
  },
];

export const navigationItems: Array<QuaireNavigationItem> = [
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
