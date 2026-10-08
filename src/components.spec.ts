import { defaultComponents } from './components.js';
import { QuaireErrorCode } from './constants.js';
import type { QuaireResolvedDefinition, QuaireQuestionDefinition } from './types.js';

describe('defaultComponents', () => {
  const options = [
    { label: 'A', value: 'a', next: 2 },
    { label: 'B', value: 'b', next: 3 },
    { label: 'C', value: 'c' },
  ];

  const definition = (properties: Record<string, unknown>) =>
    ({
      id: 1,
      key: 'foo',
      title: 'Foo',
      ...properties,
    }) as unknown as QuaireResolvedDefinition<QuaireQuestionDefinition>;

  describe('SINGLE_SELECT', () => {
    const { validate, getNext, getDisplayValue } = defaultComponents.SINGLE_SELECT;
    const select = definition({ type: 'SINGLE_SELECT', options });

    test('should only accept option values', () => {
      expect(validate(select, 'a')).toBeNull();
      expect(validate(select, 'x')).toBe(QuaireErrorCode.INVALID_OPTION);
    });

    test('should use the next question of the selected option', () => {
      expect(getNext(select, 'b')).toBe(3);
      expect(getNext(select, 'c')).toBeUndefined();
    });

    test('should use the next question of all options for unanswered questions', () => {
      const sameNext = definition({
        type: 'SINGLE_SELECT',
        options: options.map((option) => ({ ...option, next: 2 })),
      });

      expect(getNext(sameNext, undefined)).toBe(2);
      expect(getNext(select, undefined)).toBeUndefined();
    });

    test('should show the label of the selected option', () => {
      expect(getDisplayValue(select, 'a')).toBe('A');
      expect(getDisplayValue(select, 'x')).toBeUndefined();
    });
  });

  describe('MULTI_SELECT', () => {
    const { validate, getNext, getDisplayValue } = defaultComponents.MULTI_SELECT;
    const select = definition({ type: 'MULTI_SELECT', options, minSelected: 1, maxSelected: 2 });

    test('should validate the selected values', () => {
      expect(validate(select, ['a', 'b'])).toBeNull();
      expect(validate(select, 'a')).toBe(QuaireErrorCode.INVALID_TYPE);
      expect(validate(select, ['a', 'x'])).toBe(QuaireErrorCode.INVALID_OPTION);
      expect(validate(select, ['a', 'b', 'c'])).toBe(QuaireErrorCode.TOO_MANY);
      expect(validate(definition({ type: 'MULTI_SELECT', options, minSelected: 2 }), ['a'])).toBe(
        QuaireErrorCode.TOO_FEW,
      );
      expect(validate(definition({ type: 'MULTI_SELECT', options }), ['a', 'b', 'c'])).toBeNull();
    });

    test('should use the first selected option with a next question', () => {
      expect(getNext(select, ['c', 'b'])).toBe(3);
      expect(getNext(select, ['c'])).toBeUndefined();
      expect(getNext(select, undefined)).toBeUndefined();
    });

    test('should show the labels of the selected options', () => {
      expect(getDisplayValue(select, ['b', 'a'])).toEqual(['A', 'B']);
      expect(getDisplayValue(select, 'a')).toBeUndefined();
    });
  });

  describe('BOOLEAN', () => {
    const { validate, getDisplayValue } = defaultComponents.BOOLEAN;
    const boolean = definition({ type: 'BOOLEAN', trueLabel: 'Yes', falseLabel: 'No' });

    test('should only accept booleans', () => {
      expect(validate(boolean, false)).toBeNull();
      expect(validate(boolean, 'yes')).toBe(QuaireErrorCode.INVALID_TYPE);
    });

    test('should show the labels', () => {
      expect(getDisplayValue(boolean, true)).toBe('Yes');
      expect(getDisplayValue(boolean, false)).toBe('No');
    });
  });

  describe('INPUT', () => {
    const { validate } = defaultComponents.INPUT;

    test('should validate numbers', () => {
      const input = definition({ type: 'INPUT', min: 1, max: 10 });

      expect(validate(input, 5)).toBeNull();
      expect(validate(input, 0)).toBe(QuaireErrorCode.MIN);
      expect(validate(input, 11)).toBe(QuaireErrorCode.MAX);
      expect(validate(definition({ type: 'INPUT' }), 100)).toBeNull();
    });

    test('should validate strings', () => {
      const input = definition({ type: 'INPUT', minLength: 2, maxLength: 5, pattern: '^[a-z]+$' });

      expect(validate(input, 'abc')).toBeNull();
      expect(validate(input, 'a')).toBe(QuaireErrorCode.MIN_LENGTH);
      expect(validate(input, 'abcdef')).toBe(QuaireErrorCode.MAX_LENGTH);
      expect(validate(input, 'ABC')).toBe(QuaireErrorCode.PATTERN);
      expect(validate(definition({ type: 'INPUT' }), 'anything')).toBeNull();
    });

    test('should only accept strings and numbers', () => {
      expect(validate(definition({ type: 'INPUT' }), true)).toBe(QuaireErrorCode.INVALID_TYPE);
    });
  });

  describe('RANGE', () => {
    const { validate } = defaultComponents.RANGE;
    const range = definition({ type: 'RANGE', min: 0, max: 100 });

    test('should accept a number or a [from, to] tuple', () => {
      expect(validate(range, 50)).toBeNull();
      expect(validate(range, [20, 80])).toBeNull();
    });

    test('should reject other values', () => {
      expect(validate(range, [1, 2, 3])).toBe(QuaireErrorCode.INVALID_TYPE);
      expect(validate(range, '50')).toBe(QuaireErrorCode.INVALID_TYPE);
    });

    test('should check the limits', () => {
      expect(validate(range, [-1, 50])).toBe(QuaireErrorCode.MIN);
      expect(validate(range, 101)).toBe(QuaireErrorCode.MAX);
    });
  });
});
