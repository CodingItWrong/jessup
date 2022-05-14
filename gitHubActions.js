function getGitHubActionsConfig() {
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

      - name: ESLint
        run: yarn lint
`;
}

module.exports = {getGitHubActionsConfig};
