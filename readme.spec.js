const {getReadmeContents} = require('./readme');

describe('getReadmeContents', () => {
  describe('cra', () => {
    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'cra', cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'cra', cypress: true})
      ).toMatchSnapshot();
    });
  });

  describe('docusaurus', () => {
    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'doc', cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'doc', cypress: true})
      ).toMatchSnapshot();
    });
  });

  describe('expo', () => {
    it('allows returning a readme without any testing', () => {
      expect(
        getReadmeContents({
          framework: 'expo',
          unitTesting: false,
          cypress: false,
        })
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({
          framework: 'expo',
          unitTesting: true,
          cypress: false,
        })
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({
          framework: 'expo',
          unitTesting: false,
          cypress: true,
        })
      ).toMatchSnapshot();
    });

    it('allows returning a readme with both unit testing and cypress', () => {
      expect(
        getReadmeContents({framework: 'expo', unitTesting: true, cypress: true})
      ).toMatchSnapshot();
    });
  });

  describe('next', () => {
    it('allows returning a readme without cypress', () => {
      expect(
        getReadmeContents({framework: 'next', cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        getReadmeContents({framework: 'next', cypress: true})
      ).toMatchSnapshot();
    });
  });

  describe('node', () => {
    it('allows returning a readme without unit testing', () => {
      expect(
        getReadmeContents({framework: 'node', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({framework: 'node', unitTesting: true})
      ).toMatchSnapshot();
    });
  });

  describe('node with babel', () => {
    it('allows returning a readme without unit testing', () => {
      expect(
        getReadmeContents({framework: 'babel', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({framework: 'babel', unitTesting: true})
      ).toMatchSnapshot();
    });
  });

  describe('rn', () => {
    it('allows returning a readme without any testing', () => {
      expect(
        getReadmeContents({framework: 'rn', unitTesting: false, detox: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        getReadmeContents({framework: 'rn', unitTesting: true, detox: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with detox', () => {
      expect(
        getReadmeContents({framework: 'rn', unitTesting: false, detox: true})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with both unit testing and detox', () => {
      expect(
        getReadmeContents({framework: 'rn', unitTesting: true, detox: true})
      ).toMatchSnapshot();
    });
  });
});
