import { defaultComponents } from './components.js';
import { matchesCondition } from './conditions.js';
import { QuaireDefinitionProblemCode } from './constants.js';
import type {
  QuaireDefinitionProblem,
  QuaireId,
  QuaireNext,
  QuaireOptions,
  QuaireQuestionDefinitionBase,
  QuaireResolvedDefinition,
  QuaireResult,
} from './types.js';
import { isNil } from './utils.js';

// applies the first variant whose condition matches the result
export const resolveDefinition = <Definition extends QuaireQuestionDefinitionBase>(
  definition: Definition,
  result: QuaireResult,
) => {
  const { variants = [], ...base } = definition;
  const variantIndex = variants.findIndex((variant) => matchesCondition(variant.when, result));

  if (variantIndex === -1) {
    return { definition: base as unknown as QuaireResolvedDefinition<Definition>, variantIndex };
  }

  const { when, ...overrides } = variants[variantIndex];

  return {
    definition: { ...base, ...overrides } as unknown as QuaireResolvedDefinition<Definition>,
    variantIndex,
  };
};

const getNextIds = (next: QuaireNext | undefined): Array<QuaireId> => {
  if (isNil(next)) {
    return [];
  }

  return Array.isArray(next) ? next.map((entry) => entry.to) : [next];
};

// all question IDs a question can lead to, including all variants and options
const getAllNextIds = (definition: QuaireQuestionDefinitionBase): Array<QuaireId> =>
  [definition, ...(definition.variants || [])].flatMap((source) => {
    const { options } = source as { options?: unknown };
    const optionNextIds = Array.isArray(options)
      ? options.flatMap((option: { next?: QuaireId }) => getNextIds(option.next))
      : [];

    return [...getNextIds(source.next), ...optionNextIds];
  });

const findDuplicates = (values: Array<string>) => values.filter((value, index) => values.indexOf(value) !== index);

// finds mistakes in the data, e.g. to check data from a CMS in a test
export const validateDefinition = ({
  questions,
  navigation = [],
  components,
}: QuaireOptions<object, QuaireQuestionDefinitionBase>): Array<QuaireDefinitionProblem> => {
  const problems: Array<QuaireDefinitionProblem> = [];
  const allComponents = { ...defaultComponents, ...components };
  const questionIds = new Set(questions.map((question) => String(question.id)));
  const navigationIds = new Set(navigation.map((item) => String(item.id)));

  findDuplicates(questions.map((question) => String(question.id))).forEach((id) =>
    problems.push({
      code: QuaireDefinitionProblemCode.DUPLICATE_ID,
      message: `The question ID "${id}" is used more than once.`,
      questionId: id,
    }),
  );

  findDuplicates(questions.map((question) => question.key)).forEach((key) =>
    problems.push({
      code: QuaireDefinitionProblemCode.DUPLICATE_KEY,
      message: `The key "${key}" is used by more than one question.`,
    }),
  );

  findDuplicates(navigation.map((item) => String(item.id))).forEach((id) =>
    problems.push({
      code: QuaireDefinitionProblemCode.DUPLICATE_NAVIGATION_ID,
      message: `The navigation ID "${id}" is used more than once.`,
      navigationId: id,
    }),
  );

  questions.forEach((question) => {
    if (!allComponents[question.type]) {
      problems.push({
        code: QuaireDefinitionProblemCode.UNKNOWN_TYPE,
        message: `Question "${question.id}" has the unknown type "${question.type}".`,
        questionId: question.id,
      });
    }

    getAllNextIds(question)
      .filter((nextId) => !questionIds.has(String(nextId)))
      .forEach((nextId) =>
        problems.push({
          code: QuaireDefinitionProblemCode.UNKNOWN_NEXT,
          message: `Question "${question.id}" leads to the unknown question "${nextId}".`,
          questionId: question.id,
        }),
      );

    if (!isNil(question.navigationId) && !navigationIds.has(String(question.navigationId))) {
      problems.push({
        code: QuaireDefinitionProblemCode.UNKNOWN_NAVIGATION,
        message: `Question "${question.id}" has the unknown navigation ID "${question.navigationId}".`,
        questionId: question.id,
      });
    }
  });

  navigation
    .filter((item) => !isNil(item.parentId) && !navigationIds.has(String(item.parentId)))
    .forEach((item) =>
      problems.push({
        code: QuaireDefinitionProblemCode.UNKNOWN_PARENT,
        message: `Navigation item "${item.id}" has the unknown parent "${item.parentId}".`,
        navigationId: item.id,
      }),
    );

  // every question must be reachable from the first question
  const questionsById = new Map(questions.map((question) => [String(question.id), question]));
  const reachable = new Set<string>();
  const queue = questions.slice(0, 1);

  while (queue.length > 0) {
    const question = queue.shift() as QuaireQuestionDefinitionBase;

    if (!reachable.has(String(question.id))) {
      reachable.add(String(question.id));
      getAllNextIds(question).forEach((nextId) => {
        const next = questionsById.get(String(nextId));

        if (next) {
          queue.push(next);
        }
      });
    }
  }

  questions
    .filter((question) => !reachable.has(String(question.id)))
    .forEach((question) =>
      problems.push({
        code: QuaireDefinitionProblemCode.UNREACHABLE,
        message: `Question "${question.id}" cannot be reached from the first question.`,
        questionId: question.id,
      }),
    );

  return problems;
};
