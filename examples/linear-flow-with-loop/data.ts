import { QuaireComponentType, QuaireItem, QuaireNavigationItem } from '../../src';

export const items: Array<QuaireItem> = [
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
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'Question 2',
    description: 'Description 2',
    required: true,
    selectOptions: [
      {
        label: 'Option 1',
        value: 'option 1',
        nextItemId: 3,
      },
      {
        label: 'Option 2',
        value: 'option 2',
        nextItemId: 3,
      },
    ],
  },
  {
    id: 3,
    resultProperty: 'baz',
    navigationItemId: 3,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'Question 3',
    description: 'Description 3',
    required: true,
    selectOptions: [
      {
        label: 'Option 1',
        value: 'option 1',
      },
      {
        label: 'Option 2',
        value: 'option 2',
        nextItemId: 1,
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
