# Example for a branched flow that merges back together

The flow branches in the first question in two completely different flows
that merge back together after one question (you can have as many branches as you want).

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
