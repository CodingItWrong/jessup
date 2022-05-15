#!/usr/bin/env node

const inquirer = require('inquirer');
const {questions, initialize} = require('./script');

async function run() {
  const answers = await inquirer.prompt(questions);
  initialize(answers);
}

run();
