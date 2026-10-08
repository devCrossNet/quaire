# Branched flow that merges back into one

Question 1 splits the flow into two branches that merge back into question 4.
You can have as many branches as you want.

- **Branch A:** question 2 is a `RANGE` with a default value.
- **Branch B:** question 3 is an `INPUT` with a default value.

Only the answers of the chosen branch are in the result.
When the user goes back and chooses the other branch, the answers of the old branch are removed.

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
