import type { QuaireId, QuaireNavigationDefinition, QuaireNavigationItem } from './types.js';
import { isNil, isSameId } from './utils.js';

type NavigationQuestion = {
  hasValue: boolean;
  isValid: boolean;
};

type NavigationOptions<Question extends NavigationQuestion> = {
  // the question that is shown for a navigation item
  getQuestion: (navigationId: QuaireId) => Question | null;
  isReachable: (question: Question) => boolean;
  getDisplayValue: (question: Question) => unknown;
  activeNavigationId: QuaireId | undefined;
};

export const buildNavigation = <
  NavigationDefinition extends QuaireNavigationDefinition,
  Question extends NavigationQuestion,
>(
  navigation: Array<NavigationDefinition>,
  { getQuestion, isReachable, getDisplayValue, activeNavigationId }: NavigationOptions<Question>,
): Array<QuaireNavigationItem<NavigationDefinition, Question>> => {
  const toItem = (definition: NavigationDefinition) => {
    const { parentId, ...properties } = definition;
    const question = getQuestion(definition.id);

    return {
      ...properties,
      question,
      value: question?.hasValue ? getDisplayValue(question) : null,
      active: isSameId(activeNavigationId, definition.id),
      hasValue: question?.hasValue ?? false,
      isValid: question?.isValid ?? true,
      reachable: question ? isReachable(question) : false,
    } as QuaireNavigationItem<NavigationDefinition, Question>;
  };

  // parents first, so children can be added independent of their position in the list
  const parents = navigation
    .filter((definition) => isNil(definition.parentId))
    .map((definition) => ({
      ...toItem(definition),
      children: [] as Array<QuaireNavigationItem<NavigationDefinition, Question>>,
    }));

  navigation
    .filter((definition) => !isNil(definition.parentId))
    .forEach((definition) => {
      const parent = parents.find((item) => isSameId(item.id, definition.parentId));
      const child = toItem(definition);

      // ignore children without a question or with an unknown parent
      if (parent && child.question) {
        parent.children.push(child);
      }
    });

  // a parent combines its own state with the state of its children
  return parents
    .filter((parent) => parent.question || parent.children.length > 0)
    .map((parent) => {
      const items = parent.question ? [parent, ...parent.children] : parent.children;

      return {
        ...parent,
        active: items.some((item) => item.active),
        hasValue: items.some((item) => item.hasValue),
        isValid: items.every((item) => item.isValid),
        reachable: items.some((item) => item.reachable),
      };
    });
};
