import { Quaire } from '../../src';
import { navigation, questions } from './data';

describe('dependencies-between-questions', () => {
  let Q: Quaire;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  const optionValues = () => {
    const question = Q.getActiveQuestion();

    return question.type === 'SINGLE_SELECT' ? question.options.map((option) => option.value) : [];
  };

  test('should show the options based on the previous answers', () => {
    expect(optionValues()).toEqual(['option 1', 'option 2']);

    Q.saveAnswer('option 1');
    expect(optionValues()).toEqual(['option 1.1', 'option 1.2']);

    Q.saveAnswer('option 1.1');
    expect(optionValues()).toEqual(['option 1.1.1', 'option 1.1.2']);

    Q.saveAnswer('option 1.1.1');
    expect(Q.isComplete()).toBe(true);
    expect(Q.getResult()).toEqual({ foo: 'option 1', bar: 'option 1.1', baz: 'option 1.1.1' });
  });

  test('should reset and invalidate dependent questions when the first answer changes', () => {
    Q.saveAnswer('option 1');
    Q.saveAnswer('option 1.1');
    Q.saveAnswer('option 1.1.1');

    Q.goTo(1);
    Q.saveAnswer('option 2');

    expect(Q.getResult()).toEqual({ foo: 'option 2', bar: null, baz: null });
    expect(Q.isValid()).toBe(false);
    expect(Q.getErrors()).toEqual({ '2': 'REQUIRED', '3': 'REQUIRED' });
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: 'Option 2', isValid: false, children: [{ id: 2, value: null, active: true, isValid: false }] },
      { id: 3, value: null, isValid: false },
    ]);

    Q.saveAnswer('option 2.2');
    Q.saveAnswer('option 2.2.2');

    expect(Q.getResult()).toEqual({ foo: 'option 2', bar: 'option 2.2', baz: 'option 2.2.2' });
    expect(Q.isValid()).toBe(true);
  });
});
