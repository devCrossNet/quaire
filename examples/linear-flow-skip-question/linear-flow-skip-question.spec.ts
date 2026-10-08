import { NO_VALUE, Quaire } from '../../src';
import { navigation, questions } from './data';

describe('linear-flow-skip-question', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  test('should skip question 2 when option 2 is chosen', () => {
    Q.saveAnswer('option 2');
    expect(Q.getActiveQuestion().title).toBe('Question 3');

    Q.saveAnswer('option 1');
    expect(Q.isComplete()).toBe(true);
    expect(Q.getResult()).toEqual({ foo: 'option 2', baz: 'option 1' });
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 2', children: [{ id: 2, value: null, hasValue: false, reachable: false }] },
      { id: 3, value: 'Option 1' },
    ]);
  });

  test('should save NO_VALUE when question 2 is skipped', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer(NO_VALUE);
    expect(Q.getActiveQuestion().title).toBe('Question 3');

    Q.saveAnswer('option 1');
    expect(Q.getResult()).toEqual({ foo: 'option 1', bar: NO_VALUE, baz: 'option 1' });
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 1', children: [{ id: 2, value: NO_VALUE, hasValue: true, reachable: true }] },
      { id: 3, value: 'Option 1' },
    ]);
  });
});
