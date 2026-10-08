import type { QuaireNavigationDefinition, QuaireQuestionDefinition } from '../../src';

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'SINGLE_SELECT',
    key: 'foo',
    title: 'Question 1',
    navigationId: 1,
    required: true,
    options: [
      { label: 'Option 1', value: 'option 1', next: 2 }, // branch A
      { label: 'Option 2', value: 'option 2', next: 3 }, // branch B
    ],
  },
  {
    id: 2, // branch A
    type: 'RANGE',
    key: 'bar',
    title: 'Question 2',
    navigationId: 2,
    min: 0,
    max: 100,
    defaultValue: [50, 75],
    next: 4,
  },
  {
    id: 3, // branch B
    type: 'INPUT',
    key: 'baz',
    title: 'Question 3',
    navigationId: 2,
    defaultValue: 'user input',
    next: 4,
  },
  {
    id: 4, // both branches merge here
    type: 'SINGLE_SELECT',
    key: 'foobarbaz',
    title: 'Question 4',
    navigationId: 3,
    options: [
      { label: 'Option 1', value: 'option 1' },
      { label: 'Option 2', value: 'option 2' },
    ],
  },
];

export const navigation: Array<QuaireNavigationDefinition> = [
  { id: 1, title: 'Category 1' },
  { id: 2, parentId: 1, title: 'Subcategory 1' },
  { id: 3, title: 'Category 2' },
];
