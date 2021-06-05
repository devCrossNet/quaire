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

  constructor({ items, navigationItems, quaireResult }: QuaireOptions) {
    this._items = items;
    this._navigationItems = navigationItems || [];

    if (quaireResult) {
      this._result = quaireResult;
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
      activeQuestion = activeQuestion.id === currentQuestion.id ? null : currentQuestion;
      answer = activeQuestion ? this._result[activeQuestion.resultProperty] : null;

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
    defaultOption: any,
  ): QuaireQuestion {
    return {
      id: item?.id,
      navigationItemId: item?.navigationItemId,
      question: item?.question,
      description: item?.description,
      required: item?.required,
      resultProperty: item?.resultProperty,
      value: this._getResultByValueProperty(item?.resultProperty),
      componentType: item?.componentType,
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
      defaultValue: defaultOption,
      isValid: item ? !this._validationErrors[item.id] : false,
      nextItemId: item?.nextItemId,
    };
  }

  private _getQuestion(itemId: number): QuaireQuestion {
    const item = this._getItem(itemId);
    const dependsOnKey = item.dependsOnResultProperties[0] || 'default';
    const dependsOnValue = this._getResultByValueProperty(dependsOnKey) || 'default';
    let selectOptions: Array<QuaireItemOption>;
    let rangeOption: QuaireRangeItemOption;
    let inputOption: QuaireInputItemOption;
    let defaultOption: any;

    if (item.dependsOnResultProperties.length > 0) {
      // TODO: recursive keys
    } else {
      selectOptions = item.selectOptions ? (item.selectOptions as Array<QuaireItemOption>) : null;
      rangeOption = item.rangeOption ? item.rangeOption : null;
      inputOption = item.inputOption ? item.inputOption : null;
      defaultOption = item.defaultValues ? item.defaultValues : null;
    }

    return this._getQuestionObject(
      item,
      item.dependsOnResultProperties,
      selectOptions,
      rangeOption,
      inputOption,
      defaultOption,
    );
  }

  private _getQuestionByNavigationItemId(categoryId: number): QuaireQuestion {
    const item = this._items.find((i) => i.navigationItemId === categoryId);

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
      this._result[question.resultProperty] = null;
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
        this._result[question.resultProperty] = null;
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
      let option = activeQuestion.selectOptions.find((o) => o.value === answer);

      if (!option && activeQuestion.selectOptions.length > 0) {
        option = activeQuestion.selectOptions[0];
      }

      nextItemId = option.nextItemId;
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

  private _addParentCategory(
    navigationItems: { [key: string]: QuaireNavigationItem },
    activeNavigationItem: QuaireNavigationItem,
    navigationItem: QuaireNavigationItem,
  ) {
    const question = this._getQuestionByNavigationItemId(navigationItem.id);
    const answer = this._getResultByValueProperty(question.resultProperty);
    let hasValue = Boolean(answer);
    let value: any = null;

    if (answer === NO_VALUE) {
      value = `No value selected`;
    } else if (answer) {
      value = this._getChildCategoryName(navigationItem, question, answer);
    }

    navigationItems[navigationItem.id] = {
      id: navigationItem.id,
      name: navigationItem.name,
      value,
      icon: navigationItem.icon,
      active: activeNavigationItem.id === navigationItem.id,
      hasValue,
      subCategories: [],
      componentType: question.componentType,
    };
  }

  private _getChildCategoryName(navigationItem: QuaireNavigationItem, question: QuaireQuestion, answer: any) {
    let name: string;

    if (this._selectComponentTypes.includes(question.componentType)) {
      name = question.selectOptions.find((selectOption) => selectOption.value === answer).label;
    } else if (this._rangeComponentTypes.includes(question.componentType)) {
      name = `${navigationItem.name}: ${answer.join('-')} ${question.rangeOption.unit}`;
    } else if (this._inputComponentTypes.includes(question.componentType)) {
      name = `${navigationItem.name}: ${answer} ${question.inputOption.unit}`;
    } else {
      name = navigationItem.name;
    }

    return name;
  }

  private _addChildCategory(
    navigationItems: { [key: string]: QuaireNavigationItem },
    activeNavigationItem: QuaireNavigationItem,
    navigationItem: QuaireNavigationItem,
  ) {
    const question = this._getQuestionByNavigationItemId(navigationItem.id);
    const answer = this._getResultByValueProperty(question.resultProperty);
    const active = activeNavigationItem.id === navigationItem.id;
    const isValid = question.id && question.isValid;
    let value: any = null;

    if (answer === NO_VALUE) {
      value = `No value selected`;
    } else if (answer) {
      value = this._getChildCategoryName(navigationItem, question, answer);
    }

    navigationItems[navigationItem.parentId].subCategories.push({
      id: navigationItem.id,
      name: navigationItem.name,
      value,
      icon: navigationItem.icon,
      active,
      isValid: active ? true : isValid,
      hasValue: active ? false : Boolean(answer),
      componentType: question.componentType,
    });
    navigationItems[navigationItem.parentId].active = activeNavigationItem.parentId === navigationItem.parentId;
    navigationItems[navigationItem.parentId].hasValue = true;
  }

  public getNavigation = (): QuaireNavigationItem[] => {
    const result: { [key: string]: QuaireNavigationItem } = {};
    const activeCategory = this._getActiveQuestionNavigationItem();

    this._navigationItems.forEach((category) => {
      const hasParent = Boolean(category.parentId);

      if (hasParent === false) {
        this._addParentCategory(result, activeCategory, category);
      } else {
        this._addChildCategory(result, activeCategory, category);
      }
    });

    return Object.values(result);
  };

  public isValid() {
    return Object.keys(this._validationErrors).length === 0;
  }
}
