# quaire

a framework-agnostic library to create user-flows, surveys, and questionnaires

# Why the name?

Because I needed one and `Questionnaire` is terrible to type. Let me know if you have a better one!

# What use-case does it try to solve?

I have to implement more and more features that behave like questionnaires or surveys.
Over the years I tried a couple of things to make it easier for me to implement those features.

Of course, the first approach I tried was to implement a static user flow, for example:

- present first question on first page
- user selects option a
- navigate to the next question
- etc.

That was ok as long as I didn't have to change the flow but when I had to change the flow,
I found myself changing big parts of the implementation.

I also tried to use finite state machines,
but I ended up with spaghetti state machines most of the time
due to regular changes in the user-flow (re-arranging questions, adding questions, skip questions, etc.)

The solution I found to work best for me was a concept of game-development called decision-tree.
That way the whole user-flow is based on a static data structure that can be changed without the need of changing
the view or the behaviour. This pattern provides a nice separation of:

- data
- behaviour
- presentation

# Features?

- Framework-agnostic
- View independent
- [Linear user-flow](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow)
- [Branched/merged user-flow](https://github.com/devCrossNet/quaire/tree/main/examples/branched-and-merged-flow)
- [Loops](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-with-loop)
- [Dependencies between questions and validation](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions)
- [Re-storing state of the questionnaire from the selected answers](https://github.com/devCrossNet/quaire/blob/main/examples/restore-state.spec.ts)
- Navigation

# How does it work?

## Installation

```shell
npm i --save quaire
```

## Define quaire data

First you need to define the data (decision tree) based on the
[QuaireItem interface](https://github.com/devCrossNet/quaire/blob/main/src/interfaces.ts#L43). This can be static
data in a JS/TS file, a JSON file that you load on demand
or a dynamic JSON from a CMS or backend API.

The structure for questions looks as follows:

```js
import { QuaireComponentType, QuaireItem, QuaireNavigationItem } from 'quaire';

export const items: QuaireItem[] = [
  {
    id: 1,
    resultProperty: 'foo', // property that is used to save the answer
    navigationItemId: 1, // assiciation with the navigation entry (optional)
    dependsOnResultProperties: [], // dependencies on answers from former questions, based on the result property - not questions IDs
    componentType: QuaireComponentType.SINGLE_SELECT, // component type as indication for custom presentation logic
    question: 'Question 1',
    description: 'Description 1',
    required: true,
    selectOptions: [], // options for select components (optional)
    rangeOption: {}, // option for range components (optional)
    inputOption: {}, // option for input components (optional)
    defaultValue: {}, // default value for any kind of component (optional)
    nextItemId: {}, // id of the follow up question (optional), usually you want to define this in selectOptions, rangeOption or inputOption
  },
  // ...
];
```

The structure for the navigation looks a follows:

```js
export const navigationItems: QuaireNavigationItem[] = [
  {
    id: 1,
    parentId: null, // has no parent
    name: 'Category 1',
  },
  {
    id: 2,
    parentId: 1, // has a parent (works only for one level)
    name: 'Subcategory 1',
  },
  {
    id: 3,
    parentId: null,
    name: 'Category 2',
  },
];
```

## Use quaire behaviour

To use the default behavior you need to initialize `Quaire` with the data you
defined in the former step.

```js
import { Quaire } from 'quaire';

const q = new Quaire({ items, navigationItems }); // (optional) you can pass an existing result to restore the questionnaire
```

Next you can get the first active Question and display it in any way you want

```js
let activeQuestion = q.getActiveQuestion(); // first question
let navigation = q.getNavigation(); // initial navigation
let result = q.getResult(); // initial result

// display activeQuestion.question and the related component presentation logic
// Vue.js pseudo code example
<template>
    <div>
        <template v-if="activeQuestion.componentType === 'SINGLE_SELECT'">
            {{ activeQuestion.question }}
            // loop through activeQuestion.selectOptions, etc.
        <template>
    </div>
</template>
```

After the user selected an answer you can save the answer and get the next question.
It's also a good idea to update the navigation and result

```js
onSubmit(value: any) {
    q.saveAnswer(value);
    activeQuestion = q.getActiveQuestion(); // follow up question
    navigation = q.getNavigation(); // update navigation
    result = q.getResult(); // update result

    // ...
}
```

You need to identify the end of the user-flow on your own.
One way to do it is via the question ID or you create some logic around
the result object of the Questionnaire.

```js
onSubmit(value: any) {
    // ...
    const isValid = q.isValid();

    // check if the questionnaire is valid
    if(!isValid) {
        return;
    }

    // via ID
    if(activeQuestion.id === 3) {
        // persist result to the backend, redirect to another page,
        // whatever you want after the questionnaire is filled out
    }

    // via result
    if(result.foo && result.bar && result.baz) {
        // persist result to the backend, redirect to another page,
        // whatever you want after the questionnaire is filled out
    }
}
```

# Extend quaire

- [Custom component types](https://github.com/devCrossNet/quaire/tree/main/examples/custom-component-types)
- [Extending data definition](https://github.com/devCrossNet/quaire/tree/main/examples/extending-data-definition)

# Examples

- [Linear flow](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow)
- [Linear flow with a loop](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-with-loop)
- [Linear flow with option question](https://github.com/devCrossNet/quaire/tree/main/examples/linear-flow-skip-question)
- [Branched flow that merges back into one](https://github.com/devCrossNet/quaire/tree/main/examples/branched-and-merged-flow)
- [Dependencies between questions and validation](https://github.com/devCrossNet/quaire/tree/main/examples/dependencies-between-questions)
- [Re-storing state of the questionnaire from the selected answers](https://github.com/devCrossNet/quaire/tree/main/examples/restore-state.spec.ts)

# Contribute

Contributions are always welcome! Please read the [contribution guidelines](https://github.com/devCrossNet/quaire/blob/master/.github/CONTRIBUTING.md) first.

# Contact

- [Discord](https://discord.gg/59x5cg2)
- [Twitter](https://twitter.com/_jwerner_)

# License

[MIT](http://opensource.org/licenses/MIT)
