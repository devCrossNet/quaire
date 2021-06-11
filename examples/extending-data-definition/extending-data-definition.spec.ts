import { items, navigationItems } from './data';
import { MyQuaire } from './MyQuaire';

describe('extending-data-definition', () => {
  let Q: MyQuaire;

  beforeEach(() => {
    Q = new MyQuaire({ items, navigationItems });
  });

  test('should validate new component types based on dependent answers', () => {
    let activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');
    expect(activeQuestion.progress).toBe(50);
    expect(activeQuestion.rangeOption.unit).toBe('%');
    expect(activeQuestion.rangeOption.divisor).toBe(10);

    Q.saveAnswer([20, 25]);
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 2');
    expect(activeQuestion.progress).toBe(100);
    expect(activeQuestion.rangeOption.unit).toBe('km/h');
    expect(activeQuestion.rangeOption.divisor).toBe(100);

    Q.saveAnswer([2, 5]);
    activeQuestion = Q.getActiveQuestion();
    expect(activeQuestion.question).toBe('Question 1');
    expect(Q.getResult()).toEqual({
      foo: [20, 25],
      bar: [2, 5],
    });
    expect(Q.getNavigation()).toEqual([
      {
        active: true,
        componentType: 'RANGE_SLIDER',
        hasValue: true,
        id: 1,
        isValid: true,
        name: 'Category 1',
        subNavigation: [
          {
            active: false,
            componentType: 'RANGE_SLIDER',
            hasValue: true,
            id: 2,
            isValid: true,
            name: 'Subcategory 1',
            value: [2, 5],
            progress: 100,
            unit: 'km/h',
          },
        ],
        value: [20, 25],
        progress: 50,
        unit: '%',
      },
    ]);
  });
});
