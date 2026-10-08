import type { QuaireQuestionDefinition } from '../../src';

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'SINGLE_SELECT',
    key: 'size',
    title: 'Which size do you need?',
    required: true,
    options: [
      { label: 'Small', value: 's' },
      { label: 'Medium', value: 'm' },
      { label: 'Large', value: 'l' },
    ],
    next: 2,
  },
  {
    id: 2,
    type: 'BOOLEAN',
    key: 'gift',
    title: 'Is it a gift?',
    required: true,
    next: [{ when: { gift: true }, to: 3 }, { to: 4 }],
  },
  {
    id: 3,
    type: 'INPUT',
    key: 'message',
    title: 'Your gift message',
    maxLength: 200,
    next: 4,
  },
  {
    id: 4,
    type: 'INPUT',
    key: 'address',
    title: 'Where should we send it?',
    required: true,
  },
];
