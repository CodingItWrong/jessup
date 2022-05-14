const {writeReadme} = require('./readme');

describe('writeReadme', () => {
  describe('cra', () => {
    it('allows returning a readme without cypress', () => {
      expect(writeReadme({framework: 'cra', cypress: false})).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(writeReadme({framework: 'cra', cypress: true})).toMatchSnapshot();
    });
  });

  describe('docusaurus', () => {
    it('allows returning a readme without cypress', () => {
      expect(writeReadme({framework: 'doc', cypress: false})).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(writeReadme({framework: 'doc', cypress: true})).toMatchSnapshot();
    });
  });

  describe('expo', () => {
    it('allows returning a readme without any testing', () => {
      expect(
        writeReadme({framework: 'expo', unitTesting: false, cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        writeReadme({framework: 'expo', unitTesting: true, cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(
        writeReadme({framework: 'expo', unitTesting: false, cypress: true})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with both unit testing and cypress', () => {
      expect(
        writeReadme({framework: 'expo', unitTesting: true, cypress: true})
      ).toMatchSnapshot();
    });
  });

  describe('next', () => {
    it('allows returning a readme without cypress', () => {
      expect(
        writeReadme({framework: 'next', cypress: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with cypress', () => {
      expect(writeReadme({framework: 'next', cypress: true})).toMatchSnapshot();
    });
  });

  describe('node', () => {
    it('allows returning a readme without unit testing', () => {
      expect(
        writeReadme({framework: 'node', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        writeReadme({framework: 'node', unitTesting: true})
      ).toMatchSnapshot();
    });
  });

  describe('node with babel', () => {
    it('allows returning a readme without unit testing', () => {
      expect(
        writeReadme({framework: 'babel', unitTesting: false})
      ).toMatchSnapshot();
    });

    it('allows returning a readme with unit testing', () => {
      expect(
        writeReadme({framework: 'babel', unitTesting: true})
      ).toMatchSnapshot();
    });
  });
});
