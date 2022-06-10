const {includeIf} = require('./utils');

function getReadmeContents(answers, framework) {
  return `# My Project

Describe your project here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)
${includeIf(
  answers.framework === 'rn',
  `- [Ruby](https://www.ruby-lang.org/)
- [Cocoapods](https://cocoapods.org/)
- [Android Studio](https://developer.android.com/studio) and/or [Xcode](https://developer.apple.com/xcode/)
`
)}${includeIf(
    answers.framework === 'expo',
    `
Optional:

- To run on Android Emulator, [Android Studio](https://developer.android.com/studio)
- To run on iOS Simulator, [Xcode](https://developer.apple.com/xcode/)
`
  )}
## Installation

- Clone the repo
- Run \`yarn install\`
${includeIf(
  answers.framework === 'rn',
  `- Run \`cd ios && pod install\`
`
)}
Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.
${includeIf(
  !framework.omitRunScript,
  `
## Running

${
  answers.framework === 'rn'
    ? `- In one terminal, run \`yarn start\`
- In another terminal, run \`yarn android\` or \`yarn ios\``
    : `- Run \`yarn ${answers.framework === 'next' ? 'dev' : 'start'}\``
}
`
)}${includeIf(
    framework.alwaysIncludeUnitTesting || answers.unitTesting,
    `
## Unit Tests

- Run \`yarn test\`
`
  )}${includeIf(
    answers.cypress,
    `
## E2E Tests

- Run the app
- In another terminal, run \`yarn cypress\`
`
  )}${includeIf(
    answers.detox,
    `
## E2E Tests

- Run \`detox build -c ios.sim.debug\` (only needs to be run once per native code changes)
- Run \`detox test -c ios.sim.debug\`
`
  )}`;
}

module.exports = {getReadmeContents};
