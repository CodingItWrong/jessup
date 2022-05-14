const FRAMEWORKS = require('./frameworks');

function writeReadme(answers) {
  const framework = frameworkForAnswers(answers);

  return `# My Project

Describe your project here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)
${includeIf(
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

Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.
${includeIf(
  !framework.omitRunScript,
  `
## Running

- Run \`yarn ${answers.framework === 'next' ? 'dev' : 'start'}\`
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
  )}`;
}

function frameworkForAnswers(answers) {
  return FRAMEWORKS.find(f => f.value === answers.framework);
}

function includeIf(condition, text) {
  if (condition) {
    return text;
  } else {
    return '';
  }
}

module.exports = {writeReadme};
