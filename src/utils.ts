export const isNil = (value: any) => value === null || value === undefined;

export const hasAnswer = (answer: any) => (Array.isArray(answer) ? answer.length > 0 : isNil(answer) === false);

export const getByPath = (object: any, path: Array<string>, defaultValue: any = undefined) => {
  if (path.length === 0) {
    return defaultValue;
  }

  const value = path.reduce((current, key) => (isNil(current) ? undefined : current[key]), object);

  return value === undefined ? defaultValue : value;
};
