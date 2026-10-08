import {
  Quaire,
  QuaireInputItemOption,
  QuaireItem,
  QuaireItemOption,
  QuaireNavigationItem,
  QuaireQuestion,
  QuaireRangeItemOption,
  QuaireResult,
} from '../../src';

export type MyRangeItemOption = QuaireRangeItemOption & {
  divisor: number;
  unit: string;
};

export type MyItem = QuaireItem & {
  progress: number;
  rangeOption: MyRangeItemOption;
};

export type MyQuestion = QuaireQuestion & {
  progress: number;
  rangeOption: MyRangeItemOption;
};

export type MyNavigationItem = QuaireNavigationItem & {
  progress?: number;
  unit?: string;
};

export class MyQuaire extends Quaire<QuaireResult, MyItem, MyQuestion, MyNavigationItem> {
  protected _getQuestionObject(
    item: MyItem,
    dependsOnKeys: string[],
    selectOptions: QuaireItemOption[],
    rangeOption: QuaireRangeItemOption,
    inputOption: QuaireInputItemOption,
    defaultValue: unknown,
  ): MyQuestion {
    return {
      ...super._getQuestionObject(item, dependsOnKeys, selectOptions, rangeOption, inputOption, defaultValue),
      progress: item.progress,
    };
  }

  protected _getNavigationItemObject(
    activeNavigationItem: MyNavigationItem,
    navigationItem: MyNavigationItem,
    question: MyQuestion,
    answer: unknown,
    isParent: boolean,
  ): MyNavigationItem {
    return {
      ...super._getNavigationItemObject(activeNavigationItem, navigationItem, question, answer, isParent),
      progress: question.progress,
      unit: question.rangeOption.unit,
    };
  }
}
