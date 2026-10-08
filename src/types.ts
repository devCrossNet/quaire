import { QuaireComponentType, QuaireValidationError } from './enums';

export type QuaireResult = Record<string, unknown>;

// answers are missing until they are given and null when they became invalid
export type QuairePartialResult<Result extends object = QuaireResult> = {
  [Key in keyof Result]?: Result[Key] | null;
};

export type QuaireBase<
  Question extends QuaireQuestion = QuaireQuestion,
  NavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
  Result extends object = QuaireResult,
> = {
  saveAnswer(answer: unknown): void;
  getActiveQuestion(): Question | null;
  getResult(): QuairePartialResult<Result>;
  getValidationErrors(): Record<number, QuaireValidationError>;
  setActiveQuestionByNavigationItemId(navigationItemId: number): void;
  setActiveQuestionByQuestionId(questionId: number): void;
  isValid(): boolean;
  getNavigation(): Array<NavigationItem>;
};

export type QuaireOptions<
  Item extends QuaireItem = QuaireItem,
  NavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
  Result extends object = QuaireResult,
> = {
  items: Array<Item>;
  navigationItems?: Array<NavigationItem>;
  result?: QuairePartialResult<Result>;
};

export type QuaireItemOption = {
  [key: string]: unknown | QuaireItemOption;
  label?: string;
  value?: unknown;
  nextItemId?: number;
};

export type QuaireRangeItemOption = {
  [key: string]: unknown | QuaireRangeItemOption;
  range?: Array<number>;
  nextItemId?: number;
};

export type QuaireInputItemOption = {
  [key: string]: unknown | QuaireInputItemOption;
  type?: string; // HTML input type e.g. text, number, date, etc.
  placeholder?: string;
  nextItemId?: number;
};

export type QuaireItem = {
  id: number;
  question: string;
  description: string;
  required: boolean;
  resultProperty: string;
  dependsOnResultProperties: Array<string>;
  componentType: QuaireComponentType | string;
  navigationItemId?: number;
  selectOptions?: Array<QuaireItemOption> | QuaireItemOption;
  rangeOption?: QuaireRangeItemOption;
  inputOption?: QuaireInputItemOption;
  defaultValue?: unknown;
  nextItemId?: number;
};

export type QuaireNavigationItem = {
  id: number;
  name: string;
  value?: unknown;
  icon?: string;
  parentId?: number | null;
  active?: boolean;
  isValid?: boolean;
  hasValue?: boolean;
  subNavigation?: Array<QuaireNavigationItem>;
  componentType?: QuaireComponentType | string | null;
};

export type QuaireQuestion = {
  id: number;
  navigationItemId?: number;
  question: string;
  description: string;
  required: boolean;
  resultProperty: string;
  value: unknown;
  valueHasChanged?: boolean;
  componentType: QuaireComponentType | string;
  isValid: boolean;
  dependsOnQuestions: Array<QuaireQuestion>;
  selectOptions?: Array<QuaireItemOption> | null;
  rangeOption?: QuaireRangeItemOption | null;
  inputOption?: QuaireInputItemOption | null;
  defaultValue?: unknown;
  nextItemId?: number;
};
