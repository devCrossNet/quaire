import { QuaireComponentType, QuaireItem, QuaireNavigationItem } from '../../src';

export const items: Array<QuaireItem> = [
  {
    id: 1,
    resultProperty: 'name',
    navigationItemId: 2,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.INPUT,
    question: 'What is your name?',
    description: '',
    required: true,
    inputOption: {
      type: 'text',
      nextItemId: 2,
    },
  },
  {
    id: 2,
    resultProperty: 'age',
    navigationItemId: 3,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.INPUT,
    question: 'How old are you?',
    description: '',
    required: false,
    inputOption: {
      type: 'number',
      nextItemId: 3,
    },
  },
  {
    id: 3,
    resultProperty: 'contact',
    navigationItemId: 4,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.SINGLE_SELECT,
    question: 'How should we contact you?',
    description: '',
    required: true,
    selectOptions: [
      {
        label: 'E-Mail',
        value: 'email',
        nextItemId: 4,
      },
      {
        label: 'Phone',
        value: 'phone',
        nextItemId: 4,
      },
    ],
  },
  {
    id: 4,
    resultProperty: 'contactDetails',
    navigationItemId: 5,
    dependsOnResultProperties: [],
    componentType: QuaireComponentType.INPUT,
    question: 'Where can we reach you?',
    description: '',
    required: true,
    inputOption: {
      type: 'text',
    },
  },
];

export const navigationItems: Array<QuaireNavigationItem> = [
  {
    id: 1,
    parentId: null,
    name: 'Personal', // has no own question, only children
    icon: 'user',
  },
  {
    id: 2,
    parentId: 1,
    name: 'Name',
  },
  {
    id: 3,
    parentId: 1,
    name: 'Age',
  },
  {
    id: 4,
    parentId: null,
    name: 'Contact', // has an own question and children
    icon: 'phone',
  },
  {
    id: 5,
    parentId: 4,
    name: 'Details',
  },
];
