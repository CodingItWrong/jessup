const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'What is your name?',
    default: 'Josh',
  },
];

async function run() {
  const answers = await inquirer.prompt(questions);
  console.log(`Hello, ${answers.name}!`);
}

run();
