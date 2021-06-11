import { QuaireComponentType, QuaireValidationError } from './enums';

export interface QuaireBase<
  IQuestion extends QuaireQuestion = QuaireQuestion,
  INavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
> {
  saveAnswer(answer: any): void;
  getActiveQuestion(): IQuestion | null;
  getResult(): Record<string, any>;
  getValidationErrors(): Record<number, QuaireValidationError>;
  setActiveQuestionByNavigationItemId(navigationItemId: number): void;
  setActiveQuestionByQuestionId(questionId: number): void;
  isValid(): boolean;
  getNavigation(): Array<INavigationItem>;
}

export interface QuaireOptions<
  IItem extends QuaireItem = QuaireItem,
  INavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
> {
  items: Array<IItem>;
  navigationItems?: Array<INavigationItem>;
  result?: Record<string, any>;
}

export interface QuaireItemOption {
  [key: string]: unknown | QuaireItemOption;
  label?: string;
  value?: unknown;
  nextItemId?: number;
}

export interface QuaireRangeItemOption {
  [key: string]: unknown | QuaireRangeItemOption;
  range?: Array<number>;
  nextItemId?: number;
}

export interface QuaireInputItemOption {
  [key: string]: unknown | QuaireInputItemOption;
  type?: string; // HTML input type e.g. text, number, date, etc.
  placeholder?: string;
  nextItemId?: number;
}

export interface QuaireItem {
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
  defaultValue?: any;
  nextItemId?: number;
}

export interface QuaireNavigationItem {
  id: number;
  name: string;
  value?: string;
  icon?: string;
  parentId?: number | null;
  active?: boolean;
  isValid?: boolean;
  hasValue?: boolean;
  subNavigation?: Array<QuaireNavigationItem>;
  componentType?: QuaireComponentType | string;
}

export interface QuaireQuestion {
  id: number;
  navigationItemId: number;
  question: string;
  description: string;
  required: boolean;
  resultProperty: string;
  value: any;
  valueHasChanged?: boolean;
  componentType: QuaireComponentType | string;
  isValid: boolean;
  dependsOnQuestions: Array<QuaireQuestion>;
  selectOptions?: Array<QuaireItemOption>;
  rangeOption?: QuaireRangeItemOption;
  inputOption?: QuaireInputItemOption;
  defaultValue?: any;
  nextItemId?: number;
}
