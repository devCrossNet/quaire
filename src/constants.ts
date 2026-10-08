// answer for questions the user skipped on purpose, e.g. with a "skip" or "I don't know" button
export const NO_VALUE = 'NO_VALUE';

export const QuaireComponentType = {
  SINGLE_SELECT: 'SINGLE_SELECT',
  MULTI_SELECT: 'MULTI_SELECT',
  BOOLEAN: 'BOOLEAN',
  INPUT: 'INPUT',
  RANGE: 'RANGE',
} as const;

export type QuaireComponentType = (typeof QuaireComponentType)[keyof typeof QuaireComponentType];

export const QuaireErrorCode = {
  REQUIRED: 'REQUIRED',
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_OPTION: 'INVALID_OPTION',
  TOO_FEW: 'TOO_FEW',
  TOO_MANY: 'TOO_MANY',
  MIN: 'MIN',
  MAX: 'MAX',
  MIN_LENGTH: 'MIN_LENGTH',
  MAX_LENGTH: 'MAX_LENGTH',
  PATTERN: 'PATTERN',
} as const;

export type QuaireErrorCode = (typeof QuaireErrorCode)[keyof typeof QuaireErrorCode];

export const QuaireDefinitionProblemCode = {
  DUPLICATE_ID: 'DUPLICATE_ID',
  DUPLICATE_KEY: 'DUPLICATE_KEY',
  UNKNOWN_TYPE: 'UNKNOWN_TYPE',
  UNKNOWN_NEXT: 'UNKNOWN_NEXT',
  UNREACHABLE: 'UNREACHABLE',
  DUPLICATE_NAVIGATION_ID: 'DUPLICATE_NAVIGATION_ID',
  UNKNOWN_NAVIGATION: 'UNKNOWN_NAVIGATION',
  UNKNOWN_PARENT: 'UNKNOWN_PARENT',
} as const;

export type QuaireDefinitionProblemCode =
  (typeof QuaireDefinitionProblemCode)[keyof typeof QuaireDefinitionProblemCode];
