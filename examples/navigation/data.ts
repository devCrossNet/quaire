import type { QuaireNavigationDefinition, QuaireQuestionDefinition } from '../../src';

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'INPUT',
    key: 'name',
    title: 'What is your name?',
    navigationId: 2,
    required: true,
    next: 2,
  },
  {
    id: 2,
    type: 'INPUT',
    key: 'age',
    title: 'How old are you?',
    navigationId: 3,
    inputType: 'number',
    next: 3,
  },
  {
    id: 3,
    type: 'SINGLE_SELECT',
    key: 'contact',
    title: 'How should we contact you?',
    navigationId: 4,
    required: true,
    options: [
      { label: 'E-Mail', value: 'email', next: 4 },
      { label: 'Phone', value: 'phone', next: 4 },
    ],
  },
  {
    id: 4,
    type: 'INPUT',
    key: 'contactDetails',
    title: 'Where can we reach you?',
    navigationId: 5,
    required: true,
  },
];

export const navigation: Array<QuaireNavigationDefinition> = [
  { id: 1, title: 'Personal', icon: 'user' }, // has no own question, only children
  { id: 2, parentId: 1, title: 'Name' },
  { id: 3, parentId: 1, title: 'Age' },
  { id: 4, title: 'Contact', icon: 'phone' }, // has an own question and children
  { id: 5, parentId: 4, title: 'Details' },
];
