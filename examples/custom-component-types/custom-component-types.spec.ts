import { Quaire, validateDefinition } from '../../src';
import { navigation, questions } from './data';
import { MyQuestionDefinition, rating } from './rating';

describe('custom-component-types', () => {
  let Q: Quaire<object, MyQuestionDefinition>;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation, components: { RATING: rating } });
  });

  test('should have a valid definition', () => {
    expect(validateDefinition({ questions, navigation, components: { RATING: rating } })).toEqual([]);
  });

  test('should validate the custom component', () => {
    Q.saveAnswer(6);

    expect(Q.getActiveQuestion().error).toBe('INVALID_RATING');
  });

  test('should ask for improvements after a bad rating', () => {
    Q.saveAnswer(2);
    expect(Q.getActiveQuestion().type).toBe('MULTI_SELECT');

    Q.saveAnswer(['docs', 'api']);
    Q.saveAnswer(true);

    expect(Q.isComplete()).toBe(true);
    expect(Q.getNavigation()).toMatchObject([
      { id: 1, value: '2 / 5', children: [{ id: 2, value: ['Documentation', 'API'] }] },
      { id: 3, value: 'Yes' },
    ]);
  });

  test('should skip the improvements after a good rating', () => {
    Q.saveAnswer(5);
    expect(Q.getActiveQuestion().type).toBe('BOOLEAN');

    Q.saveAnswer(false);
    expect(Q.getResult()).toEqual({ rating: 5, recommend: false });
  });
});
