import {
  Quaire,
  QuaireInputItemOption,
  QuaireItem,
  QuaireItemOption,
  QuaireNavigationItem,
  QuaireQuestion,
  QuaireRangeItemOption,
} from '../../src';

export interface MyRangeItemOption extends QuaireRangeItemOption {
  divisor: number;
  unit: string;
}

export interface MyItem extends QuaireItem {
  progress: number;
  rangeOption: MyRangeItemOption;
}

export interface MyQuestion extends QuaireQuestion {
  progress: number;
  rangeOption: MyRangeItemOption;
}

export interface MyNavigationItem extends QuaireNavigationItem {
  progress?: number;
  unit?: string;
}

export class MyQuaire extends Quaire<MyItem, MyQuestion, MyNavigationItem> {
  protected _getQuestionObject(
    item: MyItem,
    dependsOnKeys: string[],
    selectOptions: QuaireItemOption[],
    rangeOption: QuaireRangeItemOption,
    inputOption: QuaireInputItemOption,
    defaultValue: any,
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
    answer: any,
    isParent,
  ): MyNavigationItem {
    return {
      ...super._getNavigationItemObject(activeNavigationItem, navigationItem, question, answer, isParent),
      progress: question.progress,
      unit: question.rangeOption.unit,
    };
  }
}
