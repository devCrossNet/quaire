# Dependencies between questions

The options of a question can depend on the answers of former questions:

- Question 2 has different options, based on the answer to question 1.
- Question 3 has different options, based on the answers to question 1 and question 2.

Each question has a list of `variants`. The first variant whose condition matches is applied:

```ts
{
  id: 3,
  type: 'SINGLE_SELECT',
  key: 'baz',
  title: 'Question 3',
  options: [],
  variants: [
    { when: { foo: 'option 1', bar: 'option 1.1' }, options: [...] },
    { when: { foo: 'option 1', bar: 'option 1.2' }, options: [...] },
    // ...
  ],
}
```

When the user changes the answer to question 1, other variants apply to question 2 and 3.
quaire resets their answers to `null`, and they get the error `REQUIRED` until the user answers again.

```

When the user changes the answer to question 1, the answers to question 2 and 3 are no longer valid.
quaire resets the answer to question 2 to `null`, removes the answer to question 3,
and adds a `REQUIRED` validation error until the user answers again.

```

See [data.ts](./data.ts) for the data and [dependencies-between-questions.spec.ts](./dependencies-between-questions.spec.ts) for the behavior step by step.
