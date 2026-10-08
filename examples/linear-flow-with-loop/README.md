# Linear flow with a loop

Option 2 of the last question leads back to the first question.
A `next` can point to any question, also to a former one.

The answers stay in the result when the loop starts again, so the user sees their former answers.
A flow in a loop is not complete. Choose option 1 of the last question to complete it.

```
           ┌────────────┐
           │            │
           │ Question 1 │◄──────────────┐
           │            │               │
           └─────┬──────┘               │
                 │                      │
                 │                      │
┌──────────┐     │      ┌──────────┐    │
│ Option 1 ├─────┴──────┤ Option 2 │    │
└────┬─────┘            └─────┬────┘    │
     │                        │         │
     │                        │         │
     │                        │         │
     └────►┌────────────┐◄────┘         │
           │            │               │
           │ Question 2 │               │
           │            │               │
           └─────┬──────┘               │
                 │                      │
                 │                      │
┌──────────┐     │      ┌──────────┐    │
│ Option 1 ├─────┴──────┤ Option 2 │    │
└────┬─────┘            └─────┬────┘    │
     │                        │         │
     │                        │         │
     │                        │         │
     └────►┌────────────┐◄────┘         │
           │            │               │
           │ Question 3 │               │
           │            │               │
           └─────┬──────┘               │
                 │                      │
                 │                      │
┌──────────┐     │      ┌──────────┐    │
│ Option 1 ├─────┴──────┤ Option 2 ├────┘
└──────────┘            └──────────┘
```

See [data.ts](./data.ts) for the data and [linear-flow-with-loop.spec.ts](./linear-flow-with-loop.spec.ts) for the behavior step by step.
