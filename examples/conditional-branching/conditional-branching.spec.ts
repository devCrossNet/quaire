import { Quaire, validateDefinition } from '../../src';
import { questions } from './data';

describe('conditional-branching', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions });
  });

  test('should have a valid definition', () => {
    expect(validateDefinition({ questions })).toEqual([]);
  });

  test('should end the flow for minors without consent', () => {
    Q.saveAnswer(15);
    expect(Q.getActiveQuestion().id).toBe('consent');

    Q.saveAnswer(false);
    expect(Q.isComplete()).toBe(true);
    expect(Q.getState().path).toEqual(['age', 'consent']);
  });

  test('should ask minors with consent about their interests', () => {
    Q.saveAnswer(15);
    Q.saveAnswer(true);

    expect(Q.getActiveQuestion().id).toBe('interests');
  });

  test('should ask adults about their employment and income', () => {
    Q.saveAnswer(30);
    Q.saveAnswer('employed');
    Q.saveAnswer(120000);
    Q.saveAnswer(['music', 'travel']);

    expect(Q.getActiveQuestion()).toMatchObject({ id: 'destination', placeholder: 'Maldives' });
    expect(Q.getState().path).toEqual(['age', 'employment', 'income', 'interests', 'destination']);
  });

  test('should skip the income for students', () => {
    Q.saveAnswer(21);
    Q.saveAnswer('student');
    Q.saveAnswer(['sports']);

    expect(Q.isComplete()).toBe(true);
    expect(Q.getResult()).toEqual({ age: 21, employment: 'student', interests: ['sports'] });
  });
});
