# Dependencies between questions and validation

The options of a question can depend on the answers of former questions:

- Question 2 has different options, based on the answer to question 1.
- Question 3 has different options, based on the answers to question 1 and question 2.

The options are nested by result property and answer:

```ts
{
  resultProperty: 'baz',
  dependsOnResultProperties: ['foo', 'bar'],
  selectOptions: {
    foo: {
      'option 1': {
        bar: {
          'option 1.1': [{ label: 'Option 1.1.1', value: 'option 1.1.1' }],
          // ...
        },
      },
    },
  },
}
```

When the user changes the answer to question 1, the answers to question 2 and 3 are no longer valid.
quaire resets the answer to question 2 to `null`, removes the answer to question 3,
and adds a `REQUIRED` validation error until the user answers again.

```
                                                               ┌────────────┐
                                                               │            │
                                                               │ Question 1 │
                                                               │            │
                                                               └─────┬──────┘
                                                    ┌──────────┐     │      ┌──────────┐
                                                    │ Option 1 ├─────┴──────┤ Option 2 │
                                                    └─────┬────┘            └─────┬────┘
                                       ┌────────────┐     │                       │    ┌────────────┐
                                       │            │     │                       │    │            │
                                       │ Question 2 │◄────┘                       └───►│ Question 2 │
                                       │            │                                  │            │
                                       └──────┬─────┘                                  └──────┬─────┘
                           ┌────────────┐     │      ┌────────────┐        ┌────────────┐     │      ┌────────────┐
                           │ Option 1.1 ├─────┴──────┤ Option 1.2 │        │ Option 2.1 ├─────┴──────┤ Option 2.2 │
                           └─────┬──────┘            └──────┬─────┘        └─────┬──────┘            └─────┬──────┘
              ┌────────────┐     │                          │                    │                         │
              │            │     │                          │                    │                         │
              │ Question 3 │◄────┘                          │                    │                         │
              │            │                                │                    │                         │
              └──────┬─────┘                                │                    │                         │
┌──────────────┐     │      ┌──────────────┐                │                    │                         │
│ Option 1.1.1 ├─────┴──────┤ Option 1.1.2 │                │                    │                         │
└──────────────┘            └──────────────┘                │                    │                         │
                                         ┌────────────┐     │                    │                         │
                                         │            │     │                    │                         │
                                         │ Question 3 │◄────┘                    │                         │
                                         │            │                          │                         │
                                         └──────┬─────┘                          │                         │
                                                │                                │                         │
                           ┌──────────────┐     │      ┌──────────────┐          │                         │
                           │ Option 1.2.1 ├─────┴──────┤ Option 1.2.2 │          │                         │
                           └──────────────┘            └──────────────┘          │                         │
                                                              ┌────────────┐     │                         │
                                                              │            │     │                         │
                                                              │ Question 3 │◄────┘                         │
                                                              │            │                               │
                                                              └──────┬─────┘                               │
                                                                     │                                     │
                                                                     │                                     │
                                                ┌──────────────┐     │      ┌──────────────┐               │
                                                │ Option 2.1.1 ├─────┴──────┤ Option 2.1.2 │               │
                                                └──────────────┘            └──────────────┘               │
                                                                                        ┌────────────┐     │
                                                                                        │            │     │
                                                                                        │ Question 3 │◄────┘
                                                                                        │            │
                                                                                        └──────┬─────┘
                                                                                               │
                                                                                               │
                                                                          ┌──────────────┐     │      ┌──────────────┐
                                                                          │ Option 2.2.1 ├─────┴──────┤ Option 2.2.2 │
                                                                          └──────────────┘            └──────────────┘
```

See [data.ts](./data.ts) for the data and [dependencies-between-questions.spec.ts](./dependencies-between-questions.spec.ts) for the behavior step by step.
