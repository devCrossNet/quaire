import type { QuaireDefinitionProblemCode, QuaireErrorCode } from './constants.js';

type DistributiveOmit<T, Key extends PropertyKey> = T extends unknown ? Omit<T, Key> : never;

export type QuaireId = string | number;

export type QuaireResult = Record<string, unknown>;

// answers are missing until they are given and null when they became invalid
export type QuairePartialResult<Result extends object = QuaireResult> = {
  [Key in keyof Result]?: Result[Key] | null;
};

export type QuaireScalar = string | number | boolean | null;

// a value, a list of possible values, or a comparison
export type QuaireValueMatcher =
  | QuaireScalar
  | Array<QuaireScalar>
  | {
      gt?: number;
      gte?: number;
      lt?: number;
      lte?: number;
      answered?: boolean;
      not?: QuaireValueMatcher;
    };

// all answers must match, a function can be used for everything else
export type QuaireCondition = Record<string, QuaireValueMatcher> | ((result: QuaireResult) => boolean);

// a question ID, or a list of conditional targets where the first match wins
export type QuaireNext = QuaireId | Array<{ when?: QuaireCondition; to: QuaireId }>;

// built-in error codes, custom validators can return their own codes
export type QuaireError = QuaireErrorCode | (string & {});

export type QuaireValidator = (value: unknown, result: QuaireResult) => QuaireError | null | undefined;

// properties that every question has and that variants can change
export type QuaireQuestionProperties = {
  title: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  next?: QuaireNext;
};

export type QuaireVariant<Props extends object = object> = { when: QuaireCondition } & Partial<
  QuaireQuestionProperties & Props
>;

export type QuaireQuestionDefinitionBase<Type extends string = string, Props extends object = object> = {
  id: QuaireId;
  type: Type;
  key: string;
  navigationId?: QuaireId;
  validate?: QuaireValidator;
  variants?: Array<QuaireVariant<Props>>;
} & QuaireQuestionProperties &
  Props;

export type QuaireSelectOption = {
  [key: string]: unknown;
  label: string;
  value: string | number | boolean;
  next?: QuaireId;
};

export type QuaireSingleSelectDefinition = QuaireQuestionDefinitionBase<
  'SINGLE_SELECT',
  { options: Array<QuaireSelectOption> }
>;

export type QuaireMultiSelectDefinition = QuaireQuestionDefinitionBase<
  'MULTI_SELECT',
  { options: Array<QuaireSelectOption>; minSelected?: number; maxSelected?: number }
>;

export type QuaireBooleanDefinition = QuaireQuestionDefinitionBase<
  'BOOLEAN',
  { trueLabel?: string; falseLabel?: string }
>;

export type QuaireInputDefinition = QuaireQuestionDefinitionBase<
  'INPUT',
  {
    inputType?: string; // HTML input type, e.g. text, number, email
    placeholder?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  }
>;

export type QuaireRangeDefinition = QuaireQuestionDefinitionBase<'RANGE', { min: number; max: number; step?: number }>;

export type QuaireQuestionDefinition =
  | QuaireSingleSelectDefinition
  | QuaireMultiSelectDefinition
  | QuaireBooleanDefinition
  | QuaireInputDefinition
  | QuaireRangeDefinition;

// a definition with the matching variant applied
export type QuaireResolvedDefinition<Definition extends QuaireQuestionDefinitionBase = QuaireQuestionDefinition> =
  DistributiveOmit<Definition, 'variants'>;

export type QuaireQuestion<Definition extends QuaireQuestionDefinitionBase = QuaireQuestionDefinition> =
  QuaireResolvedDefinition<Definition> & {
    value: unknown;
    error: QuaireError | null;
    isValid: boolean;
    hasValue: boolean;
  };

// behavior of a component type, all functions are optional
export type QuaireComponent<Definition extends QuaireQuestionDefinitionBase = QuaireQuestionDefinitionBase> = {
  // default: the value is not null, undefined, an empty string or an empty array
  hasValue?(value: unknown): boolean;
  // runs for answered questions after the required check
  validate?(definition: QuaireResolvedDefinition<Definition>, value: unknown): QuaireError | null;
  // next question based on the answer, the value is missing for unanswered questions
  getNext?(definition: QuaireResolvedDefinition<Definition>, value: unknown): QuaireId | undefined;
  // value that is shown in the navigation
  getDisplayValue?(definition: QuaireResolvedDefinition<Definition>, value: unknown): unknown;
};

export type QuaireComponents = Record<string, QuaireComponent>;

export type QuaireNavigationDefinition = {
  id: QuaireId;
  parentId?: QuaireId | null;
  title: string;
  icon?: string;
};

export type QuaireNavigationItem<
  NavigationDefinition extends QuaireNavigationDefinition = QuaireNavigationDefinition,
  Question = QuaireQuestion,
> = Omit<NavigationDefinition, 'parentId'> & {
  question: Question | null;
  value: unknown;
  active: boolean;
  hasValue: boolean;
  isValid: boolean;
  reachable: boolean;
  children?: Array<QuaireNavigationItem<NavigationDefinition, Question>>;
};

export type QuaireProgress = {
  answered: number;
  total: number;
};

export type QuaireState<
  Result extends object = QuaireResult,
  Question = QuaireQuestion,
  NavigationItem = QuaireNavigationItem,
> = {
  activeQuestion: Question | null;
  result: QuairePartialResult<Result>;
  errors: Record<string, QuaireError>;
  navigation: Array<NavigationItem>;
  path: Array<QuaireId>;
  progress: QuaireProgress;
  isValid: boolean;
  isComplete: boolean;
  canGoBack: boolean;
};

export type QuaireOptions<
  Result extends object = QuaireResult,
  Definition extends QuaireQuestionDefinitionBase = QuaireQuestionDefinition,
  NavigationDefinition extends QuaireNavigationDefinition = QuaireNavigationDefinition,
> = {
  questions: Array<Definition>;
  navigation?: Array<NavigationDefinition>;
  result?: QuairePartialResult<Result>;
  components?: QuaireComponents;
};

export type QuaireDefinitionProblem = {
  code: QuaireDefinitionProblemCode;
  message: string;
  questionId?: QuaireId;
  navigationId?: QuaireId;
};
