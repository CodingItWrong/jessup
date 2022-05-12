const inquirer = require('inquirer');

const questions = [
  {
    type: 'list',
    name: 'framework',
    message: 'What kind of app do you want to create?',
    choices: [
      {value: 'cra', name: 'Create React App'},
      {value: 'doc', name: 'Docusaurus'},
      {value: 'expo', name: 'Expo'},
      {value: 'next', name: 'Next'},
      {value: 'node', name: 'Node'},
      {value: 'babel', name: 'Node with Babel'},
      {value: 'rn', name: 'React Native CLI'},
    ],
  },
];

async function run() {
  const answers = await inquirer.prompt(questions);
  console.log({answers});
}

run();
