# quaire
a framework-agnostic library to build user-flows, surveys, and questionnaires

# Why the name?
Because you need one and `questionnaire` is terrible to type.

# What use-case does it try to solve?
I have to implement more and more features that behave like questionnaires or surveys.
Over the years I tried a couple of things to make it easier for me to implement those features.

Of course, the first approach I tried was to implement a static user flow, for example:
- present first question on first page
- user selects option a
- navigate to the next question
- etc.

That was ok as long as I didn't have to change the flow but when I had to change the flow,
I found myself changing big parts of the implementation.

I also tried to use finite state machines,
but I ended up with spaghetti state machines most of the time
due to regular changes in the user-flow (re-arranging questions, adding questions, skip questions, etc.)

The solution I found to work best for me was a concept of game-development called decision-tree.
That way the whole user-flow is based on a static set of data that can be changed without the need of changing
the view or the behaviour. This pattern provides a nice separation of:
- data
- behaviour
- view

# Features?
- framework-agnostic
- view independent
- linear user-flow
- branched user-flow
- loops
- validation
- re-storing state of the questionnaire from the selected answers
- navigation

# How does it work?

## Define quaire data

## Extend quaire data structure

## Use quaire behaviour

## Extend quaire behaviour

# Contribute

Contributions are always welcome! Please read the [contribution guidelines](https://github.com/devCrossNet/quaire/blob/master/.github/CONTRIBUTING.md) first.

# Contact

- [Discord](https://discord.gg/59x5cg2)
- [Twitter](https://twitter.com/_jwerner_)

# License

[MIT](http://opensource.org/licenses/MIT)
