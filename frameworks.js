const {
  addNpmPackages,
  cd,
  command,
  group,
  setScript,
  writeFile,
} = require('./commands');

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

  group('Configure linting and formatting', () => {
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
    setScript('start', 'EXTEND_ESLINT=true react-scripts start');
    setScript('build', 'EXTEND_ESLINT=true react-scripts build');
    setScript('test', 'EXTEND_ESLINT=true react-scripts test');
  });

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
}

function initializeDocusaurus(answers) {
  group('Initialize project', () => {
    command(
      `npx create-docusaurus@latest -p yarn ${answers.projectName} classic`
    );
    cd(answers.projectName);
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    console.log('TODO: UNIT TESTING');
  }

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
  });

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
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

  group('Configure linting and formatting', () => {
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
  });

  group('Create sample files', () => {
    writeSampleReactNativeFiles(answers);
  });

  group('Add readme', () => {
    writeFile(
      'README.md',
      `# My App

Describe your app here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)

Optional:

- To run on Android Emulator, [Android Studio](https://developer.android.com/studio)
- To run on iOS Simulator, [Xcode](https://developer.apple.com/xcode/)

## Installation

- Clone the repo
- Run \`yarn install\`

Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.

## Running

- Run \`yarn start\`
- From the interface that appears, choose "Run on Android device/emulator", "Run on iOS Simulator", and/or "Run in web browser"
${includeIf(
  answers.unitTesting,
  `
## Test

\`\`\`
$ yarn test
\`\`\`
`
)}`
    );
  });

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
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

  writeNodeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
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

  writeNodeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
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

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: ['eslint-plugin-import'],
    });
    writeReactNativeEslintConfig();
    writePrettierConfig();
    setScript('lint', 'eslint .');
  });

  group('Create sample files', () => {
    command('rm -fr __tests__');
    writeSampleReactNativeFiles(answers);
  });

  group('Add readme', () => {
    writeFile(
      'README.md',
      `# My App

Describe your app here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)
- [Ruby](https://www.ruby-lang.org/)
- [Cocoapods](https://cocoapods.org/)
- [Android Studio](https://developer.android.com/studio) and/or [Xcode](https://developer.apple.com/xcode/)

## Installation

- Clone the repo

\`\`\`bash
$ yarn install
$ cd ios
$ pod install
\`\`\`

Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.

## Running

- In one terminal, run \`yarn start\`
- In another terminal, run \`yarn android\` or \`yarn ios\`
${includeIf(
  answers.unitTesting,
  `
## Test

\`\`\`
$ yarn test
\`\`\`
`
)}`
    );
  });

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });
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

function writeNodeReadme(answers) {
  group('Add readme', () => {
    writeFile(
      'README.md',
      `# My App

Describe your app here.

## Requirements

- [Node](https://nodejs.org)
- [Yarn 1.x](https://classic.yarnpkg.com/lang/en/)

## Installation

- Clone the repo
- Run \`yarn install\`

Dependencies are locked with \`yarn.lock\`; please use \`yarn\` rather than \`npm\` for installing.

## Running

\`\`\`
$ yarn start
\`\`\`
${includeIf(
  answers.unitTesting,
  `
## Test

\`\`\`
$ yarn test
\`\`\`
`
)}`
    );
  });
}

function includeIf(condition, text) {
  if (condition) {
    return text;
  } else {
    return '';
  }
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
  {
    value: 'rn',
    name: 'React Native CLI',
    initializer: initializeRN,
    defaultProjectName: 'MyRNApp',
  },
];

module.exports = FRAMEWORKS;
