import { Quaire } from '../../src';
import { navigation, questions } from '../dependencies-between-questions/data';

describe('restore-state', () => {
  test('should restore the state from a complete result', () => {
    const Q = new Quaire({
      questions,
      navigation,
      result: { foo: 'option 1', bar: 'option 1.2', baz: 'option 1.2.1' },
    });

    expect(Q.getActiveQuestion().title).toBe('Question 3');
    expect(Q.isComplete()).toBe(true);
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 1', children: [{ id: 2, value: 'Option 1.2' }] },
      { id: 3, value: 'Option 1.2.1', active: true },
    ]);
  });

  test('should continue with the first open question of a partial result', () => {
    const Q = new Quaire({ questions, navigation, result: { foo: 'option 1', bar: 'option 1.2' } });

    expect(Q.getActiveQuestion()).toMatchObject({
      title: 'Question 3',
      options: [
        { label: 'Option 1.2.1', value: 'option 1.2.1' },
        { label: 'Option 1.2.2', value: 'option 1.2.2' },
      ],
    });
    expect(Q.canGoBack()).toBe(true);

    Q.back();
    expect(Q.getActiveQuestion().title).toBe('Question 2');
  });

  test('should continue with an invalid answer', () => {
    const Q = new Quaire({ questions, navigation, result: { foo: 'option 1', bar: 'option 2.1' } });

    expect(Q.getActiveQuestion().title).toBe('Question 2');
    expect(Q.getActiveQuestion().error).toBe('INVALID_OPTION');
  });

  test('should start at question 1 with an empty result', () => {
    const Q = new Quaire({ questions, navigation, result: {} });

    expect(Q.getActiveQuestion().title).toBe('Question 1');
    expect(Q.canGoBack()).toBe(false);
  });
});
