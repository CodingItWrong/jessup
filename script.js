const dedent = require('dedent');
const {includeIf} = require('./utils');
const {
  addNpmPackages,
  cd,
  command,
  group,
  groupAsync,
  mkdir,
  modifyJson,
  setScript,
  writeFile,
} = require('./commands');
const {getReadmeContents} = require('./readme');
const {getGitHubActionsConfig} = require('./gitHubActions');

function frameworkForAnswers(answers) {
  return FRAMEWORKS.find(f => f.value === answers.framework);
}

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

  group('Update User Event library', () => {
    addNpmPackages({
      dev: true,
      packages: ['@testing-library/user-event'],
    });
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
      dedent`
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
          overrides: [
            {
              files: ['src/**/*.spec.js'],
              extends: ['react-app/jest'],
            },
          ],
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
      dedent`
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

async function initializeExpo(answers) {
  group(
    'Initialize project',
    () => {
      command(`yarn create expo-app ${answers.projectName} -t blank`);
      cd(answers.projectName);
    },
    {commit: false}
  );

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add Jest', () => {
      command('npx expo install jest-expo jest');
      setScript('test', 'jest --watchAll');
    });
    await groupAsync('Add RNTL and jest-native', async () => {
      addNpmPackages({
        dev: true,
        packages: [
          'eslint-plugin-testing-library',
          '@testing-library/react-native',
          '@testing-library/jest-native',
        ],
      });
      writeFile(
        'jest-setup-after-env.js',
        dedent`
          import '@testing-library/jest-native/extend-expect';
        `
      );
      await modifyJson(
        'package.json',
        '.jest = {"preset": "jest-expo", "modulePathIgnorePatterns": ["cypress"], "setupFilesAfterEnv": ["./jest-setup-after-env.js"]}'
      );
    });
  }

  if (answers.detox) {
    group('Add Detox', () => {
      addNpmPackages({dev: true, packages: ['detox']});
    });
    command('detox init -r jest');
    writeFile(
      'e2e/jest.config.js',
      dedent`
        /** @type {import('@jest/types').Config.InitialOptions} */
        module.exports = {
          rootDir: '..',
          testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
          testTimeout: 120000,
          maxWorkers: 1,
          globalSetup: 'detox/runners/jest/globalSetup',
          globalTeardown: 'detox/runners/jest/globalTeardown',
          reporters: ['detox/runners/jest/reporter'],
          testEnvironment: 'detox/runners/jest/testEnvironment',
          verbose: true,
        };
      `
    );
    writeFile(
      '.detoxrc.js',
      dedent`
        /** @type {Detox.DetoxConfig} */
        module.exports = {
          testRunner: {
            args: {
              '$0': 'jest',
              config: 'e2e/jest.config.js'
            },
            jest: {
              setupTimeout: 120000
            }
          },
          apps: {
            'ios.debug': {
              type: 'ios.app',
              binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YOUR_APP.app',
              build: 'xcodebuild -workspace ios/YOUR_APP.xcworkspace -scheme YOUR_APP -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
            },
            'ios.release': {
              type: 'ios.app',
              binaryPath: '${answers.projectName.replaceAll('-', '')}.app',
              build: 'eas build --local --profile development-detox --platform ios && tar -xvzf build-*.tar.gz && rm build-*.tar.gz'
            },
            'android.debug': {
              type: 'android.apk',
              binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
              build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
              reversePorts: [
                8081
              ]
            },
            'android.release': {
              type: 'android.apk',
              binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
              build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
            }
          },
          devices: {
            simulator: {
              type: 'ios.simulator',
              device: {
                type: 'iPhone 14'
              }
            },
            attached: {
              type: 'android.attached',
              device: {
                adbName: '.*'
              }
            },
            emulator: {
              type: 'android.emulator',
              device: {
                avdName: 'Pixel_3a_API_30_x86'
              }
            }
          },
          configurations: {
            'ios.sim.debug': {
              device: 'simulator',
              app: 'ios.debug'
            },
            'ios.sim.release': {
              device: 'simulator',
              app: 'ios.release'
            },
            'android.att.debug': {
              device: 'attached',
              app: 'android.debug'
            },
            'android.att.release': {
              device: 'attached',
              app: 'android.release'
            },
            'android.emu.debug': {
              device: 'emulator',
              app: 'android.debug'
            },
            'android.emu.release': {
              device: 'emulator',
              app: 'android.release'
            }
          }
        };
      `
    );
    writeFile(
      'eas.json',
      dedent`
        {
          "cli": {
            "version": ">= 3.3.2",
            "promptToConfigurePushNotifications": false
          },
          "build": {
            "development": {
              "developmentClient": true,
              "distribution": "internal",
              "channel": "development"
            },
            "development-simulator": {
              "developmentClient": true,
              "distribution": "internal",
              "ios": {
                "simulator": true
              }
            },
            "development-detox": {
              "distribution": "internal",
              "channel": "development",
              "ios": {
                "simulator": true
              }
            },
            "preview": {
              "distribution": "internal",
              "channel": "preview"
            },
            "production": {
              "channel": "production"
            }
          },
          "submit": {
            "production": {}
          }
        }
      `
    );
    command('rm e2e/starter.test.js');
    writeFile(
      'e2e/starter.e2e.js',
      dedent`
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

  addCypress(answers, {port: 19006});

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@react-native-community/eslint-config',
        'eslint',
        'eslint-plugin-import',
        'prettier',
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
        ...(answers.detox ? ['eslint-plugin-detox'] : []),
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

  if (answers.detox && answers.gitHubActions) {
    group('Configure GitHub Action for Detox', () => {
      const path = '.github/workflows';
      mkdir(path);
      writeFile(
        `${path}/detox.yml`,
        `name: Detox
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: macos-12
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 16 # expo-cli preferred
          cache: "yarn"

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: \${{ secrets.EXPO_TOKEN }}

      - name: Install Detox CLI
        run: |
          brew tap wix/brew
          brew install applesimutils
          npm install -g detox-cli

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build App for Detox
        run: detox build -c ios.sim.release

      - uses: futureware-tech/simulator-action@v2
        with:
          model: "iPhone 14"

      - name: Run Detox
        run: detox test -c ios.sim.release
`
      );
    });

    group('Set up EAS project', () => {
      command('detox build -c ios.sim.release');
    });
  }
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

  if (answers.unitTesting) {
    group('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: ['jest', 'jest-environment-jsdom', '@types/jest'],
      });
      setScript('test', 'jest --watchAll');
    });
    group('Add Testing Library packages', () => {
      addNpmPackages({
        dev: true,
        packages: [
          '@testing-library/jest-dom',
          '@testing-library/react',
          '@testing-library/user-event',
        ],
      });
      writeFile(
        'jest-setup-after-env.js',
        dedent`
          import '@testing-library/jest-dom';
        `
      );
      writeFile(
        'jest.config.js',
        dedent`
          const nextJest = require('next/jest')

          const createJestConfig = nextJest({dir: './'})

          const customJestConfig = {
            moduleDirectories: ['node_modules', '<rootDir>/'],
            testEnvironment: 'jest-environment-jsdom',
            setupFilesAfterEnv: ['<rootDir>/jest-setup-after-env.js'],
          }

          module.exports = createJestConfig(customJestConfig)
        `
      );
    });
    group('Add sample RTL test', () => {
      writeFile(
        'pages/index.spec.js',
        dedent`
          import {render, screen} from '@testing-library/react';
          import Home from './index'

          describe('Home', () => {
            it('renders', () => {
              render(<Home />);

              expect(screen.getByText('Next.js!')).toBeInTheDocument();
            });
          });
      `
      );
    });
  }

  addCypress(answers, {port: 3000});

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        'eslint-config-prettier',
        'eslint-plugin-prettier',
        'prettier',
        ...(answers.unitTesting ? ['eslint-plugin-jest'] : []),
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeFile(
      '.eslintrc.json',
      dedent`
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
          }${includeIf(
            answers.unitTesting,
            `,
          "overrides": [
            {
              "files": ["**/*.spec.js"],
              "plugins": ["jest"],
              "env": {"jest/globals": true},
              "extends": ["plugin:jest/recommended"]
            }
          ]
            `
          )}
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
        packages: ['jest', '@types/jest'],
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
      dedent`
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
      `module.exports = function hello(name = 'World') {
  return \`Hello, \${name}!\`;
}
`
    );

    if (answers.unitTesting) {
      writeFile(
        'hello.spec.js',
        dedent`
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
        packages: ['jest', '@types/jest'],
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
      dedent`
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
      dedent`
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
  });

  group('Create sample files', () => {
    writeFile(
      'hello.js',
      `export default function hello(name = 'World') {
  return \`Hello, \${name}!\`;
}
`
    );

    if (answers.unitTesting) {
      writeFile(
        'hello.spec.js',
        dedent`
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

async function initializeRN(answers) {
  group('Initialize project', () => {
    command(`npx react-native init ${answers.projectName}`);
    cd(answers.projectName);
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  group('Remove need for React import', () => {
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#manual-babel-setup
    // https://aryan-mittal.medium.com/enable-the-new-jsx-transform-in-react-native-0-64-aea4f686a640
    writeFile(
      './.babel.config.js',
      dedent`
        module.exports = {
          presets: ['module:metro-react-native-babel-preset'],
          plugins: [
            [
              '@babel/plugin-transform-react-jsx',
              {
                runtime: 'automatic',
              },
            ],
          ],
        };
      `
    );
  });

  if (answers.unitTesting) {
    await groupAsync('Add RNTL and jest-native', async () => {
      addNpmPackages({
        dev: true,
        packages: [
          'eslint-plugin-testing-library',
          '@testing-library/react-native',
          '@testing-library/jest-native',
        ],
      });
      writeFile(
        'jest-setup-after-env.js',
        dedent`
          import '@testing-library/jest-native/extend-expect';
        `
      );
      await modifyJson(
        'package.json',
        '.jest.setupFilesAfterEnv = ["./jest-setup-after-env.js"]'
      );
    });
  }

  if (answers.detox) {
    group('Add Detox', () => {
      addNpmPackages({
        dev: true,
        packages: ['detox'],
      });
    });
    command('detox init -r jest');
    writeFile(
      '.detoxrc.json',
      dedent`
        {
          "testRunner": "jest",
          "runnerConfig": "e2e/config.json",
          "skipLegacyWorkersInjection": true,
          "apps": {
            "ios.debug": {
              "type": "ios.app",
              "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/${answers.projectName}.app",
              "build": "xcodebuild -workspace ios/${answers.projectName}.xcworkspace -scheme ${answers.projectName} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
            },
            "ios.release": {
              "type": "ios.app",
              "binaryPath": "ios/build/Build/Products/Release-iphonesimulator/${answers.projectName}.app",
              "build": "xcodebuild -workspace ios/${answers.projectName}.xcworkspace -scheme ${answers.projectName} -configuration Release -sdk iphonesimulator -derivedDataPath ios/build"
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
            "ios.sim.debug": {
              "device": "simulator",
              "app": "ios.debug"
            },
            "ios.sim.release": {
              "device": "simulator",
              "app": "ios.release"
            },
            "android": {
              "device": "emulator",
              "app": "android"
            }
          }
        }
      `
    );
    writeFile(
      'e2e/starter.test.js',
      dedent`
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
  });

  group('Create sample files', () => {
    command('rm -fr __tests__');
    command('rm -fr App.tsx'); // until the template is updated to be TS
    writeSampleReactNativeFiles(answers);
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn lint --fix');
  });

  writeGitHubActionsConfig(answers);
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
        'cypress.config.js',
        dedent`
          const {defineConfig} = require('cypress');

          module.exports = defineConfig({
            video: false,
            e2e: {
              baseUrl: 'http://localhost:${port}',
            },
          });
        `
      );
      mkdir('cypress/support');
      writeFile(
        'cypress/support/e2e.js',
        dedent`
          import './commands';
        `
      );
      writeFile(
        'cypress/support/commands.js',
        `
`
      );
    });
  }
}

function writePrettierConfig({trailingComma = 'all'} = {}) {
  writeFile(
    '.prettierrc.js',
    dedent`
      module.exports = {
        arrowParens: 'avoid',
        bracketSameLine: true,
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
    dedent`
      module.exports = {
        root: true,
        extends: ['@react-native-community'],
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
          'react/jsx-uses-react': 'off',
          'react/no-unstable-nested-components': ['warn', {allowAsProps: true}], // allow function props that return components
          'react/react-in-jsx-scope': 'off',
          'sort-imports': [
            'warn',
            {ignoreDeclarationSort: true, ignoreMemberSort: false},
          ], // alphabetize named imports - https://eslint.org/docs/rules/sort-imports
        },
        overrides: [
        ${includeIf(
          answers.detox,
          `{
            files: ['e2e/**/*.e2e.js'],
            env: {
              'detox/detox': true,
              jest: true,
              'jest/globals': true,
            },
          },`
        )}
        ${includeIf(
          answers.unitTesting,
          `{
            files: ['src/**/*.spec.js'],
            extends: ['plugin:testing-library/react'],
          },`
        )}
        ],
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
    dedent`
      // SafeAreaView fails without React import in CLI for some reason
      // eslint-disable-next-line no-unused-vars
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
      dedent`
        import {render, screen} from '@testing-library/react-native';
        import App from './App';

        describe('App', () => {
          it('renders a hello message', () => {
            render(<App />);
            expect(screen.getByText('Hello, React Native!')).toBeVisible();
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
    detoxAvailable: true,
  },
  {
    value: 'next',
    name: 'Next',
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
    name: 'detox',
    message: 'Configure E2E native testing with Detox?',
    when: answers => frameworkForAnswers(answers).detoxAvailable,
  },
  {
    type: 'confirm',
    name: 'cypress',
    message: 'Configure E2E web testing with Cypress?',
    when: answers => frameworkForAnswers(answers).cypressAvailable,
  },
  {
    type: 'confirm',
    name: 'gitHubActions',
    message: 'Configure CI with GitHub Actions?',
  },
];

function initialize(answers) {
  const framework = frameworkForAnswers(answers);

  console.log(`Initializing ${framework.name} project`);

  framework.initializer(answers);
}

module.exports = {questions, initialize, FRAMEWORKS};
