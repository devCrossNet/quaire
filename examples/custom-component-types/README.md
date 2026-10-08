# Custom component types

This example extends `Quaire` with two new component types:

- `MULTI_SELECT`: the answer is an array of option values
- `BOOLEAN`: the answer is `true` or `false`

[MyQuaire.ts](./MyQuaire.ts) overrides these protected properties and methods:

| Override                                    | Why                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `_selectComponentTypes`                     | `MULTI_SELECT` uses `selectOptions` like `SINGLE_SELECT`                                   |
| `_alwaysPossibleFollowUpQuestionComponents` | a `BOOLEAN` question that depends on former answers always stays in the flow               |
| `_validateSelectComponent`                  | a `MULTI_SELECT` answer is valid if at least one value is a valid option                   |
| `_getNextItemIdFromSelectComponents`        | find the next question for an array of values                                              |
| `_getDependencyPath`                        | a `MULTI_SELECT` answer is sorted and joined with `_` to one key, e.g. `option 1_option 2` |
| `_getNavigationValue`                       | show the labels of all selected options in the navigation                                  |

See [data.ts](./data.ts) for the data and [custom-component-types.spec.ts](./custom-component-types.spec.ts) for the behavior step by step.
