import { Quaire } from '../../src';
import { items, navigationItems } from './data';

describe('navigation', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ items, navigationItems });
  });

  const answerAllQuestions = () => {
    Q.saveAnswer('Jane');
    Q.saveAnswer(42);
    Q.saveAnswer('email');
    Q.saveAnswer('jane@example.com');
  };

  test('should show the initial navigation with categories and subcategories', () => {
    expect(Q.getNavigation()).toEqual([
      {
        id: 1,
        name: 'Personal',
        value: null,
        icon: 'user',
        active: true,
        isValid: false,
        hasValue: false,
        componentType: null,
        subNavigation: [
          {
            id: 2,
            name: 'Name',
            value: null,
            icon: undefined,
            active: true,
            isValid: false,
            hasValue: false,
            componentType: 'INPUT',
          },
          {
            id: 3,
            name: 'Age',
            value: null,
            icon: undefined,
            active: false,
            isValid: true,
            hasValue: false,
            componentType: 'INPUT',
          },
        ],
      },
      {
        id: 4,
        name: 'Contact',
        value: null,
        icon: 'phone',
        active: false,
        isValid: false,
        hasValue: false,
        componentType: 'SINGLE_SELECT',
        subNavigation: [
          {
            id: 5,
            name: 'Details',
            value: null,
            icon: undefined,
            active: false,
            isValid: false,
            hasValue: false,
            componentType: 'INPUT',
          },
        ],
      },
    ]);
  });

  test('should show the answers in the navigation', () => {
    answerAllQuestions();

    expect(Q.isValid()).toBe(true);
    expect(Q.getNavigation()).toEqual([
      {
        id: 1,
        name: 'Personal',
        value: null,
        icon: 'user',
        active: false,
        isValid: true,
        hasValue: true,
        componentType: null,
        subNavigation: [
          {
            id: 2,
            name: 'Name',
            value: 'Jane',
            icon: undefined,
            active: false,
            isValid: true,
            hasValue: true,
            componentType: 'INPUT',
          },
          {
            id: 3,
            name: 'Age',
            value: 42,
            icon: undefined,
            active: false,
            isValid: true,
            hasValue: true,
            componentType: 'INPUT',
          },
        ],
      },
      {
        id: 4,
        name: 'Contact',
        value: 'E-Mail', // label of the selected option
        icon: 'phone',
        active: true,
        isValid: true,
        hasValue: true,
        componentType: 'SINGLE_SELECT',
        subNavigation: [
          {
            id: 5,
            name: 'Details',
            value: 'jane@example.com',
            icon: undefined,
            active: true,
            isValid: true,
            hasValue: true,
            componentType: 'INPUT',
          },
        ],
      },
    ]);
  });

  test('should jump to a question via the navigation', () => {
    answerAllQuestions();

    // category without own question: jumps to the first subcategory
    Q.setActiveQuestionByNavigationItemId(1);
    expect(Q.getActiveQuestion().question).toBe('What is your name?');

    // category with own question
    Q.setActiveQuestionByNavigationItemId(4);
    expect(Q.getActiveQuestion().question).toBe('How should we contact you?');

    // subcategory
    Q.setActiveQuestionByNavigationItemId(3);
    expect(Q.getActiveQuestion().question).toBe('How old are you?');
  });

  test('should continue with the next question after changing an answer', () => {
    answerAllQuestions();

    Q.setActiveQuestionByQuestionId(1);
    Q.saveAnswer('John');

    expect(Q.getActiveQuestion().question).toBe('How old are you?');
    expect(Q.getResult()).toEqual({
      name: 'John',
      age: 42,
      contact: 'email',
      contactDetails: 'jane@example.com',
    });
  });
});
