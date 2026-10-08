# Linear flow with an optional question

Question 2 is optional (`required: false`). This example shows both ways to skip it:

- **Branch around it:** Option 2 of question 1 leads directly to question 3.
- **Answer with `NO_VALUE`:** Question 2 has an option with the value `NO_VALUE`.
  The question counts as answered, and the navigation shows `NO_VALUE` as its value.
  Use this for a "skip" or "I don't know" button.

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
