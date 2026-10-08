# Extending the data definition

This example adds custom properties to the data, for example to show a progress bar, a unit, or an icon in your view.

- `MyQuestionDefinition` adds `progress` and `unit` to every question.
- `MyNavigationDefinition` adds `color` to every navigation item.
- Select options can have custom properties without a new type, e.g. `icon`.

Pass the types as type parameters. quaire keeps all custom properties in the questions and navigation items:

```ts
const quaire = new Quaire<object, MyQuestionDefinition, MyNavigationDefinition>({ questions, navigation });

quaire.getActiveQuestion().progress; // 50
quaire.getNavigation()[0].color; // 'blue'
quaire.getNavigation()[0].question.unit; // '%'
```

See [data.ts](./data.ts) for the data and [extending-data-definition.spec.ts](./extending-data-definition.spec.ts) for the behavior step by step.
