const inquirer = require('inquirer');

const FRAMEWORKS = [
  {value: 'cra', name: 'Create React App'},
  {value: 'doc', name: 'Docusaurus'},
  {value: 'expo', name: 'Expo'},
  {value: 'next', name: 'Next'},
  {value: 'node', name: 'Node'},
  {value: 'babel', name: 'Node with Babel'},
  {value: 'rn', name: 'React Native CLI'},
];

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
    default: 'my-new-project',
  },
];

function commit(message, stepImplementation) {
  console.log(message.toUpperCase());
  console.log('');
  stepImplementation();
  command(`git commit -m "${message}"`);
  console.log('');
}

function command(commandText) {
  console.log(`$ ${commandText}`);
}

function writeFile(path, contents) {
  console.log(`Write ${path}`);
  console.log('');
  console.log(contents);
  console.log('');
  console.log('(end of file)');
  console.log('');
}

function addNpmPackages({dev = false, packages}) {
  command(`yarn add ${dev ? '-D ' : ''}${packages.join(' ')}`);
}

async function run() {
  const answers = await inquirer.prompt(questions);

  const framework = FRAMEWORKS.find(f => f.value === answers.framework);

  console.log(`Initializing ${framework.name} project`);

  if (answers.framework === 'cra') {
    commit('Initialize project', () => {
      command(`yarn create react-app ${answers.projectName}`);
      command(`cd ${answers.projectName}`);
      command('git init .');
    });

    commit('Prevent package lock', () => {
      command('echo "package-lock=false" >> .npmrc');
    });

    commit('Configure linting and formatting', () => {
      addNpmPackages({
        dev: true,
        packages: [
          'eslint-config-prettier',
          'eslint-plugin-prettier',
          'prettier',
        ],
      });
      writeFile(
        '.eslintrc.js',
        `
          module.exports = {
            extends: ['eslint:recommended', 'plugin:prettier/recommended'],
            env: {
              es6: true,
              node: true,
            },
            parserOptions: {
              ecmaVersion: 'latest',
            },
            rules: {
              quotes: ['error', 'single', {avoidEscape: true}], // single quote unless using interpolation
            },
          };
        `
      );
      writeFile(
        '.prettierrc.js',
        `
          module.exports = {
            arrowParens: 'avoid',
            bracketSpacing: false,
            singleQuote: true,
            trailingComma: 'es5',
          };
        `
      );
      command('npm set-script lint "eslint ."');
      command('yarn lint --fix');
    });
  } else {
    // node
    commit('Initialize project', () => {
      command(`mkdir ${answers.projectName}`);
      command(`cd ${answers.projectName}`);
      command('yarn init -y');
      command('npx gitignore node');
      command('git init .');
    });

    commit('Prevent package lock', () => {
      command('echo "package-lock=false" >> .npmrc');
    });

    commit('Configure linting and formatting', () => {
      addNpmPackages({
        dev: true,
        packages: [
          'eslint',
          'eslint-config-prettier',
          'eslint-plugin-prettier',
          'prettier',
        ],
      });
      writeFile(
        '.eslintrc.js',
        `
          module.exports = {
            extends: ['react-app', 'prettier'],
            plugins: ['prettier'],
            rules: {
              'import/order': ['warn', {alphabetize: {order: 'asc'}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
              'no-duplicate-imports': 'error',
              'prettier/prettier': 'warn',
              quotes: ['error', 'single', {avoidEscape: true}], // single quote unless using interpolation
              'sort-imports': [
                'warn',
                {ignoreDeclarationSort: true, ignoreMemberSort: false},
              ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
            },
          };
        `
      );
      writeFile(
        '.prettierrc.js',
        `
        module.exports = {
          arrowParens: 'avoid',
          bracketSpacing: false,
          singleQuote: true,
          trailingComma: 'es5',
        };
      `
      );
      command('npm set-script lint "eslint ."');
      command('yarn lint --fix');
    });
  }
}

run();
