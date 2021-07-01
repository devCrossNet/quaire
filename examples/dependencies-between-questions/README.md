# Example for questions that have dependencies to answers of former questions

This is an example of dependencies between possible answers for a question based on existing answers.
That means that Question 2 has a different set of possible options based on the answer to Question 1.
And Question 3 has different options based on the answer to Question 1 and Question 2.

```
                                                               ┌────────────┐
                                                               │            │
                                                               │ Question 1 │
                                                               │            │
                                                               └─────┬──────┘
                                                    ┌──────────┐     │      ┌──────────┐
                                                    │ Option 1 ├─────┴──────┤ Option 2 │
                                                    └─────┬────┘            └─────┬────┘
                                       ┌────────────┐     │                       │    ┌────────────┐
                                       │            │     │                       │    │            │
                                       │ Question 2 │◄────┘                       └───►│ Question 2 │
                                       │            │                                  │            │
                                       └──────┬─────┘                                  └──────┬─────┘
                           ┌────────────┐     │      ┌────────────┐        ┌────────────┐     │      ┌────────────┐
                           │ Option 1.1 ├─────┴──────┤ Option 1.2 │        │ Option 2.1 ├─────┴──────┤ Option 2.2 │
                           └─────┬──────┘            └──────┬─────┘        └─────┬──────┘            └─────┬──────┘
              ┌────────────┐     │                          │                    │                         │
              │            │     │                          │                    │                         │
              │ Question 3 │◄────┘                          │                    │                         │
              │            │                                │                    │                         │
              └──────┬─────┘                                │                    │                         │
┌──────────────┐     │      ┌──────────────┐                │                    │                         │
│ Option 1.1.1 ├─────┴──────┤ Option 1.1.2 │                │                    │                         │
└──────────────┘            └──────────────┘                │                    │                         │
                                         ┌────────────┐     │                    │                         │
                                         │            │     │                    │                         │
                                         │ Question 3 │◄────┘                    │                         │
                                         │            │                          │                         │
                                         └──────┬─────┘                          │                         │
                                                │                                │                         │
                           ┌──────────────┐     │      ┌──────────────┐          │                         │
                           │ Option 1.2.1 ├─────┴──────┤ Option 1.2.2 │          │                         │
                           └──────────────┘            └──────────────┘          │                         │
                                                              ┌────────────┐     │                         │
                                                              │            │     │                         │
                                                              │ Question 3 │◄────┘                         │
                                                              │            │                               │
                                                              └──────┬─────┘                               │
                                                                     │                                     │
                                                                     │                                     │
                                                ┌──────────────┐     │      ┌──────────────┐               │
                                                │ Option 2.1.1 ├─────┴──────┤ Option 2.1.2 │               │
                                                └──────────────┘            └──────────────┘               │
                                                                                        ┌────────────┐     │
                                                                                        │            │     │
                                                                                        │ Question 3 │◄────┘
                                                                                        │            │
                                                                                        └──────┬─────┘
                                                                                               │
                                                                                               │
                                                                          ┌──────────────┐     │      ┌──────────────┐
                                                                          │ Option 2.2.1 ├─────┴──────┤ Option 2.2.2 │
                                                                          └──────────────┘            └──────────────┘
```
