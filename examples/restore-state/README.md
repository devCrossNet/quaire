# Restore state

Pass an existing result to restore a questionnaire, for example after a page reload
or when the user continues later:

```ts
const q = new Quaire({ items, navigationItems, result: { foo: 'option 1', bar: 'option 1.2' } });
```

quaire replays the answers in the order of the flow. It continues with the first question that has no answer
and shows the options that match the former answers.

This example uses the data of [dependencies-between-questions](../dependencies-between-questions/data.ts).
See [restore-state.spec.ts](./restore-state.spec.ts) for a complete, a partial, and an empty result.
