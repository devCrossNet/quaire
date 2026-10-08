import type { QuaireComponent, QuaireQuestionDefinition, QuaireQuestionDefinitionBase } from '../../src';

// a custom component type with its own properties
export type RatingDefinition = QuaireQuestionDefinitionBase<'RATING', { stars: number }>;

// all built-in types plus the custom type
export type MyQuestionDefinition = QuaireQuestionDefinition | RatingDefinition;

export const rating: QuaireComponent<RatingDefinition> = {
  // the answer must be a whole number between 1 and the number of stars
  validate: (definition, value) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= definition.stars
      ? null
      : 'INVALID_RATING',
  // the navigation shows "4 / 5" instead of 4
  getDisplayValue: (definition, value) => `${value} / ${definition.stars}`,
};
