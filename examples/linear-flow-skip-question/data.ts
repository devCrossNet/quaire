import { NO_VALUE } from '../../src';
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
      { label: 'Option 1', value: 'option 1', next: 2 },
      { label: 'Option 2', value: 'option 2', next: 3 }, // skips question 2
    ],
  },
  {
    id: 2,
    type: 'SINGLE_SELECT',
    key: 'bar',
    title: 'Question 2',
    navigationId: 2,
    options: [
      { label: 'Option 1', value: 'option 1', next: 3 },
      { label: 'Skip', value: NO_VALUE, next: 3 },
    ],
  },
  {
    id: 3,
    type: 'SINGLE_SELECT',
    key: 'baz',
    title: 'Question 3',
    navigationId: 3,
    required: true,
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
