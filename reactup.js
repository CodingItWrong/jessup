const inquirer = require('inquirer');

function initializeCra(answers) {
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
    writePrettierConfig();
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

function initializeDocusaurus(answers) {
  commit('Initialize project', () => {
    command(
      `npx create-docusaurus@latest -p yarn ${answers.projectName} classic`
    );
    command(`cd ${answers.projectName}`);
  });

  commit('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    console.log('TODO: UNIT TESTING');
  }

  commit('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@babel/core',
        '@babel/eslint-parser',
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-import',
        'eslint-plugin-prettier',
        'eslint-plugin-react',
        'prettier',
      ],
    });
    writeFile(
      '.eslintrc.js',
      `
        module.exports = {
          extends: ['plugin:react/recommended', 'prettier'],
          plugins: ['prettier', 'import'],
          parser: '@babel/eslint-parser',
          env: {
            browser: true,
            es6: true,
          },
          settings: {
            react: {
              version: 'detect',
            },
          },
          rules: {
            'import/order': ['warn', {alphabetize: {order: 'asc'}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
            'no-duplicate-imports': 'error',
            'prettier/prettier': 'warn',
            quotes: ['error', 'single', {avoidEscape: true}], // single quote unless using interpolation
            'react/prop-types': 'off',
            'sort-imports': [
              'warn',
              {ignoreDeclarationSort: true, ignoreMemberSort: false},
            ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
          },
        };
      `
    );
    writePrettierConfig();
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

function initializeExpo(answers) {
  commit('Initialize project', () => {
    command(`expo init ${answers.projectName} -t blank --yarn`);
    command(`cd ${answers.projectName}`);
  });

  commit('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    commit('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest@^26', 'jest-expo'],
      });
      setScript('test', 'jest --watchAll');
    });
    commit('Add RNTL and jest-native', () => {
      addNpmPackages({
        dev: true,
        packages: [
          '@testing-library/react-native',
          '@testing-library/jest-native',
        ],
      });
      writeFile(
        'jest-setup-after-env.js',
        `
          import '@testing-library/jest-native/extend-expect';
        `
      );
      // TODO: configure jest setup after env
    });
  }

  commit('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@react-native-community/eslint-config',
        'eslint@"^7.0"',
        'eslint-plugin-import',
        'prettier',
      ],
    });
    writeReactNativeEslintConfig();
    writePrettierConfig();
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

function initializeNode(answers) {
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

  if (answers.unitTesting) {
    commit('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest'],
      });
      setScript('test', 'jest --watchAll');
    });
  }

  commit('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.unitTesting ? ['eslint-plugin-jest'] : null),
      ],
    });
    writeFile(
      '.eslintrc.js',
      `
        module.exports = {
          extends: ['eslint:recommended', 'plugin:prettier/recommended'],
          ${answers.unitTesting ? "plugins: ['jest']," : ''}
          env: {
            es6: true,
            ${answers.unitTesting ? "'jest/globals': true," : ''}
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
    writePrettierConfig({trailingComma: 'es5'});
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

function initializeNodeWithBabel(answers) {
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

  if (answers.unitTesting) {
    commit('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest'],
      });
      setScript('test', 'jest --watchAll');
    });
  }

  commit('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@babel/core',
        '@babel/preset-env',
        '@babel/eslint-parser',
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-import',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.unitTesting ? ['babel-jest', 'eslint-plugin-jest'] : null),
      ],
    });
    writeFile(
      '.babelrc.js',
      `
        module.exports = {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  node: 'current',
                },
              },
            ],
          ],
        };
      `
    );
    writeFile(
      '.eslintrc.js',
      `
        module.exports = {
          extends: ['eslint:recommended', 'plugin:prettier/recommended'],
          parser: '@babel/eslint-parser',
          plugins: [
            'import',
            ${answers.unitTesting ? "'jest'," : ''}
            'prettier',
          ],
          env: {
            es6: true,
            ${answers.unitTesting ? "'jest/globals': true," : ''}
            node: true,
          },
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
          rules: {
            'import/order': ['error', {alphabetize: {order: 'asc'}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
            'no-duplicate-imports': 'error',
            'prettier/prettier': 'error',
            'sort-imports': [
              'error',
              {ignoreDeclarationSort: true, ignoreMemberSort: false},
            ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
          },
        };
      `
    );
    writePrettierConfig();
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

function initializeRN(answers) {
  commit('Initialize project', () => {
    command(`npx react-native init ${answers.projectName}`);
    command(`cd ${answers.projectName}`);
    command('git init .');
  });

  commit('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    commit('Add RNTL and jest-native', () => {
      addNpmPackages({
        dev: true,
        packages: [
          '@testing-library/react-native',
          '@testing-library/jest-native',
        ],
      });
      writeFile(
        'jest-setup-after-env.js',
        `
          import '@testing-library/jest-native/extend-expect';
        `
      );
      // TODO: configure jest setup after env
    });
  }

  commit('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: ['eslint-plugin-import'],
    });
    writeReactNativeEslintConfig();
    writePrettierConfig();
    setScript('lint', 'eslint .');
    command('yarn lint --fix');
  });
}

const FRAMEWORKS = [
  {
    value: 'cra',
    name: 'Create React App',
    skipUnitTestingQuestion: true,
    initializer: initializeCra,
  },
  {
    value: 'doc',
    name: 'Docusaurus',
    skipUnitTestingQuestion: true,
    initializer: initializeDocusaurus,
  },
  {value: 'expo', name: 'Expo', initializer: initializeExpo},
  {value: 'node', name: 'Node', initializer: initializeNode},
  {
    value: 'babel',
    name: 'Node with Babel',
    initializer: initializeNodeWithBabel,
  },
  {value: 'rn', name: 'React Native CLI', initializer: initializeRN},
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
  {
    type: 'confirm',
    name: 'unitTesting',
    message: 'Add unit testing?',
    when: answers => !frameworkForAnswers(answers).skipUnitTestingQuestion,
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

function setScript(scriptName, implementation) {
  console.log(`npm set-script ${scriptName} "${implementation}"`);
}

function writeFile(path, contents) {
  console.log(`Write ${path}`);
  console.log('');
  console.log(contents);
  console.log('');
  console.log('(end of file)');
  console.log('');
}

function writePrettierConfig({trailingComma = 'all'} = {}) {
  writeFile(
    '.prettierrc.js',
    `
      module.exports = {
        arrowParens: 'avoid',
        bracketSpacing: false,
        singleQuote: true,
        trailingComma: '${trailingComma}',
      };
    `
  );
}

function writeReactNativeEslintConfig() {
  writeFile(
    '.eslintrc.js',
    `
      module.exports = {
        root: true,
        extends: '@react-native-community',
        plugins: ['import'],
        rules: {
          'import/order': ['warn', {alphabetize: {order: 'asc'}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
          'no-duplicate-imports': 'error',
          quotes: ['error', 'single', {avoidEscape: true}], // single quote unless using interpolation
          'sort-imports': [
            'warn',
            {ignoreDeclarationSort: true, ignoreMemberSort: false},
          ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
        },
      };
    `
  );
}

function addNpmPackages({dev = false, packages}) {
  command(`yarn add ${dev ? '-D ' : ''}${packages.join(' ')}`);
}

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
