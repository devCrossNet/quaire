# Branched flow that merges back into one

Question 1 splits the flow into two branches that merge back into question 4.
You can have as many branches as you want.

- **Branch A:** question 2 is a `RANGE_SLIDER`. Its next question is defined in `rangeOption.nextItemId`.
- **Branch B:** question 3 is an `INPUT`. Its next question is defined in `inputOption.nextItemId`.

Only the answers of the chosen branch are in the result.

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
             └─────┬────┘            └─────┬────┘
                   │                       │
                   │                       │
                   │                       │
┌────────────┐     │                       │    ┌────────────┐
│            │     │                       │    │            │
│ Question 2 │◄────┘                       └───►│ Question 3 │
│            │                                  │            │
└─────┬──────┘                                  └──────┬─────┘
      │                                                │
      │                                                │
      │                ┌────────────┐                  │
      │                │            │                  │
      └───────────────►│ Question 4 ├──────────────────┘
                       │            │
                       └─────┬──────┘
                             │
                             │
            ┌──────────┐     │      ┌──────────┐
            │ Option 1 ├─────┴──────┤ Option 2 │
            └──────────┘            └──────────┘
```

See [data.ts](./data.ts) for the data and [branched-and-merged-flow.spec.ts](./branched-and-merged-flow.spec.ts) for the behavior step by step.
