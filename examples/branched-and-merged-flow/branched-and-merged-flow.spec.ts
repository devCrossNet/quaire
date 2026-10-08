import { Quaire } from '../../src';
import { navigation, questions } from './data';

describe('branched-and-merged-flow', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  test('should go through branch A (range) and merge into question 4', () => {
    Q.saveAnswer('option 1');
    expect(Q.getActiveQuestion().title).toBe('Question 2');

    Q.saveAnswer(Q.getActiveQuestion().defaultValue);
    expect(Q.getActiveQuestion().title).toBe('Question 4');

    Q.saveAnswer('option 1');
    expect(Q.getResult()).toEqual({ foo: 'option 1', bar: [50, 75], foobarbaz: 'option 1' });
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 1', children: [{ id: 2, value: [50, 75] }] },
      { id: 3, value: 'Option 1', active: true },
    ]);
  });

  test('should go through branch B (input) and merge into question 4', () => {
    Q.saveAnswer('option 2');
    expect(Q.getActiveQuestion().title).toBe('Question 3');

    Q.saveAnswer(Q.getActiveQuestion().defaultValue);
    expect(Q.getActiveQuestion().title).toBe('Question 4');

    Q.saveAnswer('option 1');
    expect(Q.getResult()).toEqual({ foo: 'option 2', baz: 'user input', foobarbaz: 'option 1' });
    expect(Q.getNavigation()).toMatchObject([{ id: 1, children: [{ id: 2, value: 'user input' }] }, { id: 3 }]);
  });

  test('should remove the answers of branch A when the user switches to branch B', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer([20, 30]);
    Q.saveAnswer('option 2');
    Q.goTo(1);
    Q.saveAnswer('option 2');

    expect(Q.getActiveQuestion().title).toBe('Question 3');
    expect(Q.getResult()).toEqual({ foo: 'option 2', foobarbaz: 'option 2' });
  });
});
