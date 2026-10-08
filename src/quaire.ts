import { defaultComponents } from './components.js';
import { matchesCondition } from './conditions.js';
import { NO_VALUE, QuaireErrorCode } from './constants.js';
import { resolveDefinition } from './definition.js';
import { buildNavigation } from './navigation.js';
import type {
  QuaireComponent,
  QuaireComponents,
  QuaireError,
  QuaireId,
  QuaireNavigationDefinition,
  QuaireNavigationItem,
  QuaireOptions,
  QuairePartialResult,
  QuaireQuestion,
  QuaireQuestionDefinition,
  QuaireQuestionDefinitionBase,
  QuaireResolvedDefinition,
  QuaireResult,
  QuaireState,
} from './types.js';
import { hasValue, isSameId } from './utils.js';

type Step<Definition extends QuaireQuestionDefinitionBase> = {
  definition: QuaireResolvedDefinition<Definition>;
  variantIndex: number;
  value: unknown;
  hasValue: boolean;
  error: QuaireError | null;
};

export class Quaire<
  Result extends object = QuaireResult,
  Definition extends QuaireQuestionDefinitionBase = QuaireQuestionDefinition,
  NavigationDefinition extends QuaireNavigationDefinition = QuaireNavigationDefinition,
> {
  protected readonly _questions: Array<Definition>;
  protected readonly _questionsById: Map<string, Definition>;
  protected readonly _navigation: Array<NavigationDefinition>;
  protected readonly _components: QuaireComponents;
  protected readonly _listeners = new Set<
    (
      state: QuaireState<
        Result,
        QuaireQuestion<Definition>,
        QuaireNavigationItem<NavigationDefinition, QuaireQuestion<Definition>>
      >,
    ) => void
  >();
  protected _result: QuaireResult;
  // variant of each answered question when it was answered, a changed variant makes the answer invalid
  protected _answerVariants = new Map<string, number>();
  protected _activeId: QuaireId | null;
  protected _history: Array<QuaireId> = [];
  protected _path: Array<Step<Definition>> = [];
  protected _pathById = new Map<string, Step<Definition>>();
  protected _state!: QuaireState<
    Result,
    QuaireQuestion<Definition>,
    QuaireNavigationItem<NavigationDefinition, QuaireQuestion<Definition>>
  >;

  constructor({
    questions,
    navigation = [],
    result,
    components,
  }: QuaireOptions<Result, Definition, NavigationDefinition>) {
    this._questions = questions;
    this._questionsById = new Map(questions.map((question) => [String(question.id), question]));
    this._navigation = navigation;
    this._components = { ...defaultComponents, ...components };
    this._result = { ...result };
    this._activeId = questions.length > 0 ? questions[0].id : null;
    this._update();

    // continue a restored flow with the first open question
    if (result) {
      const openIndex = this._path.findIndex((step) => !step.hasValue || step.error);
      const activeIndex = openIndex === -1 ? this._path.length - 1 : openIndex;

      this._history = this._path.slice(0, activeIndex).map((step) => step.definition.id);
      this._activeId = this._path[activeIndex]?.definition.id ?? this._activeId;
      this._buildState();
    }
  }

  protected _getDefinition(id: QuaireId | null) {
    return this._questionsById.get(String(id));
  }

  protected _getComponent(type: string): QuaireComponent {
    return this._components[type] || {};
  }

  protected _hasValue(definition: QuaireResolvedDefinition<Definition>, value: unknown) {
    const component = this._getComponent(definition.type);

    return component.hasValue ? component.hasValue(value) : hasValue(value);
  }

  protected _validate(definition: QuaireResolvedDefinition<Definition>, value: unknown): QuaireError | null {
    if (!this._hasValue(definition, value)) {
      return definition.required ? QuaireErrorCode.REQUIRED : null;
    }

    if (value === NO_VALUE) {
      return null;
    }

    return (
      this._getComponent(definition.type).validate?.(definition, value) ||
      definition.validate?.(value, this._result) ||
      null
    );
  }

  protected _getNext(definition: QuaireResolvedDefinition<Definition>, value: unknown): QuaireId | undefined {
    const next = this._getComponent(definition.type).getNext?.(definition, value);

    if (next !== undefined) {
      return next;
    }

    if (Array.isArray(definition.next)) {
      return definition.next.find((entry) => matchesCondition(entry.when, this._result))?.to;
    }

    return definition.next;
  }

  protected _getStep(question: Definition): Step<Definition> {
    const { definition, variantIndex } = resolveDefinition(question, this._result);
    const value = this._result[definition.key];

    return {
      definition,
      variantIndex,
      value,
      hasValue: this._hasValue(definition, value),
      error: this._validate(definition, value),
    };
  }

  // the questions from the first question to the end, following the answers
  protected _computePath() {
    const path = new Map<string, Step<Definition>>();
    let question = this._questions[0];

    while (question && !path.has(String(question.id))) {
      const step = this._getStep(question);

      path.set(String(question.id), step);
      question = this._getDefinition(this._getNext(step.definition, step.value) ?? null) as Definition;
    }

    return path;
  }

  // resets answers whose variant changed and removes answers of questions that are not on the path
  protected _invalidate(path: Map<string, Step<Definition>>) {
    let changed = false;

    [...path.values()]
      .filter((step) => step.hasValue)
      .forEach(({ definition, variantIndex }) => {
        const answerVariant = this._answerVariants.get(definition.key);

        if (answerVariant === undefined) {
          this._answerVariants.set(definition.key, variantIndex);
        } else if (answerVariant !== variantIndex) {
          this._result[definition.key] = null;
          this._answerVariants.delete(definition.key);
          changed = true;
        }
      });

    this._questions
      .filter((question) => !path.has(String(question.id)) && question.key in this._result)
      .forEach((question) => {
        delete this._result[question.key];
        this._answerVariants.delete(question.key);
        changed = true;
      });

    return changed;
  }

  protected _update() {
    do {
      this._pathById = this._computePath();
    } while (this._invalidate(this._pathById));

    this._path = [...this._pathById.values()];

    this._buildState();
  }

  protected _toQuestion(step: Step<Definition>): QuaireQuestion<Definition> {
    return {
      ...step.definition,
      value: step.value ?? null,
      error: step.error,
      isValid: step.error === null,
      hasValue: step.hasValue,
    };
  }

  // questions that are not on the path have no errors
  protected _getQuestion(id: QuaireId): QuaireQuestion<Definition> {
    const step = this._pathById.get(String(id));

    if (step) {
      return this._toQuestion(step);
    }

    return this._toQuestion({ ...this._getStep(this._getDefinition(id) as Definition), error: null });
  }

  protected _getDisplayValue(question: QuaireQuestion<Definition>) {
    if (question.value === NO_VALUE) {
      return NO_VALUE;
    }

    const definition = question as unknown as QuaireResolvedDefinition<Definition>;

    return this._getComponent(question.type).getDisplayValue?.(definition, question.value) ?? question.value;
  }

  // prefers an answered question on the path, then any question on the path
  protected _getNavigationQuestion(navigationId: QuaireId) {
    const questions = this._questions.filter((question) => isSameId(question.navigationId, navigationId));
    const steps = this._path.filter((step) => isSameId(step.definition.navigationId, navigationId));
    const step = steps.find((item) => item.hasValue) || steps[0];

    if (step) {
      return this._toQuestion(step);
    }

    return questions.length > 0 ? this._getQuestion(questions[0].id) : null;
  }

  protected _isComplete() {
    const lastStep = this._path[this._path.length - 1];

    return (
      lastStep !== undefined &&
      lastStep.hasValue &&
      this._path.every((step) => step.error === null) &&
      this._getNext(lastStep.definition, lastStep.value) === undefined
    );
  }

  protected _buildState() {
    const activeQuestion = this._activeId === null ? null : this._getQuestion(this._activeId);
    const errors: Record<string, QuaireError> = {};

    this._path.forEach((step) => {
      if (step.error) {
        errors[String(step.definition.id)] = step.error;
      }
    });

    this._state = {
      activeQuestion,
      result: { ...this._result } as QuairePartialResult<Result>,
      errors,
      navigation: buildNavigation(this._navigation, {
        getQuestion: (navigationId) => this._getNavigationQuestion(navigationId),
        isReachable: (question) => this._pathById.has(String(question.id)),
        getDisplayValue: (question) => this._getDisplayValue(question),
        activeNavigationId: activeQuestion?.navigationId,
      }),
      path: this._path.map((step) => step.definition.id),
      progress: {
        answered: this._path.filter((step) => step.hasValue && step.error === null).length,
        total: this._path.length,
      },
      isValid: Object.keys(errors).length === 0,
      isComplete: this._isComplete(),
      canGoBack: this._history.length > 0,
    };
  }

  protected _notify() {
    this._listeners.forEach((listener) => listener(this._state));
  }

  // the state object only changes when the flow changes, e.g. for React's useSyncExternalStore
  public getState() {
    return this._state;
  }

  public subscribe(
    listener: (
      state: QuaireState<
        Result,
        QuaireQuestion<Definition>,
        QuaireNavigationItem<NavigationDefinition, QuaireQuestion<Definition>>
      >,
    ) => void,
  ) {
    this._listeners.add(listener);

    return () => {
      this._listeners.delete(listener);
    };
  }

  public getActiveQuestion() {
    return this._state.activeQuestion;
  }

  public getResult() {
    return this._state.result;
  }

  public getErrors() {
    return this._state.errors;
  }

  public getNavigation() {
    return this._state.navigation;
  }

  public getProgress() {
    return this._state.progress;
  }

  public isValid() {
    return this._state.isValid;
  }

  public isComplete() {
    return this._state.isComplete;
  }

  public canGoBack() {
    return this._state.canGoBack;
  }

  // saves the answer of the active question and moves to the next question if the answer is valid
  public saveAnswer(value: unknown) {
    const question = this._getDefinition(this._activeId);

    if (!question) {
      return;
    }

    const { definition } = resolveDefinition(question, this._result);

    this._result[definition.key] = value;
    this._answerVariants.delete(definition.key);
    this._update();

    const nextId = this._state.activeQuestion?.error ? undefined : this._getNext(definition, value);

    if (nextId !== undefined && this._getDefinition(nextId)) {
      this._history.push(question.id);
      this._activeId = nextId;
      this._buildState();
    }

    this._notify();
  }

  public goTo(questionId: QuaireId) {
    const question = this._getDefinition(questionId);

    if (!question || isSameId(question.id, this._activeId)) {
      return;
    }

    // there is always an active question when questions exist
    this._history.push(this._activeId as QuaireId);
    this._activeId = question.id;
    this._buildState();
    this._notify();
  }

  // a navigation item without a question leads to the question of its first child
  public goToNavigationItem(navigationId: QuaireId) {
    const firstChild = this._navigation.find((item) => isSameId(item.parentId, navigationId));
    const question =
      this._getNavigationQuestion(navigationId) || (firstChild && this._getNavigationQuestion(firstChild.id));

    if (question) {
      this.goTo(question.id);
    }
  }

  public back() {
    const previousId = this._history.pop();

    if (previousId === undefined) {
      return;
    }

    this._activeId = previousId;
    this._buildState();
    this._notify();
  }

  public reset() {
    this._result = {};
    this._answerVariants.clear();
    this._history = [];
    this._activeId = this._questions.length > 0 ? this._questions[0].id : null;
    this._update();
    this._notify();
  }
}
