const {writeReadme} = require('./readme');

describe('writeReadme', () => {
  describe('cra', () => {
    it('allows returning a readme without cypress', () => {
      expect(writeReadme({framework: 'cra', cypress: false})).toMatchSnapshot();
    });
  });
});
