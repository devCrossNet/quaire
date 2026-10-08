import type { QuaireQuestionDefinition } from '../../src';

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 1,
    type: 'INPUT',
    key: 'email',
    title: 'What is your e-mail address?',
    inputType: 'email',
    required: true,
    pattern: '^[^@\\s]+@[^@\\s]+$',
    next: 2,
  },
  {
    id: 2,
    type: 'INPUT',
    key: 'username',
    title: 'Choose a username',
    required: true,
    minLength: 3,
    maxLength: 12,
    // custom validators run after the built-in checks and return their own error codes
    validate: (value) => (value === 'admin' ? 'RESERVED' : null),
    next: 3,
  },
  {
    id: 3,
    type: 'INPUT',
    key: 'age',
    title: 'How old are you?',
    inputType: 'number',
    min: 18,
    max: 120,
    next: 4,
  },
  {
    id: 4,
    type: 'MULTI_SELECT',
    key: 'topics',
    title: 'Choose one or two topics',
    required: true,
    minSelected: 1,
    maxSelected: 2,
    options: [
      { label: 'News', value: 'news' },
      { label: 'Sports', value: 'sports' },
      { label: 'Tech', value: 'tech' },
    ],
  },
];

// map error codes to messages in your view
export const messages: Record<string, string> = {
  REQUIRED: 'Please answer this question.',
  PATTERN: 'Please enter a valid e-mail address.',
  MIN_LENGTH: 'Please use at least 3 characters.',
  MAX_LENGTH: 'Please use at most 12 characters.',
  RESERVED: 'This username is reserved.',
  MIN: 'You must be at least 18 years old.',
  MAX: 'Please check your age.',
  TOO_FEW: 'Please choose at least one topic.',
  TOO_MANY: 'Please choose at most two topics.',
};
