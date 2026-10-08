import { Quaire } from '../../src';
import { MyNavigationDefinition, MyQuestionDefinition, navigation, questions } from './data';

describe('extending-data-definition', () => {
  let Q: Quaire<object, MyQuestionDefinition, MyNavigationDefinition>;

  beforeEach(() => {
    Q = new Quaire({ questions, navigation });
  });

  test('should add custom properties to questions', () => {
    expect(Q.getActiveQuestion()).toMatchObject({ title: 'Question 1', progress: 50, unit: '%' });

    Q.saveAnswer([20, 25]);

    const question = Q.getActiveQuestion();

    expect(question.progress).toBe(100);
    expect(question.type === 'SINGLE_SELECT' && question.options[0].icon).toBe('car');
  });

  test('should add custom properties to navigation items', () => {
    Q.saveAnswer([20, 25]);

    const [category] = Q.getNavigation();

    expect(category).toMatchObject({ color: 'blue', value: [20, 25], question: { progress: 50, unit: '%' } });
    expect(category.children[0]).toMatchObject({ color: 'green', question: { progress: 100 } });
  });
});
