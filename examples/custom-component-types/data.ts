import type { QuaireNavigationDefinition } from '../../src';
import type { MyQuestionDefinition } from './rating';

export const questions: Array<MyQuestionDefinition> = [
  {
    id: 1,
    type: 'RATING',
    key: 'rating',
    title: 'How do you like quaire?',
    navigationId: 1,
    required: true,
    stars: 5,
    next: [{ when: { rating: { lte: 2 } }, to: 2 }, { to: 3 }],
  },
  {
    id: 2,
    type: 'MULTI_SELECT',
    key: 'improvements',
    title: 'What can we improve?',
    navigationId: 2,
    required: true,
    options: [
      { label: 'Documentation', value: 'docs' },
      { label: 'Performance', value: 'performance' },
      { label: 'API', value: 'api' },
    ],
    next: 3,
  },
  {
    id: 3,
    type: 'BOOLEAN',
    key: 'recommend',
    title: 'Would you recommend quaire?',
    navigationId: 3,
    required: true,
    trueLabel: 'Yes',
    falseLabel: 'No',
  },
];

export const navigation: Array<QuaireNavigationDefinition> = [
  { id: 1, title: 'Rating' },
  { id: 2, parentId: 1, title: 'Improvements' },
  { id: 3, title: 'Recommendation' },
];
