import type { QuaireNavigationDefinition, QuaireQuestionDefinition, QuaireSelectOption } from '../../src';

const options = (...values: Array<string>): Array<QuaireSelectOption> =>
  values.map((value) => ({ label: value.replace('option', 'Option'), value }));

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'SINGLE_SELECT',
    key: 'foo',
    title: 'Question 1',
    navigationId: 1,
    required: true,
    options: options('option 1', 'option 2').map((option) => ({ ...option, next: 2 })),
  },
  {
    id: 2,
    type: 'SINGLE_SELECT',
    key: 'bar',
    title: 'Question 2',
    navigationId: 2,
    required: true,
    options: [],
    next: 3,
    // the options depend on the answer to question 1
    variants: [
      { when: { foo: 'option 1' }, options: options('option 1.1', 'option 1.2') },
      { when: { foo: 'option 2' }, options: options('option 2.1', 'option 2.2') },
    ],
  },
  {
    id: 3,
    type: 'SINGLE_SELECT',
    key: 'baz',
    title: 'Question 3',
    navigationId: 3,
    required: true,
    options: [],
    // the options depend on the answers to question 1 and question 2
    variants: [
      { when: { foo: 'option 1', bar: 'option 1.1' }, options: options('option 1.1.1', 'option 1.1.2') },
      { when: { foo: 'option 1', bar: 'option 1.2' }, options: options('option 1.2.1', 'option 1.2.2') },
      { when: { foo: 'option 2', bar: 'option 2.1' }, options: options('option 2.1.1', 'option 2.1.2') },
      { when: { foo: 'option 2', bar: 'option 2.2' }, options: options('option 2.2.1', 'option 2.2.2') },
    ],
  },
];

export const navigation: Array<QuaireNavigationDefinition> = [
  { id: 1, title: 'Category 1' },
  { id: 2, parentId: 1, title: 'Subcategory 1' },
  { id: 3, title: 'Category 2' },
];
