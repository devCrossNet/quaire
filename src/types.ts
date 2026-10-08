import { QuaireComponentType, QuaireValidationError } from './enums';

export type QuaireBase<
  Question extends QuaireQuestion = QuaireQuestion,
  NavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
> = {
  saveAnswer(answer: unknown): void;
  getActiveQuestion(): Question | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- answers can have any shape, consumers read them directly
  getResult(): Record<string, any>;
  getValidationErrors(): Record<number, QuaireValidationError>;
  setActiveQuestionByNavigationItemId(navigationItemId: number): void;
  setActiveQuestionByQuestionId(questionId: number): void;
  isValid(): boolean;
  getNavigation(): Array<NavigationItem>;
};

export type QuaireOptions<
  Item extends QuaireItem = QuaireItem,
  NavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
> = {
  items: Array<Item>;
  navigationItems?: Array<NavigationItem>;
  result?: Record<string, unknown>;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- answers can have any shape, consumers read them directly
  value?: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- answers can have any shape, consumers read them directly
  value: any;
  valueHasChanged?: boolean;
  componentType: QuaireComponentType | string;
  isValid: boolean;
  dependsOnQuestions: Array<QuaireQuestion>;
  selectOptions?: Array<QuaireItemOption> | null;
  rangeOption?: QuaireRangeItemOption | null;
  inputOption?: QuaireInputItemOption | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- answers can have any shape, consumers read them directly
  defaultValue?: any;
  nextItemId?: number;
};
