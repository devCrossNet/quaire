# Linear flow with an optional question

Question 2 is optional. This example shows two ways to skip it:

- **Branch around it:** Option 2 of question 1 leads directly to question 3.
  Question 2 is not on the path, so the navigation shows it as not `reachable`.
- **Answer with `NO_VALUE`:** Question 2 has a "Skip" option with the value `NO_VALUE`.
  The question counts as answered, and the navigation shows `NO_VALUE` as its value.

An optional question can also be skipped with `saveAnswer(null)`.

```
           ┌────────────┐
           │            │
           │ Question 1 │
           │            │
           └─────┬──────┘
                 │
                 │
┌──────────┐     │      ┌──────────┐
│ Option 1 ├─────┴──────┤ Option 2 ├──────┐
└────┬─────┘            └──────────┘      │
     │                                    │
     │                                    │
     │                                    │
     └────►┌────────────┐                 │
           │            │                 │
           │ Question 2 │                 │
           │            │                 │
           └─────┬──────┘                 │
                 │                        │
                 │                        │
┌──────────┐     │      ┌──────────┐      │
│ Option 1 ├─────┴──────┤ Option 2 │      │
└────┬─────┘            └─────┬────┘      │
     │                        │           │
     │                        │           │
     │                        │           │
     └────►┌────────────┐◄────┴───────────┘
           │            │
           │ Question 3 │
           │            │
           └─────┬──────┘
                 │
                 │
┌──────────┐     │      ┌──────────┐
│ Option 1 ├─────┴──────┤ Option 2 │
└──────────┘            └──────────┘
```

See [data.ts](./data.ts) for the data and [linear-flow-skip-question.spec.ts](./linear-flow-skip-question.spec.ts) for the behavior step by step.
