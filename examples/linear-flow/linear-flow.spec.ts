import { Quaire } from '../../src';
import { navigation, questions } from './data';

describe('linear-flow', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  test('should go through all questions in order', () => {
    expect(Q.getActiveQuestion().title).toBe('Question 1');

    Q.saveAnswer('option 1');
    expect(Q.getActiveQuestion().title).toBe('Question 2');

    Q.saveAnswer('option 2');
    expect(Q.getActiveQuestion().title).toBe('Question 3');

    Q.saveAnswer('option 1');
    expect(Q.getActiveQuestion().title).toBe('Question 3');
    expect(Q.isComplete()).toBe(true);
    expect(Q.getResult()).toEqual({ foo: 'option 1', bar: 'option 2', baz: 'option 1' });
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 1', active: false, children: [{ id: 2, value: 'Option 2', active: false }] },
      { id: 3, value: 'Option 1', active: true, children: [] },
    ]);
  });

  test('should stay on the question when the answer is not a valid option', () => {
    Q.saveAnswer('option 4');

    expect(Q.getActiveQuestion().title).toBe('Question 1');
    expect(Q.getErrors()).toEqual({ '1': 'INVALID_OPTION' });
  });
});
