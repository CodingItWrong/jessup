const {includeIf} = require('./utils');

function getGitHubActionsConfig(answers, framework) {
  return `name: Test
on: [push]

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
  answers.cypress,
  `
      - name: Cypress run
        uses: cypress-io/github-action@v2
        with:
          start: yarn web
          wait-on: 'http://localhost:${framework.devServerPort}'
`
)}`;
}

module.exports = {getGitHubActionsConfig};
