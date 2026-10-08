# Extending the data definition

This example adds custom properties to the data, for example to show a progress bar or a unit in your view.

- `MyItem` adds `progress` to the questions and `divisor` and `unit` to `rangeOption`.
- `MyQuestion` and `MyNavigationItem` add the same properties to the output.

[MyQuaire.ts](./MyQuaire.ts) passes the types as type parameters (`Quaire<QuaireResult, MyItem, MyQuestion, MyNavigationItem>`)
and overrides two protected methods to copy the properties:

- `_getQuestionObject`: adds `progress` to the active question
- `_getNavigationItemObject`: adds `progress` and `unit` to the navigation items

Custom properties in `rangeOption`, `selectOptions`, and `inputOption` are passed to the question without any override.

See [data.ts](./data.ts) for the data and [extending-data-definition.spec.ts](./extending-data-definition.spec.ts) for the behavior step by step.
