import {
  Quaire,
  QuaireComponentType,
  QuaireItem,
  QuaireOptions,
  QuaireQuestion,
  QuaireValidationError,
} from '../../src';

export enum MyComponentType {
  MULTI_SELECT = 'MULTI_SELECT',
  BOOLEAN = 'BOOLEAN',
}

export class MyQuaire extends Quaire {
  // add MULTI_SELECT to select component to use dedicated logic
  protected readonly _selectComponentTypes: Array<string> = [
    QuaireComponentType.SINGLE_SELECT,
    MyComponentType.MULTI_SELECT,
  ];
  // these components always allow a dependent question to be in the flow
  // e.g. a follow up question that depends on a BOOLEAN component question will always be in the flow
  protected readonly _alwaysPossibleFollowUpQuestionComponents: Array<string> = [
    QuaireComponentType.RANGE_SLIDER,
    QuaireComponentType.INPUT,
    MyComponentType.BOOLEAN,
  ];

  constructor({ items, navigationItems, result }: QuaireOptions) {
    // call Quaire constructor
    super({ items, navigationItems, result });
  }

  // override default behaviour and apply new logic for MULTI_SELECT components
  protected _validateSelectComponent(question: QuaireQuestion, currentAnswer: any[]) {
    if (question.componentType === MyComponentType.MULTI_SELECT) {
      const options = question.selectOptions.filter((o) => currentAnswer.includes(o.value));

      if (question.required && options.length === 0) {
        this._result[question.resultProperty] = null;
        this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
      }
    } else {
      super._validateSelectComponent(question, currentAnswer);
    }
  }

  // override default behaviour and apply new logic for MULTI_SELECT components
  protected _getNextItemIdFromSelectComponents = (activeQuestion: QuaireQuestion, answer: any | any[]) => {
    const option = activeQuestion.selectOptions.find((o) =>
      Array.isArray(answer) ? answer.includes(o.value) : o.value === answer,
    );

    return option?.nextItemId;
  };

  // override default behaviour and apply new logic for MULTI_SELECT components
  // in case a question has a dependency to a MULTI_SELECT component value,
  // we need to concatenate the array to get one key for the item definition
  protected _getDependencyPath(item: QuaireItem) {
    const path: Array<string> = [];

    item.dependsOnResultProperties.forEach((resultProperty) => {
      const resultPropertyValue = this._getResultByValueProperty(resultProperty);

      if (resultPropertyValue) {
        path.push(resultProperty);
        path.push(Array.isArray(resultPropertyValue) ? resultPropertyValue.sort().join('_') : resultPropertyValue);
      }
    });
    return path;
  }

  // override default behaviour and apply new logic for MULTI_SELECT components
  protected _getNavigationValue(question: QuaireQuestion, answer: any) {
    if (question.componentType === MyComponentType.MULTI_SELECT) {
      return question.selectOptions
        .filter((selectOption) => answer.includes(selectOption.value))
        .map((selectOption) => selectOption.label);
    } else {
      return super._getNavigationValue(question, answer);
    }
  }
}
