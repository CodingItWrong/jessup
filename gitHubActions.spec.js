const {getGitHubActionsConfig} = require('./gitHubActions');
const {FRAMEWORKS} = require('./script');

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

  describe('expo', () => {
    const framework = getFramework('expo');

    it('can generate a config without any testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'expo', unitTesting: false, cypress: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'expo', unitTesting: true, cypress: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('can generate a config with cypress', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'expo', unitTesting: false, cypress: true},
          framework
        )
      ).toMatchSnapshot();
    });

    it('can generate a config with both unit testing and cypress', () => {
      expect(
        getGitHubActionsConfig(
          {framework: 'expo', unitTesting: true, cypress: true},
          framework
        )
      ).toMatchSnapshot();
    });
  });

  describe('next', () => {
    const framework = getFramework('next');

    it('can generate a config without cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'next', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('can generate a config with cypress', () => {
      expect(
        getGitHubActionsConfig({framework: 'next', cypress: true}, framework)
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

  describe('react native', () => {
    const framework = getFramework('rn');

    it('can generate a config without unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'rn', unitTesting: false}, framework)
      ).toMatchSnapshot();
    });

    it('can generate a config with unit testing', () => {
      expect(
        getGitHubActionsConfig({framework: 'rn', unitTesting: true}, framework)
      ).toMatchSnapshot();
    });
  });
});
