# Navigation

A navigation with two categories and subcategories:

```
Personal          (no own question)
├── Name          What is your name?
└── Age           How old are you?
Contact           How should we contact you?
└── Details       Where can we reach you?
```

This example shows:

- A category without its own question ("Personal"). Its `hasValue` and `isValid` come from its children.
  Selecting it with `setActiveQuestionByNavigationItemId` jumps to its first subcategory.
- A category with its own question and subcategories ("Contact").
- The navigation `value` of a select question is the label of the selected option ("E-Mail").
- Jumping back to a question and changing the answer keeps the other answers and continues with the next question.

See [data.ts](./data.ts) for the data and [navigation.spec.ts](./navigation.spec.ts) for the behavior step by step.
