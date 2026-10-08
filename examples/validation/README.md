# Validation

This example shows the built-in validation rules and a custom validator:

| Question | Rules                                                   |
| -------- | ------------------------------------------------------- |
| E-mail   | `required`, `pattern`                                   |
| Username | `required`, `minLength`, `maxLength`, custom `validate` |
| Age      | `min`, `max` (optional question)                        |
| Topics   | `required`, `minSelected`, `maxSelected`                |

An invalid answer is saved, but the question stays active and `question.error` contains the error code.
The view maps the codes to messages, see `messages` in [data.ts](./data.ts).

See [validation.spec.ts](./validation.spec.ts) for the behavior step by step.
