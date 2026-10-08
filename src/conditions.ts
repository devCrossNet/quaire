import type { QuaireCondition, QuaireResult, QuaireValueMatcher } from './types.js';
import { hasValue, isNil } from './utils.js';

// multi-select answers match if they contain the expected value
const matchesScalar = (value: unknown, expected: unknown) =>
  Array.isArray(value) ? value.includes(expected) : value === expected;

export const matchesValue = (value: unknown, matcher: QuaireValueMatcher): boolean => {
  if (Array.isArray(matcher)) {
    return matcher.some((expected) => matchesScalar(value, expected));
  }

  if (isNil(matcher) || typeof matcher !== 'object') {
    return matchesScalar(value, matcher);
  }

  const { gt, gte, lt, lte, answered, not } = matcher;
  const isNumber = typeof value === 'number';

  return (
    (answered === undefined || answered === hasValue(value)) &&
    (gt === undefined || (isNumber && value > gt)) &&
    (gte === undefined || (isNumber && value >= gte)) &&
    (lt === undefined || (isNumber && value < lt)) &&
    (lte === undefined || (isNumber && value <= lte)) &&
    (not === undefined || !matchesValue(value, not))
  );
};

export const matchesCondition = (condition: QuaireCondition | undefined, result: QuaireResult): boolean => {
  if (condition === undefined) {
    return true;
  }

  if (typeof condition === 'function') {
    return condition(result);
  }

  return Object.entries(condition).every(([key, matcher]) => matchesValue(result[key], matcher));
};
