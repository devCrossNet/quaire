# Linear flow

A simple flow with three single-select questions. Every option leads to the next question with `next`.

The options of the last question have no `next`, so the flow ends there and `isComplete()` is `true`.
An answer that is not an option gets the error `INVALID_OPTION`, and the question stays active.

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
