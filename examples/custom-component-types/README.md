# Custom component types

This example adds a `RATING` component type with a `stars` property.

[rating.ts](./rating.ts) defines the type and its behavior:

- `RatingDefinition` describes the properties of a rating question.
- `MyQuestionDefinition` combines the built-in types with the rating type.
- The `rating` component validates the answer and shows "4 / 5" in the navigation.

The component is passed to quaire with the `components` option:

```ts
new Quaire<object, MyQuestionDefinition>({ questions, components: { RATING: rating } });
```

The flow uses a condition on the rating: a rating of 2 or less leads to a `MULTI_SELECT` question about improvements.

See [data.ts](./data.ts) for the data and [custom-component-types.spec.ts](./custom-component-types.spec.ts) for the behavior step by step.
