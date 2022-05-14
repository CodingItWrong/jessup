const {getGitHubActionsConfig} = require('./gitHubActions');

describe('getGitHubActionsConfig', () => {
  describe('node', () => {
    it('can generate a config without unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'node', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'node', unitTesting: true})
      ).toMatchSnapshot();
    });
  });

  describe('node with babel', () => {
    it('can generate a config without unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'babel', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'babel', unitTesting: true})
      ).toMatchSnapshot();
    });
  });
});
