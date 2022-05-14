const {getGitHubActionsConfig} = require('./gitHubActions');
const FRAMEWORKS = require('./frameworks');

describe('getGitHubActionsConfig', () => {
  function getFramework(value) {
    return FRAMEWORKS.find(f => f.value === value);
  }

  describe('cra', () => {
    const framework = getFramework('cra');

    it('can generate a config without cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'cra', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('can generate a config with cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'cra', cypress: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('docusaurus', () => {
    const framework = getFramework('doc');

    it('can generate a config without cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'doc', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('can generate a config with cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'doc', cypress: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('node', () => {
    const framework = getFramework('node');

    it('can generate a config without unit testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'node', unitTesting: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'node', unitTesting: true},
          framework
        )
      ).toMatchSnapshot();
    });
  });

  describe('node with babel', () => {
    const framework = getFramework('babel');

    it('can generate a config without unit testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'babel', unitTesting: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'babel', unitTesting: true},
          framework
        )
      ).toMatchSnapshot();
    });
  });
});
