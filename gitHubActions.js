const {includeIf} = require('./utils');

function getGitHubActionsConfig(answers, framework) {
  return `name: Test
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  test:
    name: Test
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3

      - name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn cache dir)"

      - uses: actions/cache@v3
        id: yarn-cache
        with:
          path: \${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: \${{ runner.os }}-yarn-\${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            \${{ runner.os }}-yarn-

      - name: Install Dependencies
        run: yarn install --frozen-lockfile
${includeIf(
  framework.alwaysIncludeUnitTesting || answers.unitTesting,
  `
      - name: Unit Tests
        run: yarn test --watchAll=false
`
)}
      - name: ESLint
        run: yarn lint
${includeIf(
  answers.cypress && answers.framework === 'expo',
  `
      - name: Install Expo CLI
        run: yarn global add expo-cli

      - name: Install Sharp CLI
        run: yarn global add sharp-cli
`
)}${includeIf(
    answers.cypress,
    `
      - name: Cypress Tests
        uses: cypress-io/github-action@v4
        with:
          start: yarn ${framework.devServerScript ?? 'start'}
          wait-on: 'http://localhost:${framework.devServerPort}'
`
  )}`;
}

module.exports = {getGitHubActionsConfig};
