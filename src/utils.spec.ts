import { getByPath } from './utils';

describe('getByPath', () => {
  const object = { a: { b: [{ c: 'value' }] } };

  test('should return the value at the path', () => {
    expect(getByPath(object, ['a', 'b', '0', 'c'], null)).toBe('value');
  });

  test('should return the default value for a missing path', () => {
    expect(getByPath(object, ['a', 'x', 'c'], null)).toBeNull();
    expect(getByPath(undefined, ['a'], null)).toBeNull();
  });

  test('should return the default value for an empty path', () => {
    expect(getByPath(object, [], null)).toBeNull();
  });
});
