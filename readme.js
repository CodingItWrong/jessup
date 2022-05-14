function writeReadme(answers) {
  return `# My Project

Describe your project here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)

## Installation

- Clone the repo
- Run \`yarn install\`

Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.

## Running

- Run \`yarn start\`

## Unit Tests

- Run \`yarn test \`
${includeIf(
  answers.cypress,
  `
## E2E Tests

- Run the app
- In another terminal, run \`yarn cypress\`
`
)}`;
}

function includeIf(condition, text) {
  if (condition) {
    return text;
  } else {
    return '';
  }
}

module.exports = {writeReadme};
