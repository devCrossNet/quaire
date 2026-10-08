# Linear flow with a loop

Option 2 of the last question leads back to the first question.
A `nextItemId` can point to any question, also to a former one.

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
