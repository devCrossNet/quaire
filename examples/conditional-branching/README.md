# Conditional branching

The next question depends on the answers, not only on the selected option:

```
How old are you?
├── under 18 ──► Do your parents agree?
│                ├── yes ──► What are you interested in?
│                └── no  ──► end
└── 18 or older ──► What do you do?
                    ├── employed, self-employed ──► What is your yearly income? ──► What are you interested in?
                    └── student ──────────────────────────────────────────────► What are you interested in?

What are you interested in?
├── contains "travel" ──► Where do you want to travel next?
└── other ──► end
```

This example shows:

- `next` with a list of conditions. The first match wins, an entry without `when` is the fallback.
- Comparisons like `{ age: { lt: 18 } }`.
- Multi-select conditions: `{ interests: 'travel' }` matches when the answer contains `'travel'`.
- A flow that ends early when no condition matches.
- A variant with a function condition, for rules that are not possible with data.

See [data.ts](./data.ts) for the data and [conditional-branching.spec.ts](./conditional-branching.spec.ts) for the behavior step by step.
