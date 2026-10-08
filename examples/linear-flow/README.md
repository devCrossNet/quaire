# Linear flow

A simple flow with three single-select questions. Every option leads to the next question.

After the last question, the active question stays the same, because its options have no `nextItemId`.

```
           ┌────────────┐
           │            │
           │ Question 1 │
           │            │
           └─────┬──────┘
                 │
                 │
┌──────────┐     │      ┌──────────┐
│ Option 1 ├─────┴──────┤ Option 2 │
└────┬─────┘            └─────┬────┘
     │                        │
     │                        │
     │                        │
     └────►┌────────────┐◄────┘
           │            │
           │ Question 2 │
           │            │
           └─────┬──────┘
                 │
                 │
┌──────────┐     │      ┌──────────┐
│ Option 1 ├─────┴──────┤ Option 2 │
└────┬─────┘            └─────┬────┘
     │                        │
     │                        │
     │                        │
     └────►┌────────────┐◄────┘
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

See [data.ts](./data.ts) for the data and [linear-flow.spec.ts](./linear-flow.spec.ts) for the behavior step by step.
