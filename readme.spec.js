const {getReadmeContents} = require('./readme');
const FRAMEWORKS = require('./frameworks');

describe('getReadmeContents', () => {
  function getFramework(value) {
    return FRAMEWORKS.find(f => f.value === value);
  }

  describe('cra', () => {
    const framework = getFramework('cra');

    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'cra', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'cra', cypress: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('docusaurus', () => {
    const framework = getFramework('doc');

    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'doc', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'doc', cypress: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('expo', () => {
    const framework = getFramework('expo');

    it('allows returning a readme without any testing', () => {
      expect(
        getReadmeContents(
          {
            framework: 'expo',
            unitTesting: false,
            cypress: false,
          },
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents(
          {
            framework: 'expo',
            unitTesting: true,
            cypress: false,
          },
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents(
          {
            framework: 'expo',
            unitTesting: false,
            cypress: true,
          },
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with both unit testing and cypress', () => {
      expect(
        getReadmeContents(
          {framework: 'expo', unitTesting: true, cypress: true},
          framework
        )
      ).toMatchSnapshot();
    });
  });

  describe('next', () => {
    const framework = getFramework('next');

    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'next', cypress: false}, framework)
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'next', cypress: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('node', () => {
    const framework = getFramework('node');

    it('allows returning a readme without unit testing', () => {
      expect(
        getReadmeContents({framework: 'node', unitTesting: false}, framework)
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({framework: 'node', unitTesting: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('node with babel', () => {
    const framework = getFramework('babel');

    it('allows returning a readme without unit testing', () => {
      expect(
        getReadmeContents({framework: 'babel', unitTesting: false}, framework)
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({framework: 'babel', unitTesting: true}, framework)
      ).toMatchSnapshot();
    });
  });

  describe('rn', () => {
    const framework = getFramework('rn');

    it('allows returning a readme without any testing', () => {
      expect(
        getReadmeContents(
          {framework: 'rn', unitTesting: false, detox: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents(
          {framework: 'rn', unitTesting: true, detox: false},
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with detox', () => {
      expect(
        getReadmeContents(
          {framework: 'rn', unitTesting: false, detox: true},
          framework
        )
      ).toMatchSnapshot();
    });

    it('allows returning a readme with both unit testing and detox', () => {
      expect(
        getReadmeContents(
          {framework: 'rn', unitTesting: true, detox: true},
          framework
        )
      ).toMatchSnapshot();
    });
  });
});
