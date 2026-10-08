import type { QuaireNavigationDefinition, QuaireQuestionDefinition } from '../../src';

// custom properties for all questions
export type MyQuestionDefinition = QuaireQuestionDefinition & {
  progress: number;
  unit?: string;
};

// custom properties for all navigation items
export type MyNavigationDefinition = QuaireNavigationDefinition & {
  color: string;
};

export const questions: Array<MyQuestionDefinition> = [
  {
    id: 1,
    type: 'RANGE',
    key: 'foo',
    title: 'Question 1',
    navigationId: 1,
    required: true,
    progress: 50,
    unit: '%',
    min: 1,
    max: 100,
    next: 2,
  },
  {
    id: 2,
    type: 'SINGLE_SELECT',
    key: 'bar',
    title: 'Question 2',
    navigationId: 2,
    required: true,
    progress: 100,
    options: [
      { label: 'Car', value: 'car', icon: 'car' }, // options can have custom properties, too
      { label: 'Bike', value: 'bike', icon: 'bike' },
    ],
  },
];

export const navigation: Array<MyNavigationDefinition> = [
  { id: 1, title: 'Category 1', color: 'blue' },
  { id: 2, parentId: 1, title: 'Subcategory 1', color: 'green' },
];
