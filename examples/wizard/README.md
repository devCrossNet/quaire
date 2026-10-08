# Wizard: back, progress, and completion

A small checkout wizard. The gift message is only asked when the order is a gift.

This example shows:

- `getProgress()`: the number of answered questions and the number of questions on the path.
  The total changes when the user takes another branch.
- `back()` and `canGoBack()` for a back button.
- `isComplete()` to enable a submit button.
- `reset()` to start again.
- `subscribe()` to update the view after every change.

See [data.ts](./data.ts) for the data and [wizard.spec.ts](./wizard.spec.ts) for the behavior step by step.
