import { QuaireComponentType, QuaireValidationError } from './enums';

export interface QuaireBase {
  saveAnswer(answer: any);
  getActiveQuestion(): QuaireQuestion;
  getResult(): Record<string, any>;
  getValidationErrors(): Record<number, QuaireValidationError>;
  setActiveQuestionByNavigationItemId(navigationItemId: number);
  setActiveQuestionByQuestionId(questionId: number);
  isValid(): boolean;
  getNavigation(): Array<QuaireNavigationItem>;
}

export interface QuaireOptions {
  items: Array<QuaireItem>;
  navigationItems?: Array<QuaireNavigationItem>;
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
  componentType: QuaireComponentType;
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
  parentId?: number;
  active?: boolean;
  isValid?: boolean;
  hasValue?: boolean;
  subNavigation?: Array<QuaireNavigationItem>;
  componentType?: QuaireComponentType;
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
  componentType: QuaireComponentType;
  isValid: boolean;
  dependsOnQuestions: Array<QuaireQuestion>;
  selectOptions?: Array<QuaireItemOption>;
  rangeOption?: QuaireRangeItemOption;
  inputOption?: QuaireInputItemOption;
  defaultValue?: any;
  nextItemId?: number;
}
