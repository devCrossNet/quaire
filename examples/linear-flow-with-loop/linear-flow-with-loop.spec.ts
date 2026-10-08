import { Quaire } from '../../src';
import { navigation, questions } from './data';

describe('linear-flow-with-loop', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  test('should go back to question 1 after the last question', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer('option 2');
    Q.saveAnswer('option 2');

    expect(Q.getActiveQuestion().title).toBe('Question 1');
    expect(Q.getResult()).toEqual({ foo: 'option 1', bar: 'option 2', baz: 'option 2' });
    expect(Q.isComplete()).toBe(false);
  });

  test('should keep the answers when the loop starts again', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer('option 2');
    Q.saveAnswer('option 2');
    Q.saveAnswer('option 2');

    expect(Q.getActiveQuestion().title).toBe('Question 2');
    expect(Q.getResult()).toEqual({ foo: 'option 2', bar: 'option 2', baz: 'option 2' });
  });

  test('should complete the flow with option 1 of the last question', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer('option 2');
    Q.saveAnswer('option 1');

    expect(Q.isComplete()).toBe(true);
  });
});
