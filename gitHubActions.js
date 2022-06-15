const {includeIf} = require('./utils');

function getGitHubActionsConfig(answers, framework) {
  return `name: Test
on: [push]

jobs:
  test:
    name: Test
    runs-on: ${answers.detox ? 'macos-latest' : 'ubuntu-22.04'}
    ${includeIf(
      answers.detox,
      `timeout-minutes: 60
    `
    )}steps:
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
  )}${includeIf(
    answers.detox,
    `
      - name: Cache Pods
        uses: actions/cache@v3
        id: podcache
        with:
          path: ios/Pods
          key: pods-\${{ hashFiles('**/Podfile.lock') }}

      - name: Update Pods
        if: steps.podcache.outputs.cache-hit != 'true'
        run: |
          gem update cocoapods xcodeproj
          cd ios && pod install && cd ..

      - run: brew tap wix/brew
      - run: brew install applesimutils
      - run: yarn detox build e2e --configuration ios.sim.release
      - run: yarn detox test e2e --configuration ios.sim.release --cleanup --debug-synchronization 200
`
  )}`;
}

module.exports = {getGitHubActionsConfig};
