import type { QuaireQuestionDefinition } from '../../src';

export const questions: Array<QuaireQuestionDefinition> = [
  {
    id: 'age',
    type: 'INPUT',
    key: 'age',
    title: 'How old are you?',
    inputType: 'number',
    required: true,
    min: 0,
    max: 120,
    // the first matching condition wins, an entry without condition is the fallback
    next: [{ when: { age: { lt: 18 } }, to: 'consent' }, { to: 'employment' }],
  },
  {
    id: 'consent',
    type: 'BOOLEAN',
    key: 'consent',
    title: 'Do your parents agree?',
    required: true,
    // without consent, the flow ends here
    next: [{ when: { consent: true }, to: 'interests' }],
  },
  {
    id: 'employment',
    type: 'SINGLE_SELECT',
    key: 'employment',
    title: 'What do you do?',
    required: true,
    options: [
      { label: 'Employed', value: 'employed', next: 'income' },
      { label: 'Self-employed', value: 'self-employed', next: 'income' },
      { label: 'Student', value: 'student', next: 'interests' },
    ],
  },
  {
    id: 'income',
    type: 'INPUT',
    key: 'income',
    title: 'What is your yearly income?',
    inputType: 'number',
    next: 'interests',
  },
  {
    id: 'interests',
    type: 'MULTI_SELECT',
    key: 'interests',
    title: 'What are you interested in?',
    required: true,
    options: [
      { label: 'Sports', value: 'sports' },
      { label: 'Music', value: 'music' },
      { label: 'Travel', value: 'travel' },
    ],
    // a multi-select answer matches if it contains the value
    next: [{ when: { interests: 'travel' }, to: 'destination' }],
  },
  {
    id: 'destination',
    type: 'INPUT',
    key: 'destination',
    title: 'Where do you want to travel next?',
    // a function can be used for conditions that are not possible with data
    variants: [
      {
        when: (result) => Number(result.income) > 100000,
        placeholder: 'Maldives',
      },
    ],
  },
];
