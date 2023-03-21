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
- E2E Testing: Cypress for web and Detox for React Native
- CI: GitHub Actions for all of the above (iOS-only for Detox so far)

## Project Status

This project is early-stage. Upcoming work I would like to do:

- [ ] Detox Android on CI
- [ ] Better error output
- [ ] General robustness
- [ ] Ability to request dry-run mode as an interactive option instead of a hard-coded flag
- [ ] Easy way for users to customize the init scripts to their own needs

## Installation

- `npm install -g jessup`
- Install any system dependencies for the framework you want to use
- Run `jessup` and answer the prompts

## License

MIT
