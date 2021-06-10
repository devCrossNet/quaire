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

export class Quaire implements QuaireBase {
  private _activeItemId = 1;
  private readonly _items: QuaireItem[];
  private readonly _navigationItems: QuaireNavigationItem[];
  private readonly _result: Record<string, any> = {};
  private readonly _validationErrors: Record<number, QuaireValidationError> = {};

  private readonly _selectComponentTypes = [QuaireComponentType.SINGLE_SELECT, QuaireComponentType.MULTI_SELECT];
  private readonly _rangeComponentTypes = [QuaireComponentType.RANGE_SLIDER];
  private readonly _inputComponentTypes = [QuaireComponentType.INPUT];

  constructor({ items, navigationItems, result }: QuaireOptions) {
    this._items = items;
    this._navigationItems = navigationItems || [];

    if (result) {
      this._result = result;
      this._setActiveItemId();
    }

    this._validate(this.getActiveQuestion());
  }

  private _setActiveItemId() {
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

  private _getItem(itemId: number) {
    return this._items.find((i) => i.id === itemId);
  }

  private _getQuestionObject(
    item: QuaireItem,
    dependsOnKeys: string[],
    selectOptions: QuaireItemOption[],
    rangeOption: QuaireRangeItemOption,
    inputOption: QuaireInputItemOption,
    defaultValue: any,
  ): QuaireQuestion {
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
    };
  }

  private _getDependencyPath(dependsOnResultProperties: Array<string>) {
    const path: Array<string> = [];

    dependsOnResultProperties.forEach((resultProperty) => {
      const resultPropertyValue = this._getResultByValueProperty(resultProperty);

      if (resultPropertyValue) {
        path.push(resultProperty);
        path.push(resultPropertyValue);
      }
    });

    return path;
  }

  private _getQuestion(itemId: number): QuaireQuestion {
    const item = this._getItem(itemId);
    let selectOptions: Array<QuaireItemOption>;
    let rangeOption: QuaireRangeItemOption;
    let inputOption: QuaireInputItemOption;
    let defaultValue: any;

    if (item.dependsOnResultProperties.length > 0) {
      const path = this._getDependencyPath(item.dependsOnResultProperties);
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

  private _getQuestionByNavigationItemId(categoryId: number): QuaireQuestion {
    let item = this._items
      .filter((item) => hasAnswer(this._result[item.resultProperty]))
      .find((i) => i.navigationItemId === categoryId);

    if (!item) {
      item = this._items.find((i) => i.navigationItemId === categoryId);
    }

    return this._getQuestion(item.id);
  }

  private _getResultByValueProperty(valueProperty: string) {
    return this._result[valueProperty] === undefined ? null : this._result[valueProperty];
  }

  private _getActiveQuestionNavigationItem() {
    return this._navigationItems.find((bc) => bc.id === this.getActiveQuestion().navigationItemId);
  }

  private _validateSingleSelectComponent(question: QuaireQuestion, currentAnswer: any) {
    const option = question.selectOptions && question.selectOptions.find((o) => o.value === currentAnswer);

    if (question.required && !option) {
      this._result[question.resultProperty] = null;
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  private _validateRangeComponent(question: QuaireQuestion, activeQuestion: QuaireQuestion) {
    const isActiveQuestionADependency = !!question.dependsOnQuestions.find(
      (dq) => dq.resultProperty === activeQuestion.resultProperty,
    );

    if (isActiveQuestionADependency && activeQuestion.required && activeQuestion.valueHasChanged) {
      delete this._result[question.resultProperty];
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  private _validate(activeQuestion: QuaireQuestion) {
    this._items.forEach((item) => {
      const question = this._getQuestion(item.id);
      const currentAnswer = this._getResultByValueProperty(question.resultProperty);
      const possibleFollowUpQuestionIds: number[] = [];

      question.dependsOnQuestions.forEach((q) => {
        const dependsOnQuestionResult = this._result[q.resultProperty];

        /* only take possible follow up id's based on the current result of the dependsOn question */
        q.selectOptions?.forEach((o) => {
          if (o.value === dependsOnQuestionResult) {
            possibleFollowUpQuestionIds.push(o.nextItemId);
          }
        });
      });

      // Some components are always possible
      if ([QuaireComponentType.RANGE_SLIDER, QuaireComponentType.INPUT].includes(question.componentType)) {
        possibleFollowUpQuestionIds.push(question.id);
      }

      const isQuestionInCurrentFlow =
        question.dependsOnQuestions.length > 0 ? possibleFollowUpQuestionIds.includes(question.id) : true;

      if (isQuestionInCurrentFlow === false) {
        delete this._result[question.resultProperty];
        delete this._validationErrors[question.id];
      } else if (currentAnswer && question.componentType === QuaireComponentType.SINGLE_SELECT) {
        this._validateSingleSelectComponent(question, currentAnswer);
        // TODO: handle multi-select
      } else if (currentAnswer && question.componentType === QuaireComponentType.RANGE_SLIDER) {
        this._validateRangeComponent(question, activeQuestion);
      } else if (
        isQuestionInCurrentFlow &&
        !currentAnswer &&
        question.required &&
        !this._validationErrors[question.id]
      ) {
        this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
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
      const firstChildCategory = this._navigationItems.find((cc) => cc.parentId === navigationItemId);
      quaireItem = this._items.find((item) => item.navigationItemId === firstChildCategory.id);
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

  public saveAnswer(answer: any) {
    const activeQuestion = this.getActiveQuestion();
    let nextItemId: number;

    activeQuestion.valueHasChanged = this._result[activeQuestion.resultProperty] !== answer;

    this._result[activeQuestion.resultProperty] = answer;

    delete this._validationErrors[activeQuestion.id];

    if (this._selectComponentTypes.includes(activeQuestion.componentType)) {
      // TODO handle multi-select
      const option = activeQuestion.selectOptions.find((o) => o.value === answer);

      nextItemId = option?.nextItemId;
    } else if (this._rangeComponentTypes.includes(activeQuestion.componentType)) {
      nextItemId = activeQuestion.rangeOption.nextItemId;
    } else if (this._inputComponentTypes.includes(activeQuestion.componentType)) {
      nextItemId = activeQuestion.inputOption.nextItemId;
    } else if (activeQuestion.nextItemId) {
      nextItemId = activeQuestion.nextItemId;
    }

    if (!nextItemId) {
      nextItemId = activeQuestion.id;
    }

    this._activeItemId = nextItemId;

    this._validate(activeQuestion);
  }

  private _getNavigationValue(question: QuaireQuestion, answer: any) {
    let value: string;

    if (this._selectComponentTypes.includes(question.componentType)) {
      value = question.selectOptions.find((selectOption) => selectOption.value === answer).label;
    } else {
      value = answer;
    }

    return value;
  }

  private _getNavigationItem(
    activeNavigationItem: QuaireNavigationItem,
    navigationItem: QuaireNavigationItem,
    isParent = true,
  ) {
    const question = this._getQuestionByNavigationItemId(navigationItem.id);
    const answer = this._getResultByValueProperty(question.resultProperty);
    const active = activeNavigationItem.id === navigationItem.id;
    const isValid = question.isValid;
    const hasValue = Boolean(answer);
    let value: any = null;

    if (answer === NO_VALUE) {
      value = NO_VALUE;
    } else if (answer) {
      value = this._getNavigationValue(question, answer);
    }

    const item: QuaireNavigationItem = {
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

  private _addNavigationItem(
    navigationItems: { [key: string]: QuaireNavigationItem },
    activeNavigationItem: QuaireNavigationItem,
    navigationItem: QuaireNavigationItem,
  ) {
    navigationItems[navigationItem.id] = this._getNavigationItem(activeNavigationItem, navigationItem);
  }

  private _addChildNavigationItem(
    navigationItems: { [key: string]: QuaireNavigationItem },
    activeNavigationItem: QuaireNavigationItem,
    navigationItem: QuaireNavigationItem,
  ) {
    const subCategory = this._getNavigationItem(activeNavigationItem, navigationItem, false);

    navigationItems[navigationItem.parentId].subNavigation.push(subCategory);
    navigationItems[navigationItem.parentId].active =
      navigationItems[navigationItem.parentId].active || activeNavigationItem.parentId === navigationItem.parentId;
    navigationItems[navigationItem.parentId].hasValue = true;
  }

  public getNavigation = (): QuaireNavigationItem[] => {
    const navigationItems: { [key: string]: QuaireNavigationItem } = {};
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
