import isNil from 'lodash.isnil';

export const hasAnswer = (answer: any) => {
  return Array.isArray(answer) ? answer.length > 0 : isNil(answer) === false;
};
