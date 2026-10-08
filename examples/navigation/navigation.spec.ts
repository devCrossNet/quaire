import { Quaire } from '../../src';
import { navigation, questions } from './data';

describe('navigation', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  const answerAllQuestions = () => {
    Q.saveAnswer('Jane');
    Q.saveAnswer(42);
    Q.saveAnswer('email');
    Q.saveAnswer('jane@example.com');
  };

  test('should show the initial navigation with categories and subcategories', () => {
    expect(Q.getNavigation()).toMatchObject([
      {
        id: 1,
        title: 'Personal',
        icon: 'user',
        question: null,
        value: null,
        active: true,
        isValid: false,
        hasValue: false,
        reachable: true,
        children: [
          { id: 2, title: 'Name', active: true, isValid: false, hasValue: false, reachable: true },
          { id: 3, title: 'Age', active: false, isValid: true, hasValue: false, reachable: true },
        ],
      },
      {
        id: 4,
        title: 'Contact',
        icon: 'phone',
        active: false,
        isValid: false,
        hasValue: false,
        reachable: true,
        children: [{ id: 5, title: 'Details', isValid: false, reachable: true }],
      },
    ]);
  });

  test('should show the answers in the navigation', () => {
    answerAllQuestions();

    expect(Q.isComplete()).toBe(true);
    expect(Q.getNavigation()).toMatchObject([
      {
        id: 1,
        value: null,
        isValid: true,
        hasValue: true,
        children: [
          { id: 2, value: 'Jane' },
          { id: 3, value: 42 },
        ],
      },
      {
        id: 4,
        value: 'E-Mail', // label of the selected option
        active: true,
        children: [{ id: 5, value: 'jane@example.com', active: true }],
      },
    ]);
  });

  test('should jump to a question via the navigation', () => {
    answerAllQuestions();

    // category without own question: jumps to the first subcategory
    Q.goToNavigationItem(1);
    expect(Q.getActiveQuestion().title).toBe('What is your name?');

    // category with own question
    Q.goToNavigationItem(4);
    expect(Q.getActiveQuestion().title).toBe('How should we contact you?');

    // subcategory
    Q.goToNavigationItem(3);
    expect(Q.getActiveQuestion().title).toBe('How old are you?');
  });

  test('should continue with the next question after changing an answer', () => {
    answerAllQuestions();

    Q.goTo(1);
    Q.saveAnswer('John');

    expect(Q.getActiveQuestion().title).toBe('How old are you?');
    expect(Q.getResult()).toEqual({ name: 'John', age: 42, contact: 'email', contactDetails: 'jane@example.com' });
  });
});
