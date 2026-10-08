import { matchesCondition, matchesValue } from './conditions.js';

describe('conditions', () => {
  describe('matchesValue', () => {
    test('should match equal values', () => {
      expect(matchesValue('a', 'a')).toBe(true);
      expect(matchesValue(false, false)).toBe(true);
      expect(matchesValue(null, null)).toBe(true);
      expect(matchesValue('a', 'b')).toBe(false);
    });

    test('should match multi-select answers that contain the value', () => {
      expect(matchesValue(['a', 'b'], 'b')).toBe(true);
      expect(matchesValue(['a', 'b'], 'c')).toBe(false);
    });

    test('should match one of a list of values', () => {
      expect(matchesValue('b', ['a', 'b'])).toBe(true);
      expect(matchesValue(['c', 'b'], ['a', 'b'])).toBe(true);
      expect(matchesValue('c', ['a', 'b'])).toBe(false);
    });

    test('should compare numbers', () => {
      expect(matchesValue(18, { gte: 18 })).toBe(true);
      expect(matchesValue(17, { gte: 18 })).toBe(false);
      expect(matchesValue(19, { gt: 18, lt: 20 })).toBe(true);
      expect(matchesValue(20, { lt: 20 })).toBe(false);
      expect(matchesValue(20, { lte: 20 })).toBe(true);
      expect(matchesValue(21, { lte: 20 })).toBe(false);
      expect(matchesValue(18, { gt: 18 })).toBe(false);
      expect(matchesValue('18', { gte: 18 })).toBe(false);
    });

    test('should check if a question is answered', () => {
      expect(matchesValue('a', { answered: true })).toBe(true);
      expect(matchesValue(undefined, { answered: true })).toBe(false);
      expect(matchesValue(null, { answered: false })).toBe(true);
    });

    test('should negate a matcher', () => {
      expect(matchesValue('a', { not: 'b' })).toBe(true);
      expect(matchesValue('a', { not: ['a', 'b'] })).toBe(false);
    });
  });

  describe('matchesCondition', () => {
    test('should match without a condition', () => {
      expect(matchesCondition(undefined, {})).toBe(true);
    });

    test('should match when all answers match', () => {
      const result = { country: 'DE', age: 30 };

      expect(matchesCondition({ country: 'DE', age: { gte: 18 } }, result)).toBe(true);
      expect(matchesCondition({ country: 'DE', age: { lt: 18 } }, result)).toBe(false);
    });

    test('should call a condition function with the result', () => {
      expect(matchesCondition((result) => result.age === 30, { age: 30 })).toBe(true);
    });
  });
});
