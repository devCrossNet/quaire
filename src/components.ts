import { QuaireComponentType, QuaireErrorCode } from './constants.js';
import type {
  QuaireBooleanDefinition,
  QuaireComponent,
  QuaireComponents,
  QuaireInputDefinition,
  QuaireMultiSelectDefinition,
  QuaireRangeDefinition,
  QuaireSelectOption,
  QuaireSingleSelectDefinition,
} from './types.js';
import { hasValue } from './utils.js';

const findOption = (options: Array<QuaireSelectOption>, value: unknown) =>
  options.find((option) => option.value === value);

// an unanswered select question has a next question only if all options lead to the same question
const getCommonNext = (options: Array<QuaireSelectOption>) => {
  const nextIds = new Set(options.map((option) => String(option.next)));

  return nextIds.size === 1 ? options[0].next : undefined;
};

const singleSelect: QuaireComponent<QuaireSingleSelectDefinition> = {
  validate: (definition, value) => (findOption(definition.options, value) ? null : QuaireErrorCode.INVALID_OPTION),
  getNext: (definition, value) =>
    hasValue(value) ? findOption(definition.options, value)?.next : getCommonNext(definition.options),
  getDisplayValue: (definition, value) => findOption(definition.options, value)?.label,
};

const multiSelect: QuaireComponent<QuaireMultiSelectDefinition> = {
  validate: (definition, value) => {
    if (!Array.isArray(value)) {
      return QuaireErrorCode.INVALID_TYPE;
    }

    if (!value.every((item) => findOption(definition.options, item))) {
      return QuaireErrorCode.INVALID_OPTION;
    }

    if (definition.minSelected !== undefined && value.length < definition.minSelected) {
      return QuaireErrorCode.TOO_FEW;
    }

    if (definition.maxSelected !== undefined && value.length > definition.maxSelected) {
      return QuaireErrorCode.TOO_MANY;
    }

    return null;
  },
  // the first selected option with a next question wins
  getNext: (definition, value) =>
    Array.isArray(value)
      ? definition.options.find((option) => value.includes(option.value) && option.next !== undefined)?.next
      : getCommonNext(definition.options),
  getDisplayValue: (definition, value) =>
    Array.isArray(value)
      ? definition.options.filter((option) => value.includes(option.value)).map((option) => option.label)
      : undefined,
};

const boolean: QuaireComponent<QuaireBooleanDefinition> = {
  validate: (_definition, value) => (typeof value === 'boolean' ? null : QuaireErrorCode.INVALID_TYPE),
  getDisplayValue: (definition, value) => (value ? definition.trueLabel : definition.falseLabel),
};

const input: QuaireComponent<QuaireInputDefinition> = {
  validate: (definition, value) => {
    if (typeof value === 'number') {
      if (definition.min !== undefined && value < definition.min) {
        return QuaireErrorCode.MIN;
      }

      if (definition.max !== undefined && value > definition.max) {
        return QuaireErrorCode.MAX;
      }

      return null;
    }

    if (typeof value !== 'string') {
      return QuaireErrorCode.INVALID_TYPE;
    }

    if (definition.minLength !== undefined && value.length < definition.minLength) {
      return QuaireErrorCode.MIN_LENGTH;
    }

    if (definition.maxLength !== undefined && value.length > definition.maxLength) {
      return QuaireErrorCode.MAX_LENGTH;
    }

    if (definition.pattern !== undefined && !new RegExp(definition.pattern).test(value)) {
      return QuaireErrorCode.PATTERN;
    }

    return null;
  },
};

// the value is a number or a [from, to] tuple
const range: QuaireComponent<QuaireRangeDefinition> = {
  validate: (definition, value) => {
    const values = Array.isArray(value) ? value : [value];

    if (values.length > 2 || !values.every((item) => typeof item === 'number')) {
      return QuaireErrorCode.INVALID_TYPE;
    }

    if (values.some((item) => item < definition.min)) {
      return QuaireErrorCode.MIN;
    }

    if (values.some((item) => item > definition.max)) {
      return QuaireErrorCode.MAX;
    }

    return null;
  },
};

export const defaultComponents: QuaireComponents = {
  [QuaireComponentType.SINGLE_SELECT]: singleSelect,
  [QuaireComponentType.MULTI_SELECT]: multiSelect,
  [QuaireComponentType.BOOLEAN]: boolean,
  [QuaireComponentType.INPUT]: input,
  [QuaireComponentType.RANGE]: range,
};
