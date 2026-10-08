# Restore state

Pass an existing result to restore a flow, for example after a page reload
or when the user continues later:

```ts
const quaire = new Quaire({ questions, navigation, result: { foo: 'option 1', bar: 'option 1.2' } });
```

quaire follows the path of the answers and continues with the first open question.
This is the first question without an answer or with an invalid answer.
The questions before it are in the history, so `back()` works as expected.

The result that you pass in is not changed.

This example uses the data of [dependencies-between-questions](../dependencies-between-questions/data.ts).
See [restore-state.spec.ts](./restore-state.spec.ts) for a complete, a partial, an invalid, and an empty result.
