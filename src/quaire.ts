import { NO_VALUE } from './constants';
import {
  QuaireBase,
  QuaireInputItemOption,
  QuaireItem,
  QuaireItemOption,
  QuaireNavigationItem,
  QuaireOptions,
  QuairePartialResult,
  QuaireQuestion,
  QuaireRangeItemOption,
  QuaireResult,
} from './types';
import { QuaireComponentType, QuaireValidationError } from './enums';
import { getByPath, hasAnswer } from './utils';

export class Quaire<
  Item extends QuaireItem = QuaireItem,
  Question extends QuaireQuestion = QuaireQuestion,
  NavigationItem extends QuaireNavigationItem = QuaireNavigationItem,
  Result extends object = QuaireResult,
> implements QuaireBase<Question, NavigationItem, Result> {
  protected _activeItemId: number | null = null;
  protected readonly _items: Array<Item>;
  protected readonly _navigationItems: Array<NavigationItem>;
  protected readonly _result: QuaireResult = {};
  protected readonly _validationErrors: Record<number, QuaireValidationError> = {};
  protected readonly _selectComponentTypes: Array<string> = [QuaireComponentType.SINGLE_SELECT];
  protected readonly _rangeComponentTypes: Array<string> = [QuaireComponentType.RANGE_SLIDER];
  protected readonly _inputComponentTypes: Array<string> = [QuaireComponentType.INPUT];
  protected readonly _alwaysPossibleFollowUpQuestionComponents: Array<string> = [
    QuaireComponentType.RANGE_SLIDER,
    QuaireComponentType.INPUT,
  ];

  constructor({ items, navigationItems, result }: QuaireOptions<Item, NavigationItem, Result>) {
    this._items = items;
    this._navigationItems = navigationItems || [];

    if (items.length > 0) {
      this._activeItemId = this._items[0].id;
    }

    if (result) {
      this._result = result as QuaireResult;
      this._setActiveItemId();
    }

    this._validate(this.getActiveQuestion());
  }

  protected _setActiveItemId() {
    let activeQuestion = this.getActiveQuestion();

    if (activeQuestion) {
      let answer = this._result[activeQuestion.resultProperty];

      if (!hasAnswer(answer)) {
        return;
      }

      while (activeQuestion) {
        this.saveAnswer(answer);

        const currentQuestion = this.getActiveQuestion();

        if (currentQuestion && activeQuestion.id !== currentQuestion.id) {
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
  }

  protected _getItem(itemId: number | undefined) {
    return this._items.find((i) => i.id === itemId);
  }

  protected _getQuestionObject(
    item: Item,
    dependsOnKeys: string[],
    selectOptions: QuaireItemOption[] | null,
    rangeOption: QuaireRangeItemOption | null,
    inputOption: QuaireInputItemOption | null,
    defaultValue: unknown,
  ): Question {
    const value = this._getResultByValueProperty(item.resultProperty);

    let isValid = true;

    if ((!value && item.required) || this._validationErrors[item.id]) {
      isValid = false;
    }

    const question: QuaireQuestion = {
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
    };

    return question as Question;
  }

  protected _getDependencyPath(item: Item) {
    const path: Array<string> = [];

    item.dependsOnResultProperties.forEach((resultProperty) => {
      const resultPropertyValue = this._getResultByValueProperty(resultProperty);

      if (resultPropertyValue) {
        path.push(resultProperty);
        path.push(String(resultPropertyValue));
      }
    });

    return path;
  }

  protected _getQuestion(itemId: number | undefined) {
    const item = this._getItem(itemId);

    return item ? this._getQuestionFromItem(item) : null;
  }

  protected _getQuestionFromItem(item: Item) {
    let selectOptions: Array<QuaireItemOption> | null;
    let rangeOption: QuaireRangeItemOption | null;
    let inputOption: QuaireInputItemOption | null;
    let defaultValue: unknown;

    if (item.dependsOnResultProperties.length > 0) {
      const path = this._getDependencyPath(item);
      selectOptions = getByPath<Array<QuaireItemOption> | null>(item.selectOptions, path, null);
      rangeOption = getByPath<QuaireRangeItemOption | null>(item.rangeOption, path, null);
      inputOption = getByPath<QuaireInputItemOption | null>(item.inputOption, path, null);
      defaultValue = getByPath(item.defaultValue, path, null);
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

    return this._getQuestion(item?.id);
  }

  protected _getResultByValueProperty(valueProperty: string) {
    return this._result[valueProperty] === undefined ? null : this._result[valueProperty];
  }

  protected _getActiveQuestionNavigationItem() {
    const navigationItem = this._navigationItems.find((bc) => bc.id === this.getActiveQuestion()?.navigationItemId);
    return navigationItem || null;
  }

  protected _validateSelectComponent(question: Question, currentAnswer: unknown) {
    const option = question.selectOptions && question.selectOptions.find((o) => o.value === currentAnswer);

    if (question.required && !option) {
      this._result[question.resultProperty] = null;
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  protected _validateRangeComponent(question: Question, activeQuestion: Question | null) {
    const isActiveQuestionADependency = !!question.dependsOnQuestions.find(
      (dq) => dq.resultProperty === activeQuestion?.resultProperty,
    );

    if (isActiveQuestionADependency && activeQuestion?.required && activeQuestion.valueHasChanged) {
      delete this._result[question.resultProperty];
      this._validationErrors[question.id] = QuaireValidationError.REQUIRED;
    }
  }

  protected _validateGenericComponent(
    isQuestionInCurrentFlow: boolean,
    question: Question,
    activeQuestion: Question | null,
    currentAnswer: unknown,
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

  protected _validate(activeQuestion: Question | null) {
    this._items.forEach((item) => {
      const question = this._getQuestionFromItem(item);
      const currentAnswer = this._getResultByValueProperty(question.resultProperty);
      const possibleFollowUpQuestionIds: number[] = [];

      question.dependsOnQuestions.forEach((q) => {
        const dependsOnQuestionResult = this._result[q.resultProperty];

        // only take possible follow up id's based on the current result of the dependent question
        q.selectOptions?.forEach((o) => {
          if (o.value === dependsOnQuestionResult && o.nextItemId) {
            possibleFollowUpQuestionIds.push(o.nextItemId);
          }
        });
      });

      // questions with some components always stay in the flow, even if they depend on former answers
      if (this._alwaysPossibleFollowUpQuestionComponents.includes(question.componentType)) {
        possibleFollowUpQuestionIds.push(question.id);
      }

      const isQuestionInCurrentFlow =
        question.dependsOnQuestions.length > 0 ? possibleFollowUpQuestionIds.includes(question.id) : true;

      if (!isQuestionInCurrentFlow) {
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
    return this._result as QuairePartialResult<Result>;
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
      quaireItem = this._items.find((item) => item.navigationItemId === firstChildNavigationItem?.id);
    }

    this._activeItemId = quaireItem?.id || null;
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

  protected _getNextItemIdFromSelectComponents = (activeQuestion: Question | null, answer: unknown) => {
    const option = activeQuestion?.selectOptions?.find((o) => o.value === answer);
    return option?.nextItemId;
  };

  // eslint-disable-next-line
  protected _getNextItemIdFromRangeComponents = (activeQuestion: Question | null, answer: unknown) => {
    return activeQuestion?.rangeOption?.nextItemId;
  };

  // eslint-disable-next-line
  protected _getNextItemIdFromInputComponents = (activeQuestion: Question | null, answer: unknown) => {
    return activeQuestion?.inputOption?.nextItemId;
  };

  public saveAnswer(answer: unknown) {
    const activeQuestion = this.getActiveQuestion();

    if (activeQuestion) {
      let nextItemId: number | null | undefined;

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
  }

  protected _getNavigationValue(question: Question | null, answer: unknown): unknown {
    let value: unknown;

    if (question && this._selectComponentTypes.includes(question.componentType)) {
      value = question?.selectOptions?.find((selectOption) => selectOption.value === answer)?.label;
    } else {
      value = answer;
    }

    return value;
  }

  protected _getNavigationItemObject(
    activeNavigationItem: NavigationItem | null,
    navigationItem: NavigationItem,
    question: Question,
    answer: unknown,
    isParent: boolean,
  ): NavigationItem {
    const active = activeNavigationItem?.id === navigationItem.id;
    const isValid = question.isValid;
    const hasValue = Boolean(answer);
    let value: unknown = null;

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

    return item as NavigationItem;
  }

  protected _getNavigationItem(
    activeNavigationItem: NavigationItem | null,
    navigationItem: NavigationItem,
    isParent = true,
  ) {
    const question = this._getQuestionByNavigationItemId(navigationItem.id);

    if (question) {
      const answer = this._getResultByValueProperty(question.resultProperty);

      return this._getNavigationItemObject(activeNavigationItem, navigationItem, question, answer, isParent);
    }

    return null;
  }

  // used for parent navigation items without an own question, the values are derived from the children
  protected _getParentNavigationItemObject(navigationItem: NavigationItem): NavigationItem {
    const item: QuaireNavigationItem = {
      id: navigationItem.id,
      name: navigationItem.name,
      value: null,
      icon: navigationItem.icon,
      active: false,
      isValid: true,
      hasValue: false,
      componentType: null,
      subNavigation: [],
    };

    return item as NavigationItem;
  }

  protected _addNavigationItem(
    navigationItems: { [key: string]: NavigationItem },
    activeNavigationItem: NavigationItem | null,
    navigationItem: NavigationItem,
    parentNavigationItemIds: Set<number>,
  ) {
    const newNavigationItem = this._getNavigationItem(activeNavigationItem, navigationItem);

    if (newNavigationItem) {
      navigationItems[navigationItem.id] = newNavigationItem;
    } else {
      navigationItems[navigationItem.id] = this._getParentNavigationItemObject(navigationItem);
      parentNavigationItemIds.add(navigationItem.id);
    }
  }

  protected _addChildNavigationItem(
    navigationItems: { [key: string]: NavigationItem },
    activeNavigationItem: NavigationItem | null,
    navigationItem: NavigationItem,
  ) {
    const parent = navigationItems[navigationItem.parentId as number];
    const subNavigationItem = this._getNavigationItem(activeNavigationItem, navigationItem, false);

    // ignore children with unknown parents
    if (parent && subNavigationItem) {
      parent.subNavigation?.push(subNavigationItem);
      parent.active = parent.active || activeNavigationItem?.parentId === navigationItem.parentId;
      parent.hasValue = parent.hasValue || subNavigationItem.hasValue;
    }
  }

  public getNavigation = (): NavigationItem[] => {
    const navigationItems: { [key: string]: NavigationItem } = {};
    const parentNavigationItemIds = new Set<number>();
    const activeNavigationItem = this._getActiveQuestionNavigationItem();

    // add all parents first, so children can be added independent of their position in the list
    this._navigationItems
      .filter((navigationItem) => !navigationItem.parentId)
      .forEach((navigationItem) => {
        this._addNavigationItem(navigationItems, activeNavigationItem, navigationItem, parentNavigationItemIds);
      });

    this._navigationItems
      .filter((navigationItem) => navigationItem.parentId)
      .forEach((navigationItem) => {
        this._addChildNavigationItem(navigationItems, activeNavigationItem, navigationItem);
      });

    parentNavigationItemIds.forEach((id) => {
      const subNavigation = navigationItems[id].subNavigation as NavigationItem[];

      if (subNavigation.length === 0) {
        delete navigationItems[id];
      } else {
        navigationItems[id].isValid = subNavigation.every((child) => child.isValid);
      }
    });

    return Object.values(navigationItems);
  };

  public isValid() {
    return Object.keys(this._validationErrors).length === 0;
  }
}
