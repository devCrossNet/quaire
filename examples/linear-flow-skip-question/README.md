# Example for a linear flow with an optional question that can be skipped

The second option of the first question allows the user to skip the second question.

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
