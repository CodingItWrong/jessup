# jessup

> ***"You can't HANDLE the project setup!"*** - `jessup`

A JavaScript and React project initializer. Supports the following project types:

- [Node](https://nodejs.org/en/), optionally including [Babel](https://babeljs.io/)
- [Create React App](https://create-react-app.dev/)
- [Docusaurus](https://docusaurus.io/)
- React Native, either via [Expo](https://expo.dev/) or React Native CLI (for info, see the [React Native Environment Setup docs](https://reactnative.dev/docs/environment-setup) and click "React Native CLI Quickstart")

Features it initializes in the projects:

- Git: ensures the project is initialized as a git repo with appropriate `.gitignore` and commits each setup step separately
- Yarn: prevents `package.lock` which would conflict with `yarn.lock`
- Linting and formatting: sets up ESLint integrated with Prettier
- Unit Testing: optionally sets up Jest unit tests, with React Testing Library for React-dom and React Native Testing Library for RN
- E2E Testing: Cypress for web and Detox for React Native CLI

## Installation

- Clone the repo
- Add the project's `bin/jessup` directory to your shell's `PATH`
- Install any system dependencies for the framework you want to use
- Run `jessup` and answer the prompts

## License

MIT
