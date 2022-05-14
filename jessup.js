const inquirer = require('inquirer');
const FRAMEWORKS = require('./frameworks');

const questions = [
  {
    type: 'list',
    name: 'framework',
    message: 'What kind of app do you want to create?',
    choices: FRAMEWORKS,
  },
  {
    type: 'input',
    name: 'projectName',
    message: 'What name do you want to give the project?',
    default: answers =>
      frameworkForAnswers(answers).defaultProjectName ??
      `my-${answers.framework}-project`,
  },
  {
    type: 'confirm',
    name: 'unitTesting',
    message: 'Configure unit testing?',
    when: answers => !frameworkForAnswers(answers).skipUnitTestingQuestion,
  },
  {
    type: 'confirm',
    name: 'cypress',
    message: 'Configure E2E web testing with Cypress?',
    when: answers => frameworkForAnswers(answers).cypressAvailable,
  },
  {
    type: 'confirm',
    name: 'detox',
    message: 'Configure E2E native testing with Detox?',
    when: answers => frameworkForAnswers(answers).detoxAvailable,
  },
];

function frameworkForAnswers(answers) {
  return FRAMEWORKS.find(f => f.value === answers.framework);
}

async function run() {
  const answers = await inquirer.prompt(questions);

  const framework = frameworkForAnswers(answers);

  console.log(`Initializing ${framework.name} project`);

  framework.initializer(answers);
}

run();
