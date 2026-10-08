# quaire

A framework-agnostic library to create user flows, surveys, and questionnaires.

You describe the flow as data (a decision tree). quaire takes care of the behavior:
which question comes next, which answers are valid, what the navigation looks like,
and when the flow is complete. You only build the view.

# What can I build with quaire?

The library is already used for:

- Call center software (call scripts)
- Surveys
- Briefings
- Games
- Questionnaires
- Wizards and onboarding flows

# Why the name?

Because I needed one, and `Questionnaire` is hard to type. Let me know if you have a better one!

# What problem does it solve?

I often have to build features that behave like questionnaires or surveys.
Over the years, I tried a few things to make this easier.

The first approach was a static user flow, for example:

- show the first question on the first page
- the user selects option A
- navigate to the next question
- etc.

This worked well until the flow changed. Then I had to change big parts of the implementation.

I also tried finite state machines, but most of the time I ended up with spaghetti state machines,
because the flow changed often (questions were re-arranged, added, skipped, etc.).

The solution that worked best for me is a concept from game development: the decision tree.
The whole user flow is a static data structure. You can change it without changing the view or the behavior.
This gives you a clean separation of:

- data
- behavior
- presentation

# Features

- Framework-agnostic and view-independent, works with React, Vue, Svelte, Angular, or plain JavaScript
- Written in TypeScript, types included, no runtime dependencies, ESM and CommonJS
- Linear flows, branches, merges, and loops
- Branching by answers, with conditions like "age is at least 18"
- Options, titles, and other properties that change based on former answers
- Built-in components: single select, multi-select, boolean, input, and range
- Validation with built-in rules and custom validators
- Back button, progress, and completion
- Navigation with categories and subcategories
- Restore the state from an existing result
- Extensible with custom component types and custom properties
- Check your data for mistakes, e.g. data from a CMS

# Installation

```shell
npm i quaire
```

# Getting started

## 1. Define the questions

Every question has an ID, a component type, and a key. The key is the property in the result that stores the answer.
The data can be static, a JSON file, or JSON from a CMS or backend API.

```ts
import { QuaireQuestionDefinition } from 'quaire';

export const questions: QuaireQuestionDefinition[] = [
  {
    id: 1,
    type: 'SINGLE_SELECT',
    key: 'plan',
    title: 'Which plan do you want?',
    required: true,
    options: [
      { label: 'Free', value: 'free', next: 3 },
      { label: 'Pro', value: 'pro', next: 2 },
    ],
  },
  {
    id: 2,
    type: 'INPUT',
    key: 'company',
    title: 'What is your company?',
    required: true,
    next: 3,
  },
  {
    id: 3,
    type: 'BOOLEAN',
    key: 'newsletter',
    title: 'Do you want our newsletter?',
    defaultValue: false,
  },
];
```

The flow starts with the first question. `next` defines the following question.
If there is no next question, the flow ends.

## 2. Create a quaire instance

```ts
import { Quaire } from 'quaire';

const quaire = new Quaire({ questions });
```

## 3. Show the active question and save the answer

```ts
const question = quaire.getActiveQuestion();

// show question.title, question.options, question.error, etc.

quaire.saveAnswer('pro'); // moves to the next question if the answer is valid
```

`saveAnswer()` stores the answer in the result. If the answer is valid, quaire moves to the next question.
If not, the question stays active and `question.error` contains an error code.
`defaultValue` is not saved automatically. Use it as the initial value of your component.

## 4. Finish the flow

```ts
if (quaire.isComplete()) {
  save(quaire.getResult()); // { plan: 'pro', company: 'ACME', newsletter: false }
}
```

The flow is complete when the last question is answered and all answers are valid.

# Component types

| Type            | Properties                                                                           | Answer                           |
| --------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| `SINGLE_SELECT` | `options: [{ label, value, next? }]`                                                 | the value of one option          |
| `MULTI_SELECT`  | `options`, `minSelected?`, `maxSelected?`                                            | an array of option values        |
| `BOOLEAN`       | `trueLabel?`, `falseLabel?`                                                          | `true` or `false`                |
| `INPUT`         | `inputType?`, `placeholder?`, `min?`, `max?`, `minLength?`, `maxLength?`, `pattern?` | a string or a number             |
| `RANGE`         | `min`, `max`, `step?`                                                                | a number or a `[from, to]` tuple |

All questions have these properties:

| Property       | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| `id`           | ID of the question, a string or a number                                      |
| `type`         | Component type                                                                |
| `key`          | Property in the result that stores the answer                                 |
| `title`        | The question                                                                  |
| `description`  | Additional text (optional)                                                    |
| `required`     | The question must be answered (default: `false`)                              |
| `defaultValue` | Initial value for your component (optional)                                   |
| `next`         | The next question (optional, see [Branching](#branching))                     |
| `navigationId` | Navigation item of the question (optional)                                    |
| `validate`     | Custom validator (optional, see [Validation](#validation))                    |
| `variants`     | Properties that change based on answers (optional, see [Variants](#variants)) |

You can add your own component types, see [Custom component types](#custom-component-types).

# Branching

The next question is defined in this order:

1. `next` of the selected option (select components)
2. `next` of the question
3. no next question: the flow ends

`next` can be a question ID or a list of conditions. The first matching condition wins.
An entry without condition is the fallback:

```ts
{
  id: 'age',
  type: 'INPUT',
  key: 'age',
  title: 'How old are you?',
  next: [
    { when: { age: { lt: 18 } }, to: 'consent' },
    { to: 'employment' },
  ],
}
```

## Conditions

A condition is an object. Every key is a result key, and all of them must match:

| Condition                         | Matches when the answer                           |
| --------------------------------- | ------------------------------------------------- |
| `{ plan: 'pro' }`                 | is `'pro'` (or contains `'pro'` for multi-select) |
| `{ plan: ['pro', 'business'] }`   | is one of the values                              |
| `{ age: { gte: 18 } }`            | is a number `>= 18` (also `gt`, `lt`, `lte`)      |
| `{ age: { gte: 18, lt: 65 } }`    | matches all comparisons                           |
| `{ company: { answered: true } }` | has a value                                       |
| `{ plan: { not: 'free' } }`       | does not match                                    |

For everything else, use a function. Note that functions cannot be stored as JSON:

```ts
{ when: (result) => result.items.length > 3, to: 'bulk-discount' }
```

See [Conditional branching](https://github.com/devCrossNet/quaire/tree/main/examples/conditional-branching).

# Variants

Use variants when the options or other properties of a question depend on former answers.
The first variant whose condition matches is applied to the question:

```ts
{
  id: 2,
  type: 'SINGLE_SELECT',
  key: 'breed',
  title: 'Which breed?',
  options: [],
  variants: [
    { when: { animal: 'dog' }, options: [{ label: 'Poodle', value: 'poodle' }] },
    { when: { animal: 'cat' }, title: 'Which cat breed?', options: [{ label: 'Siamese', value: 'siamese' }] },
  ],
}
```

Variants can change `title`, `description`, `required`, `defaultValue`, `next`, and the properties of the component type.
When an answer changes and another variant applies, the answer to this question is reset to `null`.
See [Dependencies between questions](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions).

# The path

quaire follows the answers from the first question. The questions on this way are the **path**:

- Only questions on the path are validated.
- When the user changes an answer and takes another branch, the answers of the old branch are removed from the result.
- An unanswered question is followed when its next question is clear, e.g. when all options lead to the same question.
  So the path also shows the questions that are still open.

```ts
quaire.getState().path; // [1, 2, 3]
```

# Validation

Validation runs in this order:

1. `required`: a question without an answer gets the error `REQUIRED`.
   `null`, `undefined`, `''`, and `[]` are no answer. `false` and `0` are answers.
2. The rules of the component type, e.g. `INVALID_OPTION`, `MIN`, `MAX_LENGTH`, or `PATTERN`.
3. The custom validator of the question:

```ts
{
  id: 2,
  type: 'INPUT',
  key: 'username',
  title: 'Choose a username',
  validate: (value, result) => (value === 'admin' ? 'RESERVED' : null),
}
```

`getErrors()` returns the error codes by question ID. Map the codes to messages in your view.
All built-in codes are in `QuaireErrorCode`.
See [Validation](https://github.com/devCrossNet/quaire/tree/main/examples/validation).

## Skip a question

- An optional question can be skipped: `saveAnswer(null)` moves to the next question.
- Save the `NO_VALUE` constant to mark a question as answered without a value, e.g. for a "Skip" or "I don't know" button.
  The navigation shows `NO_VALUE` as its value.

See [Linear flow with an optional question](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-skip-question).

# Back, progress, and jumping to questions

```ts
quaire.back(); // the previous question
quaire.canGoBack(); // false on the first question
quaire.goTo(3); // any question
quaire.getProgress(); // { answered: 2, total: 4 }
quaire.reset(); // start again
```

`total` is the number of questions on the path. It can change when the user takes another branch.
See [Wizard](https://github.com/devCrossNet/quaire/tree/main/examples/wizard).

# Navigation

```ts
import { QuaireNavigationDefinition } from 'quaire';

const navigation: QuaireNavigationDefinition[] = [
  { id: 'about', title: 'About you', icon: 'user' },
  { id: 'plan', parentId: 'about', title: 'Plan' }, // only one level is supported
  { id: 'contact', title: 'Contact' },
];

const quaire = new Quaire({ questions, navigation });
quaire.getNavigation();
quaire.goToNavigationItem('about'); // a parent without question jumps to its first child
```

Questions are assigned with `navigationId`. `getNavigation()` returns the navigation items with these properties:

| Property    | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `question`  | The question of this item, or `null`                            |
| `value`     | The answer. For select components, the label of the option      |
| `active`    | The active question belongs to this item or one of its children |
| `hasValue`  | This item or one of its children has an answer                  |
| `isValid`   | This item and all its children are valid                        |
| `reachable` | The question of this item or one of its children is on the path |
| `children`  | The children of a top-level item                                |

All other properties of the definition, e.g. `title` and `icon`, are kept.
Items without any question are not shown.
See [Navigation](https://github.com/devCrossNet/quaire/tree/main/examples/navigation).

# Restore the state

Save the result, e.g. in your backend, and pass it back later.
quaire follows the path and continues with the first open question:

```ts
const quaire = new Quaire({ questions, result: { plan: 'pro' } });

quaire.getActiveQuestion().id; // 2
quaire.canGoBack(); // true
```

See [Restore state](https://github.com/devCrossNet/quaire/tree/main/examples/restore-state).

# Framework integration

`getState()` returns one object with everything your view needs.
The object only changes when the flow changes, and `subscribe()` calls a listener after every change.

```ts
const { activeQuestion, result, errors, navigation, path, progress, isValid, isComplete, canGoBack } =
  quaire.getState();

const unsubscribe = quaire.subscribe((state) => render(state));
```

## React

```tsx
import { useMemo, useSyncExternalStore } from 'react';
import { Quaire, QuaireOptions } from 'quaire';

export const useQuaire = (options: QuaireOptions) => {
  const quaire = useMemo(() => new Quaire(options), []);
  const state = useSyncExternalStore(
    (listener) => quaire.subscribe(listener),
    () => quaire.getState(),
  );

  return { quaire, state };
};
```

## Vue

```ts
import { onUnmounted, shallowRef } from 'vue';
import { Quaire, QuaireOptions } from 'quaire';

export const useQuaire = (options: QuaireOptions) => {
  const quaire = new Quaire(options);
  const state = shallowRef(quaire.getState());

  onUnmounted(quaire.subscribe((newState) => (state.value = newState)));

  return { quaire, state };
};
```

# TypeScript

## Typed result

By default, all answers are `unknown`. Pass your result type as the first type parameter.
Each answer is optional and can be `null`: it is missing until the user answers, and it is reset to `null` when it becomes invalid.

```ts
type MyResult = {
  plan: 'free' | 'pro';
  newsletter: boolean;
};

const quaire = new Quaire<MyResult>({ questions });
quaire.getResult(); // { plan?: 'free' | 'pro' | null; newsletter?: boolean | null }
```

## Questions by type

`type` tells TypeScript which properties a question has:

```ts
const question = quaire.getActiveQuestion();

if (question?.type === 'SINGLE_SELECT') {
  question.options; // QuaireSelectOption[]
}
```

## Custom properties

Add your own properties to questions, options, and navigation items, e.g. for your view:

```ts
type MyQuestionDefinition = QuaireQuestionDefinition & { progress: number };
type MyNavigationDefinition = QuaireNavigationDefinition & { color: string };

const quaire = new Quaire<MyResult, MyQuestionDefinition, MyNavigationDefinition>({ questions, navigation });

quaire.getActiveQuestion().progress;
quaire.getNavigation()[0].color;
```

See [Extending the data definition](https://github.com/devCrossNet/quaire/tree/main/examples/extending-data-definition).

## Custom component types

A component defines how quaire handles a type. All functions are optional:

```ts
import { QuaireComponent, QuaireQuestionDefinition, QuaireQuestionDefinitionBase } from 'quaire';

type RatingDefinition = QuaireQuestionDefinitionBase<'RATING', { stars: number }>;
type MyQuestionDefinition = QuaireQuestionDefinition | RatingDefinition;

const rating: QuaireComponent<RatingDefinition> = {
  hasValue: (value) => typeof value === 'number', // default: not null, undefined, '' or []
  validate: (definition, value) => (Number(value) <= definition.stars ? null : 'INVALID_RATING'),
  getNext: (definition, value) => undefined, // default: the `next` of the question
  getDisplayValue: (definition, value) => `${value} / ${definition.stars}`, // shown in the navigation
};

const quaire = new Quaire<MyResult, MyQuestionDefinition>({ questions, components: { RATING: rating } });
```

You can also replace a built-in component, e.g. `components: { INPUT: myInput }`.
See [Custom component types](https://github.com/devCrossNet/quaire/tree/main/examples/custom-component-types).

# Check your data

`validateDefinition()` finds mistakes in your data, e.g. in a test for data from a CMS:

```ts
import { validateDefinition } from 'quaire';

expect(validateDefinition({ questions, navigation })).toEqual([]);
```

It finds duplicate IDs and keys, unknown types, `next` targets that do not exist, questions that cannot be reached,
and unknown navigation items. Each problem has a `code` and a `message`.

# API

## Options

| Option       | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `questions`  | The question definitions, the flow starts with the first one |
| `navigation` | The navigation definitions (optional)                        |
| `result`     | An existing result to restore (optional)                     |
| `components` | Custom or replaced component types (optional)                |

## Methods

| Method                   | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `getState()`             | Everything below in one object, the same object until the next change  |
| `subscribe(listener)`    | Calls the listener after every change, returns an unsubscribe function |
| `getActiveQuestion()`    | The active question or `null`                                          |
| `saveAnswer(value)`      | Saves the answer and moves to the next question if it is valid         |
| `getResult()`            | All answers by key                                                     |
| `getErrors()`            | The error codes by question ID                                         |
| `getNavigation()`        | The navigation with values and states                                  |
| `getProgress()`          | `{ answered, total }` of the path                                      |
| `isValid()`              | `true` when there are no errors on the path                            |
| `isComplete()`           | `true` when the last question is answered and all answers are valid    |
| `canGoBack()`            | `true` when there is a previous question                               |
| `back()`                 | Goes to the previous question                                          |
| `goTo(questionId)`       | Goes to a question                                                     |
| `goToNavigationItem(id)` | Goes to the question of a navigation item                              |
| `reset()`                | Removes all answers and starts again                                   |

## Exports

`Quaire`, `validateDefinition`, `matchesCondition`, `hasValue`, `defaultComponents`, `NO_VALUE`,
`QuaireComponentType`, `QuaireErrorCode`, `QuaireDefinitionProblemCode`, and all types.

# Migration from 0.x

| 0.x                                            | 1.0                                                       |
| ---------------------------------------------- | --------------------------------------------------------- |
| `new Quaire({ items, navigationItems })`       | `new Quaire({ questions, navigation })`                   |
| `QuaireItem`                                   | `QuaireQuestionDefinition`                                |
| `QuaireNavigationItem` (input)                 | `QuaireNavigationDefinition`                              |
| `componentType`                                | `type`                                                    |
| `resultProperty`                               | `key`                                                     |
| `question` (text)                              | `title`                                                   |
| `navigationItemId`                             | `navigationId`                                            |
| `name` (navigation)                            | `title`                                                   |
| `selectOptions`                                | `options`                                                 |
| `rangeOption: { range: [min, max] }`           | `min`, `max`                                              |
| `inputOption: { type, placeholder }`           | `inputType`, `placeholder`                                |
| `nextItemId`                                   | `next`                                                    |
| `RANGE_SLIDER`                                 | `RANGE`                                                   |
| `dependsOnResultProperties` and nested options | `variants` with `when` conditions                         |
| `subNavigation`                                | `children`                                                |
| `setActiveQuestionByQuestionId(id)`            | `goTo(id)`                                                |
| `setActiveQuestionByNavigationItemId(id)`      | `goToNavigationItem(id)`                                  |
| `getValidationErrors()`                        | `getErrors()`                                             |
| `QuaireValidationError.REQUIRED`               | `QuaireErrorCode.REQUIRED`                                |
| Subclass and override protected methods        | `components` option and custom properties                 |
| No next question: the question stays active    | No next question: the flow ends, `isComplete()` is `true` |
| Answers of other branches stay in the result   | Only answers on the path stay in the result               |

# Examples

Each example has a README, the data, and tests that show the behavior step by step.

- [Linear flow](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow)
- [Linear flow with a loop](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-with-loop)
- [Linear flow with an optional question](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-skip-question)
- [Branched flow that merges back into one](https://github.com/devCrossNet/quaire/tree/main/examples/branched-and-merged-flow)
- [Conditional branching](https://github.com/devCrossNet/quaire/tree/main/examples/conditional-branching)
- [Dependencies between questions](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions)
- [Validation](https://github.com/devCrossNet/quaire/tree/main/examples/validation)
- [Wizard: back, progress, and completion](https://github.com/devCrossNet/quaire/tree/main/examples/wizard)
- [Navigation](https://github.com/devCrossNet/quaire/tree/main/examples/navigation)
- [Restore state](https://github.com/devCrossNet/quaire/tree/main/examples/restore-state)
- [Custom component types](https://github.com/devCrossNet/quaire/tree/main/examples/custom-component-types)
- [Extending the data definition](https://github.com/devCrossNet/quaire/tree/main/examples/extending-data-definition)

# Contribute

Contributions are always welcome! Please read the [contribution guidelines](https://github.com/devCrossNet/quaire/blob/main/.github/CONTRIBUTING.md) first.

# Contact

- [Discord](https://discord.gg/59x5cg2)

# License

[MIT](http://opensource.org/licenses/MIT)
