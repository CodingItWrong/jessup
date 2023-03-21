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

function getDetoxGitHubActionsConfig(answers) {
  return `name: Detox
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: macos-12
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: ${answers.framework === 'expo' ? 16 : 18}
          cache: "yarn"

      - name: Cache Pods dependencies
        uses: actions/cache@v1
        with:
          path: ios/Pods
          key: \${{ runner.OS }}-pods-cache-\${{ hashFiles('**/ios/Podfile.lock') }}
          restore-keys: |
            \${{ runner.OS }}-pods-cache-

      - name: Install npm dependencies
        run: yarn install --frozen-lockfile

      ${
        answers.framework === 'expo'
          ? `- name: Generate Xcode Project
        run: npx expo prebuild -p ios`
          : `- name: Install iOS dependencies
        run: npx pod-install`
      }
      
      - name: Install Detox CLI
        run: |
          brew tap wix/brew
          brew install applesimutils
          npm install -g detox-cli

      - name: Build App for Detox
        run: detox build -c ios.sim.release

      - uses: futureware-tech/simulator-action@v2
        with:
          model: "iPhone 14"

      - name: Run Detox
        run: detox test -c ios.sim.release
`;
}

module.exports = {getDetoxGitHubActionsConfig, getGitHubActionsConfig};
