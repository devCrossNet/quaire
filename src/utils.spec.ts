import { hasValue, isNil, isSameId } from './utils.js';

describe('utils', () => {
  test('should detect null and undefined', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
  });

  test('should treat false and 0 as values', () => {
    expect(hasValue(false)).toBe(true);
    expect(hasValue(0)).toBe(true);
    expect(hasValue('text')).toBe(true);
    expect(hasValue(['a'])).toBe(true);
  });

  test('should treat null, undefined, empty strings and empty arrays as missing values', () => {
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue('')).toBe(false);
    expect(hasValue([])).toBe(false);
  });

  test('should compare string and number IDs', () => {
    expect(isSameId(1, '1')).toBe(true);
    expect(isSameId('a', 'a')).toBe(true);
    expect(isSameId(1, 2)).toBe(false);
    expect(isSameId(null, null)).toBe(false);
    expect(isSameId(1, undefined)).toBe(false);
  });
});
