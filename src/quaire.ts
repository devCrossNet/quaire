import * as _get from 'lodash.get';
import { NO_VALUE } from './constants';
import {
  QuaireBase,
  QuaireInputItemOption,
  QuaireItem,
  QuaireItemOption,
  QuaireNavigationItem,
  QuaireOptions,
  QuaireQuestion,
  QuaireRangeItemOption,
} from './interfaces';
import { QuaireComponentType, QuaireValidationError } from './enums';
import { hasAnswer } from './utils';

export class Quaire<
  IItem extends QuaireItem = QuaireItem,
  IQuestion extends QuaireQuestion = QuaireQuestion,
  INavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
> implements QuaireBase
{
  protected _activeItemId = null;
  protected readonly _items: Array<IItem>;
  protected readonly _navigationItems: Array<INavigationItem>;
  protected readonly _result: Record<string, any> = {};
  protected readonly _validationErrors: Record<number, QuaireValidationError> = {};
  protected readonly _selectComponentTypes: Array<string> = [QuaireComponentType.SINGLE_SELECT];
  protected readonly _rangeComponentTypes: Array<string> = [QuaireComponentType.RANGE_SLIDER];
  protected readonly _inputComponentTypes: Array<string> = [QuaireComponentType.INPUT];
  protected readonly _alwaysPossibleFollowUpQuestionComponents: Array<string> = [
    QuaireComponentType.RANGE_SLIDER,
    QuaireComponentType.INPUT,
  ];

  constructor({ items, navigationItems, result }: QuaireOptions<IItem, INavigationItem>) {
    this._items = items;
    this._navigationItems = navigationItems || [];

    if (items.length > 0) {
      this._activeItemId = this._items[0].id;
    }

    if (result) {
      this._result = result;
      this._setActiveItemId();
    }

    this._validate(this.getActiveQuestion());
  }

  protected _setActiveItemId() {
    let activeQuestion = this.getActiveQuestion();
    let answer = this._result[activeQuestion.resultProperty];

    if (!hasAnswer(answer)) {
      return;
    }

    while (activeQuestion) {
      this.saveAnswer(answer);

      const currentQuestion = this.getActiveQuestion();

      if (activeQuestion.id !== currentQuestion.id) {
        activeQuestion = currentQuestion;

        answer = this._result[activeQuestion.resultProperty];
      } else {
        activeQuestion = null;
        answer = null;
      }

      if (!hasAnswer(answer)) {
        break;
      }
    }
  }

  protected _getItem(itemId: number) {
    return this._items.find((i) => i.id === itemId);
  }

  protected _getQuestionObject(
    item: IItem,
    dependsOnKeys: string[],
    selectOptions: QuaireItemOption[],
    rangeOption: QuaireRangeItemOption,
    inputOption: QuaireInputItemOption,
    defaultValue: any,
  ): IQuestion {
    const value = this._getResultByValueProperty(item.resultProperty);

    let isValid = true;

    if ((!value && item.required) || this._validationErrors[item.id]) {
      isValid = false;
    }

    return {
      id: item.id,
      navigationItemId: item.navigationItemId,
      question: item.question,
      description: item.description,
      required: item.required,
      resultProperty: item.resultProperty,
      value,
      componentType: item.componentType,
      dependsOnQuestions: this._items
        .map((i) => {
          if (dependsOnKeys.includes(i.resultProperty)) {
            return this._getQuestion(i.id);
          }

          return null;
        })
        .filter((question) => question !== null),
      selectOptions,
      rangeOption,
      inputOption,
      defaultValue,
      isValid,
      nextItemId: item.nextItemId,
      valueHasChanged: false,
    } as any;
  }

  protected _getDependencyPath(item: IItem) {
    const path: Array<string> = [];

    item.dependsOnResultProperties.forEach((resultProperty) => {
      const resultPropertyValue = this._getResultByValueProperty(resultProperty);

      if (resultPropertyValue) {
        path.push(resultProperty);
        path.push(resultPropertyValue);
      }
    });

    return path;
  }

  protected _getQuestion(itemId: number) {
    const item = this._getItem(itemId);
    let selectOptions: Array<QuaireItemOption>;
    let rangeOption: QuaireRangeItemOption;
    let inputOption: QuaireInputItemOption;
    let defaultValue: any;

    if (item.dependsOnResultProperties.length > 0) {
      const path = this._getDependencyPath(item);
      selectOptions = _get(item.selectOptions, path, null);
      rangeOption = _get(item.rangeOption, path, null);
      inputOption = _get(item.inputOption, path, null);
      defaultValue = _get(item.defaultValue, path, null);
    } else {
      selectOptions = item.selectOptions ? (item.selectOptions as Array<QuaireItemOption>) : null;
      rangeOption = item.rangeOption ? item.rangeOption : null;
      inputOption = item.inputOption ? item.inputOption : null;
      defaultValue = item.defaultValue ? item.defaultValue : null;
    }

    return this._getQuestionObject(
      item,
      item.dependsOnResultProperties,
      selectOptions,
      rangeOption,
      inputOption,
      defaultValue,
    );
  }

  protected _getQuestionByNavigationItemId(categoryId: number) {
    let item = this._items
      .filter((item) => hasAnswer(this._result[item.resultProperty]))
      .find((i) => i.navigationItemId === categoryId);

    if (!item) {
      item = this._items.find((i) => i.navigationItemId === categoryId);
    }

    return this._getQuestion(item.id);
  }

  protected _getResultByValueProperty(valueProperty: string) {
    return this._result[valueProperty] === undefined ? null : this._result[valueProperty];
  }

  protected _getActiveQuestionNavigationItem() {
    return this._navigationItems.find((bc) => bc.id === this.getActiveQuestion().navigationItemId);
  }

  protected _validateSelectComponent(question: IQuestion, currentAnswer: any) {
    const option = question.selectOptions && question.selectOptions.find((o) => o.value === currentAnswer);

    if (question.required && !option) {
      this._result[question.resultProperty] = null;
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  protected _validateRangeComponent(question: IQuestion, activeQuestion: IQuestion) {
    const isActiveQuestionADependency = !!question.dependsOnQuestions.find(
      (dq) => dq.resultProperty === activeQuestion.resultProperty,
    );

    if (isActiveQuestionADependency && activeQuestion.required && activeQuestion.valueHasChanged) {
      delete this._result[question.resultProperty];
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  protected _validateGenericComponent(
    isQuestionInCurrentFlow: boolean,
    question: IQuestion,
    activeQuestion: IQuestion,
    currentAnswer: any,
  ) {
    if (
      isQuestionInCurrentFlow &&
      !hasAnswer(currentAnswer) &&
      question.required &&
      !this._validationErrors[question.id]
    ) {
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  protected _validate(activeQuestion: IQuestion) {
    this._items.forEach((item) => {
      const question = this._getQuestion(item.id);
      const currentAnswer = this._getResultByValueProperty(question.resultProperty);
      const possibleFollowUpQuestionIds: number[] = [];

      question.dependsOnQuestions.forEach((q) => {
        const dependsOnQuestionResult = this._result[q.resultProperty];

        // only take possible follow up id's based on the current result of the dependent question
        q.selectOptions?.forEach((o) => {
          if (o.value === dependsOnQuestionResult) {
            possibleFollowUpQuestionIds.push(o.nextItemId);
          }
        });
      });

      // Some components always allow a dependent question to be in the flow
      if (this._alwaysPossibleFollowUpQuestionComponents.includes(question.componentType)) {
        possibleFollowUpQuestionIds.push(question.id);
      }

      const isQuestionInCurrentFlow =
        question.dependsOnQuestions.length > 0 ? possibleFollowUpQuestionIds.includes(question.id) : true;

      if (isQuestionInCurrentFlow === false) {
        delete this._result[question.resultProperty];
        delete this._validationErrors[question.id];
      } else if (currentAnswer && this._selectComponentTypes.includes(question.componentType)) {
        this._validateSelectComponent(question, currentAnswer);
      } else if (currentAnswer && this._rangeComponentTypes.includes(question.componentType)) {
        this._validateRangeComponent(question, activeQuestion);
      } else {
        this._validateGenericComponent(isQuestionInCurrentFlow, question, activeQuestion, currentAnswer);
      }
    });
  }

  public getResult() {
    return this._result;
  }

  public getValidationErrors() {
    return this._validationErrors;
  }

  public setActiveQuestionByNavigationItemId(navigationItemId: number) {
    let quaireItem = this._items.find((item) => item.navigationItemId === navigationItemId);

    if (!quaireItem) {
      const firstChildNavigationItem = this._navigationItems.find(
        (navigationItem) => navigationItem.parentId === navigationItemId,
      );
      quaireItem = this._items.find((item) => item.navigationItemId === firstChildNavigationItem.id);
    }

    this._activeItemId = quaireItem.id;
  }

  public setActiveQuestionByQuestionId(questionId: number) {
    this._activeItemId = questionId;
  }

  public getActiveQuestion() {
    if (this._activeItemId) {
      return this._getQuestion(this._activeItemId);
    }

    return null;
  }

  protected _getNextItemIdFromSelectComponents = (activeQuestion: IQuestion, answer: any) => {
    const option = activeQuestion.selectOptions.find((o) => o.value === answer);
    return option?.nextItemId;
  };

  // eslint-disable-next-line
  protected _getNextItemIdFromRangeComponents = (activeQuestion: IQuestion, answer: any) => {
    return activeQuestion.rangeOption.nextItemId;
  };

  // eslint-disable-next-line
  protected _getNextItemIdFromInputComponents = (activeQuestion: IQuestion, answer: any) => {
    return activeQuestion.inputOption.nextItemId;
  };

  public saveAnswer(answer: any) {
    const activeQuestion = this.getActiveQuestion();
    let nextItemId: number;

    activeQuestion.valueHasChanged = this._result[activeQuestion.resultProperty] !== answer;

    this._result[activeQuestion.resultProperty] = answer;

    delete this._validationErrors[activeQuestion.id];

    if (this._selectComponentTypes.includes(activeQuestion.componentType)) {
      nextItemId = this._getNextItemIdFromSelectComponents(activeQuestion, answer);
    } else if (this._rangeComponentTypes.includes(activeQuestion.componentType)) {
      nextItemId = this._getNextItemIdFromRangeComponents(activeQuestion, answer);
    } else if (this._inputComponentTypes.includes(activeQuestion.componentType)) {
      nextItemId = this._getNextItemIdFromInputComponents(activeQuestion, answer);
    } else {
      nextItemId = activeQuestion.nextItemId;
    }

    if (!nextItemId) {
      nextItemId = activeQuestion.id;
    }

    this._activeItemId = nextItemId;

    this._validate(activeQuestion);
  }

  protected _getNavigationValue(question: IQuestion, answer: any): any {
    let value: string;

    if (this._selectComponentTypes.includes(question.componentType)) {
      value = question.selectOptions.find((selectOption) => selectOption.value === answer).label;
    } else {
      value = answer;
    }

    return value;
  }

  protected _getNavigationItemObject(
    activeNavigationItem: INavigationItem,
    navigationItem: INavigationItem,
    question: IQuestion,
    answer: any,
    isParent: boolean,
  ): INavigationItem {
    const active = activeNavigationItem.id === navigationItem.id;
    const isValid = question.isValid;
    const hasValue = Boolean(answer);
    let value: any = null;

    if (answer === NO_VALUE) {
      value = NO_VALUE;
    } else if (answer) {
      value = this._getNavigationValue(question, answer);
    }

    const item: any = {
      id: navigationItem.id,
      name: navigationItem.name,
      value,
      icon: navigationItem.icon,
      active,
      isValid,
      hasValue,
      componentType: question.componentType,
    };

    if (isParent) {
      item.subNavigation = [];
    }

    return item;
  }

  protected _getNavigationItem(
    activeNavigationItem: INavigationItem,
    navigationItem: INavigationItem,
    isParent = true,
  ) {
    const question = this._getQuestionByNavigationItemId(navigationItem.id);
    const answer = this._getResultByValueProperty(question.resultProperty);

    return this._getNavigationItemObject(activeNavigationItem, navigationItem, question, answer, isParent);
  }

  protected _addNavigationItem(
    navigationItems: { [key: string]: INavigationItem },
    activeNavigationItem: INavigationItem,
    navigationItem: INavigationItem,
  ) {
    navigationItems[navigationItem.id] = this._getNavigationItem(activeNavigationItem, navigationItem);
  }

  protected _addChildNavigationItem(
    navigationItems: { [key: string]: INavigationItem },
    activeNavigationItem: INavigationItem,
    navigationItem: INavigationItem,
  ) {
    const subCategory = this._getNavigationItem(activeNavigationItem, navigationItem, false);

    navigationItems[navigationItem.parentId].subNavigation.push(subCategory);
    navigationItems[navigationItem.parentId].active =
      navigationItems[navigationItem.parentId].active || activeNavigationItem.parentId === navigationItem.parentId;
    navigationItems[navigationItem.parentId].hasValue = true;
  }

  public getNavigation = (): INavigationItem[] => {
    const navigationItems: { [key: string]: INavigationItem } = {};
    const activeNavigationItem = this._getActiveQuestionNavigationItem();

    this._navigationItems.forEach((navigationItem) => {
      const hasParent = Boolean(navigationItem.parentId);

      if (hasParent === false) {
        this._addNavigationItem(navigationItems, activeNavigationItem, navigationItem);
      } else {
        this._addChildNavigationItem(navigationItems, activeNavigationItem, navigationItem);
      }
    });

    return Object.values(navigationItems);
  };

  public isValid() {
    return Object.keys(this._validationErrors).length === 0;
  }
}
