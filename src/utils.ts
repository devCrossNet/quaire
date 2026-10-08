import type { QuaireId } from './types.js';

export const isNil = (value: unknown): value is null | undefined => value === null || value === undefined;

// default check if a question has an answer, false and 0 are answers
export const hasValue = (value: unknown) => {
  if (isNil(value) || value === '') {
    return false;
  }

  return Array.isArray(value) ? value.length > 0 : true;
};

// ids can be strings or numbers, e.g. from a CMS, so 1 and '1' are the same id
export const isSameId = (a: QuaireId | null | undefined, b: QuaireId | null | undefined) =>
  !isNil(a) && !isNil(b) && String(a) === String(b);
