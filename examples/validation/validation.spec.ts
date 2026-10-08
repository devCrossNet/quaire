import { Quaire } from '../../src';
import { messages, questions } from './data';

describe('validation', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions });
  });

  const error = () => messages[Q.getActiveQuestion().error];

  test('should require an answer', () => {
    expect(error()).toBe('Please answer this question.');
    expect(Q.isValid()).toBe(false);
  });

  test('should stay on the question until the answer is valid', () => {
    Q.saveAnswer('not an e-mail');
    expect(error()).toBe('Please enter a valid e-mail address.');
    expect(Q.getActiveQuestion().id).toBe(1);

    Q.saveAnswer('jane@example.com');
    expect(Q.getActiveQuestion().id).toBe(2);
  });

  test('should check the length and run custom validators', () => {
    Q.saveAnswer('jane@example.com');

    Q.saveAnswer('jo');
    expect(error()).toBe('Please use at least 3 characters.');

    Q.saveAnswer('a-very-long-username');
    expect(error()).toBe('Please use at most 12 characters.');

    Q.saveAnswer('admin');
    expect(error()).toBe('This username is reserved.');

    Q.saveAnswer('jane');
    expect(Q.getActiveQuestion().id).toBe(3);
  });

  test('should check numbers and the number of selected options', () => {
    Q.saveAnswer('jane@example.com');
    Q.saveAnswer('jane');

    Q.saveAnswer(16);
    expect(error()).toBe('You must be at least 18 years old.');

    Q.saveAnswer(30);
    Q.saveAnswer(['news', 'sports', 'tech']);
    expect(error()).toBe('Please choose at most two topics.');

    Q.saveAnswer(['tech']);
    expect(Q.isValid()).toBe(true);
    expect(Q.isComplete()).toBe(true);
  });

  test('should skip optional questions', () => {
    Q.saveAnswer('jane@example.com');
    Q.saveAnswer('jane');
    Q.saveAnswer(null);

    expect(Q.getActiveQuestion().id).toBe(4);
    expect(Q.getResult()).toEqual({ email: 'jane@example.com', username: 'jane', age: null });
  });
});
