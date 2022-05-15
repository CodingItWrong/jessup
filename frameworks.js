const {includeIf} = require('./utils');
const {
  addNpmPackages,
  cd,
  command,
  displayMessage,
  group,
  mkdir,
  setScript,
  writeFile,
} = require('./commands');
const {getReadmeContents} = require('./readme');
const {getGitHubActionsConfig} = require('./gitHubActions');

function initializeCra(answers) {
  group(
    'Initialize project',
    () => {
      command(`yarn create react-app ${answers.projectName}`);
      cd(answers.projectName);
    },
    {commit: false}
  );

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  addCypress(answers, {port: 3000});

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeFile(
      '.eslintrc.js',
      `
        module.exports = {
          extends: ['react-app', 'prettier'],
          plugins: [
            'prettier',
            ${includeIf(answers.cypress, "'cypress',")}
          ],
          ${includeIf(answers.cypress, "env: {'cypress/globals': true},")}
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
    setScript('start', 'EXTEND_ESLINT=true react-scripts start');
    setScript('build', 'EXTEND_ESLINT=true react-scripts build');
    setScript('test', 'EXTEND_ESLINT=true react-scripts test');
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
}

function initializeDocusaurus(answers) {
  group('Initialize project', () => {
    command(
      `npx create-docusaurus@latest -p yarn ${answers.projectName} classic`
    );
    cd(answers.projectName);
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    console.log('TODO: UNIT TESTING');
  }

  addCypress(answers, {port: 3000});

  group('Configure linting and formatting', () => {
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
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeFile(
      '.eslintrc.js',
      `
        module.exports = {
          extends: [
            'eslint:recommended',
            'plugin:react/recommended',
            'prettier',
          ],
          plugins: [
            'prettier',
            'import',
            ${includeIf(answers.cypress, "'cypress',")}
          ],
          parser: '@babel/eslint-parser',
          env: {
            browser: true,
            es6: true,
            node: true,
            ${includeIf(answers.cypress, "'cypress/globals': true")}
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
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
}

function initializeExpo(answers) {
  group(
    'Initialize project',
    () => {
      command(`expo init ${answers.projectName} -t blank --yarn`);
      cd(answers.projectName);
    },
    {commit: false}
  );

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest@^26', 'jest-expo'],
      });
      setScript('test', 'jest --watchAll');
    });
    group('Add RNTL and jest-native', () => {
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

  addCypress(answers, {port: 19006});

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@react-native-community/eslint-config',
        'eslint@"^7.0"',
        'eslint-plugin-import',
        'prettier',
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeReactNativeEslintConfig(answers);
    writePrettierConfig();
    setScript('lint', 'eslint .');
  });

  group('Create sample files', () => {
    writeSampleReactNativeFiles(answers);
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);

  displayMessage(
    `
Your app is almost ready! To finish setup, add the following to package.json:

"jest": {
  "preset": "jest-expo",
  "modulePathIgnorePatterns": ["cypress"],
  "setupFilesAfterEnv": ["./jest-setup-after-env.js"]
},

`
  );
}

function initializeNext(answers) {
  group(
    'Initialize project',
    () => {
      command(`yarn create next-app ${answers.projectName}`);
      cd(answers.projectName);
    },
    {commit: false}
  );

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  addCypress(answers, {port: 3000});

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeFile(
      '.eslintrc.json',
      `
        {
          "extends": [
            "eslint:recommended",
            "next/core-web-vitals",
            "prettier"
          ],
          "plugins": [
            "prettier"
            ${includeIf(answers.cypress, ',"cypress"')}
          ],
          ${includeIf(answers.cypress, '"env": {"cypress/globals": true},')}
          "rules": {
            "import/order": ["warn", {"alphabetize": {"order": "asc"}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
            "no-duplicate-imports": "error",
            "prettier/prettier": "warn",
            "sort-imports": [
              "warn",
              {"ignoreDeclarationSort": true, "ignoreMemberSort": false}
            ] // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
          }
        }
      `
    );
    writePrettierConfig();
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
}

function initializeNode(answers) {
  group('Initialize project', () => {
    command(`mkdir ${answers.projectName}`);
    cd(answers.projectName);
    command('yarn init -y');
    command('npx gitignore node');
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest'],
      });
      setScript('test', 'jest --watchAll');
    });
  }

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.unitTesting ? ['eslint-plugin-jest'] : []),
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
  });

  group('Create sample files', () => {
    writeFile(
      'hello.js',
      `
        module.exports = function hello(name = 'World') {
          return \`Hello, \${name}!\`;
        }
      `
    );

    if (answers.unitTesting) {
      writeFile(
        'hello.spec.js',
        `
          const hello = require('./hello');

          describe('hello', () => {
            it('says hello', () => {
              expect(hello('Josh')).toEqual('Hello, Josh!');
            });
          });
        `
      );
    }
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
}

function initializeNodeWithBabel(answers) {
  group('Initialize project', () => {
    command(`mkdir ${answers.projectName}`);
    cd(answers.projectName);
    command('yarn init -y');
    command('npx gitignore node');
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest'],
      });
      setScript('test', 'jest --watchAll');
    });
  }

  group('Configure linting and formatting', () => {
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
        ...(answers.unitTesting ? ['babel-jest', 'eslint-plugin-jest'] : []),
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

  group('Create sample files', () => {
    writeFile(
      'hello.js',
      `
        export default function hello(name = 'World') {
          return \`Hello, \${name}!\`;
        }
      `
    );

    if (answers.unitTesting) {
      writeFile(
        'hello.spec.js',
        `
          import hello from './hello';

          describe('hello', () => {
            it('says hello', () => {
              expect(hello('Josh')).toEqual('Hello, Josh!');
            });
          });
        `
      );
    }
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
}

function initializeRN(answers) {
  group('Initialize project', () => {
    command(`npx react-native init ${answers.projectName}`);
    cd(answers.projectName);
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add RNTL and jest-native', () => {
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

  if (answers.detox) {
    group('Add Detox', () => {
      addNpmPackages({
        dev: true,
        packages: ['detox', 'jest'],
      });
    });
    command('detox init -r jest');
    writeFile(
      '.detoxrc.json',
      `{
  "testRunner": "jest",
  "runnerConfig": "e2e/config.json",
  "skipLegacyWorkersInjection": true,
  "apps": {
    "ios": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/${answers.projectName}.app",
      "build": "xcodebuild -workspace ios/${answers.projectName}.xcworkspace -scheme ${answers.projectName} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "android": {
      "type": "android.apk",
      "binaryPath": "SPECIFY_PATH_TO_YOUR_APP_BINARY"
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 13"
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_3a_API_30_x86"
      }
    }
  },
  "configurations": {
    "ios": {
      "device": "simulator",
      "app": "ios"
    },
    "android": {
      "device": "emulator",
      "app": "android"
    }
  }
}`
    );
    writeFile(
      'e2e/firstTest.e2e.js',
      `
        describe('Example', () => {
          beforeAll(async () => {
            await device.launchApp();
          });

          beforeEach(async () => {
            await device.reloadReactNative();
          });

          it('should say hello', async () => {
            await expect(element(by.text('Hello, React Native!'))).toBeVisible();
          });
        });
      `
    );
  }

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint-plugin-import',
        ...(answers.detox ? ['eslint-plugin-detox'] : []),
      ],
    });
    writeReactNativeEslintConfig(answers);
    writePrettierConfig();
    setScript('lint', 'eslint .');
  });

  group('Create sample files', () => {
    command('rm -fr __tests__');
    writeSampleReactNativeFiles(answers);
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);

  displayMessage(
    `
Your app is almost ready! To finish setup, update the "jest" key of your package.json to the following:

"jest": {
  "preset": "react-native",
  "setupFilesAfterEnv": ["./jest-setup-after-env.js"]
}
`
  );
}

function addCypress(answers, {port}) {
  if (answers.cypress) {
    group('Add Cypress', () => {
      addNpmPackages({
        dev: true,
        packages: ['cypress'],
      });
      setScript('cypress', 'cypress open');
      writeFile(
        'cypress.json',
        `{
  "baseUrl": "http://localhost:${port}",
  "video": false
}
`
      );
    });
  }
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

function writeReactNativeEslintConfig(answers) {
  writeFile(
    '.eslintrc.js',
    `
      module.exports = {
        root: true,
        extends: '@react-native-community',
        plugins: [
          'import',
          ${includeIf(answers.detox, "'detox',")}
          ${includeIf(answers.cypress, "'cypress',")}
        ],
        ${includeIf(answers.cypress, "env: {'cypress/globals': true},")}
        rules: {
          'import/order': ['warn', {alphabetize: {order: 'asc'}}], // group and then alphabetize lines - https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
          'no-duplicate-imports': 'error',
          quotes: ['error', 'single', {avoidEscape: true}], // single quote unless using interpolation
          'sort-imports': [
            'warn',
            {ignoreDeclarationSort: true, ignoreMemberSort: false},
          ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
        },
        ${includeIf(
          answers.detox,
          `        overrides: [
          {
            files: ['*.e2e.js'],
            env: {
              'detox/detox': true,
              jest: true,
              'jest/globals': true,
            },
          },
        ],`
        )}
      };
    `
  );
}

function writeReadme(answers) {
  const framework = FRAMEWORKS.find(f => f.value === answers.framework);

  group('Configure readme', () => {
    writeFile('README.md', getReadmeContents(answers, framework));
  });
}

function writeGitHubActionsConfig(answers) {
  if (!answers.gitHubActions) {
    return;
  }

  const framework = FRAMEWORKS.find(f => f.value === answers.framework);

  group('Configure GitHub Actions', () => {
    const path = '.github/workflows';
    mkdir(path);
    writeFile(`${path}/test.yml`, getGitHubActionsConfig(answers, framework));
  });
}

function writeSampleReactNativeFiles(answers) {
  writeFile(
    'App.js',
    `
      import React from 'react';
      import {SafeAreaView, StatusBar, Text} from 'react-native';

      export default function App() {
        return (
          <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
              <Text>Hello, React Native!</Text>
            </SafeAreaView>
          </>
        );
      }
    `
  );

  if (answers.unitTesting) {
    writeFile(
      'App.spec.js',
      `
        import {render} from '@testing-library/react-native';
        import React from 'react';
        import App from './App';

        describe('App', () => {
          it('renders a hello message', () => {
            const {queryByText} = render(<App />);
            expect(queryByText('Hello, React Native!')).not.toBeNull();
          });
        });
      `
    );
  }
}

const FRAMEWORKS = [
  {
    value: 'cra',
    name: 'Create React App',
    alwaysIncludeUnitTesting: true,
    skipUnitTestingQuestion: true,
    cypressAvailable: true,
    devServerPort: 3000,
    initializer: initializeCra,
  },
  {
    value: 'doc',
    name: 'Docusaurus',
    skipUnitTestingQuestion: true,
    cypressAvailable: true,
    devServerPort: 3000,
    initializer: initializeDocusaurus,
  },
  {
    value: 'expo',
    name: 'Expo',
    cypressAvailable: true,
    devServerScript: 'web',
    devServerPort: 19006,
    initializer: initializeExpo,
  },
  {
    value: 'next',
    name: 'Next',
    skipUnitTestingQuestion: true,
    cypressAvailable: true,
    devServerScript: 'dev',
    devServerPort: 3000,
    initializer: initializeNext,
  },
  {
    value: 'node',
    name: 'Node',
    omitRunScript: true,
    initializer: initializeNode,
  },
  {
    value: 'babel',
    name: 'Node with Babel',
    omitRunScript: true,
    initializer: initializeNodeWithBabel,
  },
  {
    value: 'rn',
    name: 'React Native CLI',
    initializer: initializeRN,
    defaultProjectName: 'MyRNApp',
    detoxAvailable: true,
  },
];

module.exports = FRAMEWORKS;
