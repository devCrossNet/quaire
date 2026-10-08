# quaire

A framework-agnostic library to create user flows, surveys, and questionnaires.

You describe the flow as data (a decision tree). quaire takes care of the behavior:
which question comes next, which answers are valid, and what the navigation looks like.
You only build the view.

# What can I build with quaire?

The library is already used for:

- Call center software (call scripts)
- Surveys
- Briefings
- Games
- Questionnaires

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

- Framework-agnostic and view-independent
- Written in TypeScript, types included
- No runtime dependencies
- Linear flows, branches, merges, and loops
- Optional questions that can be skipped
- Options that depend on former answers
- Validation that resets answers when they are no longer valid
- Navigation with categories and subcategories
- Restore the state from an existing result
- Typed result
- Extensible with custom component types and custom data

# Installation

```shell
npm i quaire
```

# Getting started

## 1. Define the questions

The questions are a list of [QuaireItem](https://github.com/devCrossNet/quaire/blob/main/src/types.ts) objects.
This can be static data in a JS/TS file, a JSON file that you load on demand,
or JSON from a CMS or backend API.

```ts
import { QuaireComponentType, QuaireItem } from 'quaire';

export const items: QuaireItem[] = [
  {
    id: 1,
    resultProperty: 'foo', // property in the result that stores the answer
    navigationItemId: 1, // navigation entry of this question (optional)
    dependsOnResultProperties: [], // result properties of former questions that change the options (see below)
    componentType: QuaireComponentType.SINGLE_SELECT, // tells your view which component to render
    question: 'Question 1',
    description: 'Description 1',
    required: true,
    selectOptions: [
      { label: 'Option 1', value: 'option 1', nextItemId: 2 },
      { label: 'Option 2', value: 'option 2', nextItemId: 3 },
    ],
    defaultValue: 'option 1', // (optional)
  },
  // ...
];
```

### Component types

The component type defines where quaire finds the next question:

| Component type   | Options                                          | Next question                       |
| ---------------- | ------------------------------------------------ | ----------------------------------- |
| `SINGLE_SELECT`  | `selectOptions: [{ label, value, nextItemId }]`  | `nextItemId` of the selected option |
| `RANGE_SLIDER`   | `rangeOption: { range, nextItemId }`             | `rangeOption.nextItemId`            |
| `INPUT`          | `inputOption: { type, placeholder, nextItemId }` | `inputOption.nextItemId`            |
| any other string | -                                                | `nextItemId` of the item            |

If there is no next question, the active question stays the same.
You can add your own component types, see [Custom component types](https://github.com/devCrossNet/quaire/tree/main/examples/custom-component-types).

### Options that depend on former answers

Use `dependsOnResultProperties` when the options of a question depend on the answer of a former question.
The options are then nested by the result property and the answer:

```ts
{
  id: 2,
  resultProperty: 'bar',
  dependsOnResultProperties: ['foo'],
  // ...
  selectOptions: {
    foo: {
      'option 1': [{ label: 'Option 1.1', value: 'option 1.1', nextItemId: 3 }],
      'option 2': [{ label: 'Option 2.1', value: 'option 2.1', nextItemId: 3 }],
    },
  },
}
```

This works the same way for `rangeOption`, `inputOption`, and `defaultValue`.
With more than one dependency, the objects are nested in the same order, for example
`{ foo: { 'option 1': { bar: { 'option 1.1': [...] } } } }`.
See [Dependencies between questions](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions).

## 2. Define the navigation (optional)

```ts
import { QuaireNavigationItem } from 'quaire';

export const navigationItems: QuaireNavigationItem[] = [
  { id: 1, parentId: null, name: 'Category 1' }, // has no parent
  { id: 2, parentId: 1, name: 'Subcategory 1' }, // has a parent (only one level is supported)
  { id: 3, parentId: null, name: 'Category 2', icon: 'phone' },
];
```

`getNavigation()` returns the navigation items with these additional properties:

| Property        | Description                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| `value`         | Answer of the question. For select components, the option label                  |
| `active`        | The active question belongs to this item (or one of its children)                |
| `hasValue`      | The question of this item (or one of its children) has an answer                 |
| `isValid`       | The question of this item is valid. Without own question: all children are valid |
| `componentType` | Component type of the question                                                   |
| `subNavigation` | Children of a parent item                                                        |

A parent item without its own question is shown only if it has children with questions.
Navigation items without any question are not shown.
See [Navigation](https://github.com/devCrossNet/quaire/tree/main/examples/navigation).

## 3. Use quaire

Create a `Quaire` instance with your data:

```ts
import { Quaire } from 'quaire';

const q = new Quaire({ items, navigationItems });
```

Get the active question and show it in any way you want:

```ts
let activeQuestion = q.getActiveQuestion(); // first question
let navigation = q.getNavigation();
let result = q.getResult(); // {}
```

```vue
<!-- Vue.js example -->
<template>
  <div v-if="activeQuestion.componentType === 'SINGLE_SELECT'">
    <h2>{{ activeQuestion.question }}</h2>
    <button v-for="option in activeQuestion.selectOptions" :key="option.value" @click="onSubmit(option.value)">
      {{ option.label }}
    </button>
  </div>
</template>
```

When the user answers, save the answer. Then get the next question and update the navigation and the result:

```ts
function onSubmit(value: unknown) {
  q.saveAnswer(value);

  activeQuestion = q.getActiveQuestion(); // next question
  navigation = q.getNavigation();
  result = q.getResult();
}
```

`defaultValue` is not saved automatically. To use it, pass it to `saveAnswer()`, for example as the initial value of your input.

## 4. Detect the end of the flow

You need to detect the end of the user flow yourself, for example via the question ID or via the result:

```ts
function onSubmit(value: unknown) {
  // ...

  if (!q.isValid()) {
    return;
  }

  // via question ID
  if (activeQuestion.id === 3) {
    // save the result, redirect to another page, etc.
  }

  // via result
  if (result.foo && result.bar && result.baz) {
    // save the result, redirect to another page, etc.
  }
}
```

# Guides

## Validation

- A required question without an answer gets a `REQUIRED` error.
- `isValid()` is `true` when there are no errors. `getValidationErrors()` returns the errors by question ID.
- If an answer changes, dependent answers that are no longer valid are reset to `null` or removed.
  Questions that are no longer part of the flow are removed from the result.

## Skip an optional question

There are two ways to skip a question:

- Branch around it: an option of a former question points to the question after it.
- Save the `NO_VALUE` constant as the answer. The navigation then shows the question as answered.

```ts
import { NO_VALUE } from 'quaire';

q.saveAnswer(NO_VALUE);
```

See [Linear flow with an optional question](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-skip-question).

## Jump to a question

```ts
q.setActiveQuestionByQuestionId(2);
q.setActiveQuestionByNavigationItemId(1); // a parent item without question jumps to its first child
```

After the user changes the answer, the flow continues with the next question. The other answers stay.

## Restore the state

Save the result (for example in your backend) and pass it back later.
quaire replays the answers and continues with the first question that has no answer:

```ts
const q = new Quaire({ items, navigationItems, result: { foo: 'option 1', bar: 'option 1.2' } });
```

See [Restore state](https://github.com/devCrossNet/quaire/tree/main/examples/restore-state).

## Typed result

By default, all answers are `unknown`. Pass your own result type as the first type parameter to get a typed result.
Each answer is optional and can be `null`: it is missing until the user answers, and it is reset to `null` when it becomes invalid.

```ts
import { Quaire } from 'quaire';

type MyResult = {
  foo: string;
  bar: Array<number>;
};

const q = new Quaire<MyResult>({ items, navigationItems });
const result = q.getResult(); // { foo?: string | null; bar?: Array<number> | null }
```

# API

| Method                                                  | Description                                          |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `getActiveQuestion()`                                   | Returns the active question or `null`                |
| `saveAnswer(answer)`                                    | Saves the answer of the active question and moves on |
| `getResult()`                                           | Returns all answers by result property               |
| `getNavigation()`                                       | Returns the navigation with values and states        |
| `isValid()`                                             | Returns `true` when there are no validation errors   |
| `getValidationErrors()`                                 | Returns the validation errors by question ID         |
| `setActiveQuestionByQuestionId(questionId)`             | Sets the active question                             |
| `setActiveQuestionByNavigationItemId(navigationItemId)` | Sets the active question by navigation item          |

# Extend quaire

`Quaire` is a class. Extend it and override its protected methods to change the behavior:

- [Custom component types](https://github.com/devCrossNet/quaire/tree/main/examples/custom-component-types): add multi-select and boolean components
- [Extending the data definition](https://github.com/devCrossNet/quaire/tree/main/examples/extending-data-definition): add your own properties to questions and navigation items

# Examples

Each example has a README with a diagram, the data, and tests that show the behavior step by step.

- [Linear flow](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow)
- [Linear flow with a loop](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-with-loop)
- [Linear flow with an optional question](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-skip-question)
- [Branched flow that merges back into one](https://github.com/devCrossNet/quaire/tree/main/examples/branched-and-merged-flow)
- [Dependencies between questions and validation](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions)
- [Navigation](https://github.com/devCrossNet/quaire/tree/main/examples/navigation)
- [Restore state](https://github.com/devCrossNet/quaire/tree/main/examples/restore-state)

# Contribute

Contributions are always welcome! Please read the [contribution guidelines](https://github.com/devCrossNet/quaire/blob/main/.github/CONTRIBUTING.md) first.

# Contact

- [Discord](https://discord.gg/59x5cg2)

# License

[MIT](http://opensource.org/licenses/MIT)
