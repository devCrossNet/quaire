export const isNil = (value: unknown): value is null | undefined => value === null || value === undefined;

export const hasAnswer = (answer: unknown) => (Array.isArray(answer) ? answer.length > 0 : isNil(answer) === false);

export const getByPath = <T>(object: unknown, path: Array<string>, defaultValue: T): T => {
  if (path.length === 0) {
    return defaultValue;
  }

  const value = path.reduce<unknown>(
    (current, key) => (isNil(current) ? undefined : (current as Record<string, unknown>)[key]),
    object,
  );

  return value === undefined ? defaultValue : (value as T);
};
