const {
  getDetoxGitHubActionsConfig,
  getGitHubActionsConfig,
} = require('./gitHubActions');
const {FRAMEWORKS} = require('./script');

describe('gitHubActions module', () => {
  describe('getGitHubActionsConfig', () => {
    function getFramework(value) {
      return FRAMEWORKS.find(f => f.value === value);
    }

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

      it('can generate a config without any testing', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'rn', unitTesting: false, detox: false},
            framework
          )
        ).toMatchSnapshot();
      });

      it('can generate a config with unit testing', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'rn', unitTesting: true, detox: false},
            framework
          )
        ).toMatchSnapshot();
      });
    });

    describe('vite', () => {
      const framework = getFramework('vite');

      it('can generate a config without any testing', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'vite', unitTesting: false, cypress: false},
            framework
          )
        ).toMatchSnapshot();
      });

      it('can generate a config with unit testing', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'vite', unitTesting: true, cypress: false},
            framework
          )
        ).toMatchSnapshot();
      });

      it('can generate a config with cypress', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'vite', unitTesting: false, cypress: true},
            framework
          )
        ).toMatchSnapshot();
      });

      it('can generate a config with both unit testing and cypress', () => {
        expect(
          getGitHubActionsConfig(
            {framework: 'vite', unitTesting: true, cypress: true},
            framework
          )
        ).toMatchSnapshot();
      });
    });
  });

  describe('getDetoxGitHubActionsConfig', () => {
    it('can generate a config for RN CLI', () => {
      expect(getDetoxGitHubActionsConfig({framework: 'rn'})).toMatchSnapshot();
    });

    it('can generate a config for Expo', () => {
      expect(
        getDetoxGitHubActionsConfig({framework: 'expo'})
      ).toMatchSnapshot();
    });
  });
});
