import { QuaireComponentType } from '../../src';
import { MyItem, MyNavigationItem } from './MyQuaire';

export const items: Array<MyItem> = [
  {
    id: 1,
    resultProperty: 'foo',
    navigationItemId: 1,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.RANGE_SLIDER,
    question: 'Question 1',
    description: 'Description 1',
    required: true,
    progress: 50,
    rangeOption: {
      range: [1, 100],
      divisor: 10,
      unit: '%',
      nextItemId: 2,
    },
  },
  {
    id: 2,
    resultProperty: 'bar',
    navigationItemId: 2,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.RANGE_SLIDER,
    question: 'Question 2',
    description: 'Description 2',
    required: true,
    progress: 100,
    rangeOption: {
      range: [1, 5],
      divisor: 100,
      unit: 'km/h',
      nextItemId: 1,
    },
  },
];

export const navigationItems: Array<MyNavigationItem> = [
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
];
