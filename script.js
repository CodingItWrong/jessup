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
const {
  getGitHubActionsConfig,
  getDetoxGitHubActionsConfig,
} = require('./gitHubActions');

function frameworkForAnswers(answers) {
  return FRAMEWORKS.find(f => f.value === answers.framework);
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

  addCypress(answers);

  group('Configure linting and formatting', () => {
    addNpmPackages({
      dev: true,
      packages: [
        '@babel/core',
        '@babel/eslint-parser',
        'eslint',
        'eslint-config-prettier',
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
            'plugin:react/jsx-runtime',
            'prettier',
          ],
          ${includeIf(answers.cypress, "plugins: ['cypress'],")}
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
            'no-duplicate-imports': 'error',
            'react/prop-types': 'off',
          },
        };
      `
    );
    writePrettierConfig();
    setScript('format', 'npx prettier . --write');
    setScript('lint:format', 'npx prettier . --check');
    setScript('lint:eslint', 'eslint . --max-warnings=0');
    setScript('lint', 'npm run lint:eslint && npm run lint:format');
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn format');
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

  if (answers.unitTesting || answers.detox) {
    group('Add Jest', () => {
      command('npx expo install jest-expo jest');
    });
  }

  if (answers.unitTesting) {
    group('Add unit test command', () => {
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
      command('detox init -r jest');
    });
    await groupAsync('Configure Detox', async () => {
      await modifyJson(
        'package.json',
        '.jest.modulePathIgnorePatterns = ["e2e"]'
      );
      const xcodeProjectName = answers.projectName.replaceAll('-', '');
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
              setupTimeout: 600000 // 10 min
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
              binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/${xcodeProjectName}.app',
              build: 'xcodebuild -workspace ios/${xcodeProjectName}.xcworkspace -scheme ${xcodeProjectName} -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
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
    });
  }

  addCypress(answers);

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

  writeDetoxGitHubActionsConfig(answers);
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

  addCypress(answers);

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
        'prettier',
        ...(answers.unitTesting ? ['eslint-plugin-jest'] : []),
      ],
    });
    writeFile(
      '.eslintrc.js',
      dedent`
        module.exports = {
          extends: ['eslint:recommended', 'prettier'],
          ${answers.unitTesting ? "plugins: ['jest']," : ''}
          env: {
            es6: true,
            ${answers.unitTesting ? "'jest/globals': true," : ''}
            node: true,
          },
          parserOptions: {
            ecmaVersion: 'latest',
          },
        };
      `
    );
    writePrettierConfig({trailingComma: 'es5'});
    setScript('format', 'npx prettier . --write');
    setScript('lint:format', 'npx prettier . --check');
    setScript('lint:eslint', 'eslint .  --max-warnings=0');
    setScript('lint', 'npm run lint:eslint && npm run lint:format');
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
    command('yarn format');
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
          extends: ['eslint:recommended', 'prettier'],
          parser: '@babel/eslint-parser',
          ${answers.unitTesting ? "plugins: ['jest']," : ''}
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
            'no-duplicate-imports': 'error',
          },
        };
      `
    );
    writePrettierConfig();
    setScript('format', 'npx prettier . --write');
    setScript('lint:format', 'npx prettier . --check');
    setScript('lint:eslint', 'eslint . --max-warnings=0');
    setScript('lint', 'npm run lint:eslint && npm run lint:format');
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
    command('yarn format');
  });

  writeGitHubActionsConfig(answers);
}

async function initializeRN(answers) {
  group('Initialize project', () => {
    command(`npx react-native@latest init ${answers.projectName}`);
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
      addNpmPackages({dev: true, packages: ['detox']});
      command('detox init -r jest');
    });
    await groupAsync('Configure Detox', async () => {
      writeFile(
        'jest.config.js',
        dedent`
        module.exports = {
          preset: 'react-native',
          modulePathIgnorePatterns: ['e2e'],
        };
        `
      );
      await modifyJson(
        'package.json',
        '.jest.modulePathIgnorePatterns = ["e2e"]'
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
              setupTimeout: 600000 // 10 min
            }
          },
          apps: {
            'ios.debug': {
              type: 'ios.app',
              binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/${answers.projectName}.app',
              build: 'xcodebuild -workspace ios/${answers.projectName}.xcworkspace -scheme ${answers.projectName} -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
            },
            'ios.release': {
              type: 'ios.app',
              binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/${answers.projectName}.app',
              build: 'xcodebuild -workspace ios/${answers.projectName}.xcworkspace -scheme ${answers.projectName} -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
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
    });
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

  writeDetoxGitHubActionsConfig(answers);
}

function initializeVite(answers) {
  group('Initialize project', () => {
    command(`yarn create vite ${answers.projectName} --template react`);
    cd(answers.projectName);
    command('yarn install');
    command('git init .');
  });

  group('Prevent package lock', () => {
    command('echo "package-lock=false" >> .npmrc');
  });

  if (answers.unitTesting) {
    group('Add Jest', () => {
      addNpmPackages({
        dev: true,
        packages: [
          '@babel/preset-env',
          '@babel/preset-react',
          'babel-jest',
          'jest',
          'jest-environment-jsdom',
        ],
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
        'jest.config.cjs',
        dedent`
          module.exports = {
            testEnvironment: 'jest-environment-jsdom',
            setupFilesAfterEnv: ['<rootDir>/jest-setup-after-env.js'],
          };
        `
      );
    });
    group('Add sample RTL test', () => {
      writeFile(
        'src/App.spec.jsx',
        dedent`
          import {render, screen} from '@testing-library/react';
          import App from './App';

          describe('App', () => {
            it('renders', () => {
              render(<App />);

              expect(screen.getByText('Vite + React')).toBeVisible();
            });
          });
      `
      );
    });
  }

  addCypress(answers, {cjs: true});

  group('Configure linting and formatting', () => {
    command('yarn add --dev "eslint@^8"'); // temporarily get working with eslint 8, until can update for 9 and confirm it all works
    addNpmPackages({
      dev: true,
      packages: [
        'eslint-config-prettier',
        'eslint-plugin-react',
        'prettier',
        ...(answers.unitTesting ? ['eslint-plugin-jest'] : []),
        ...(answers.cypress ? ['eslint-plugin-cypress'] : []),
      ],
    });
    writeFile(
      '.babelrc.cjs',
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
            [
              '@babel/preset-react',
              {
                runtime: "automatic",
              },
            ],
          ],
        };
      `
    );
    writeFile(
      '.eslintrc.cjs',
      dedent`
        module.exports = {
          extends: [
            'eslint:recommended',
            'plugin:react/recommended',
            'plugin:react/jsx-runtime',
            'prettier',
          ],
          ignorePatterns: ['dist', '.eslintrc.cjs'],
          parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
          plugins: [
            'import',
            ${includeIf(answers.unitTesting, "'jest',")}
            ${includeIf(answers.cypress, "'cypress',")}
          ],
          env: {
            browser: true,
            es2020: true,
            node: true,
            ${includeIf(answers.unitTesting, "'jest/globals': true,")}
            ${includeIf(answers.cypress, "'cypress/globals': true,")}
          },
          settings: {
            react: {
              version: 'detect',
            },
          },
          rules: {
            'no-duplicate-imports': 'error',
            'react/prop-types': 'off',
          },
        };
      `
    );
    writeFile(
      '.prettierrc.json',
      dedent`
        {
          "arrowParens": "avoid",
          "bracketSameLine": true,
          "bracketSpacing": false,
          "singleQuote": true,
          "trailingComma": "all"
        }
      `
    );
    setScript('format', 'npx prettier src --write');
    setScript('lint:format', 'npx prettier src --check');
    setScript('lint:eslint', 'eslint --ext .js,.jsx  --max-warnings=0');
    setScript('lint', 'npm run lint:eslint && npm run lint:format');
  });

  group('Create sample files', () => {
    command('rm src/App.css');
    writeFile('src/index.css', '');

    writeFile(
      'src/App.jsx',
      dedent`
        export default function App() {
          return <h1>Hello, Vite!</h1>;
        }
      `
    );

    if (answers.unitTesting) {
      writeFile(
        'src/App.spec.jsx',
        dedent`
          import {render, screen} from '@testing-library/react';
          import App from './App'

          describe('App', () => {
            it('renders', () => {
              render(<App />);

              expect(screen.getByText('Hello, Vite!')).toBeVisible();
            });
          });
        `
      );
    }
  });

  writeReadme(answers);

  group('Autoformat files', () => {
    command('yarn format');
  });

  writeGitHubActionsConfig(answers);
}

function addCypress(answers, {cjs} = {}) {
  const framework = FRAMEWORKS.find(f => f.value === answers.framework);

  if (answers.cypress) {
    group('Add Cypress', () => {
      addNpmPackages({
        dev: true,
        packages: ['cypress'],
      });
      setScript('cypress', 'cypress open');
      writeFile(
        `cypress.config.${cjs ? 'c' : ''}js`,
        dedent`
          const {defineConfig} = require('cypress');

          module.exports = defineConfig({
            video: false,
            e2e: {
              baseUrl: 'http://localhost:${framework.devServerPort}',
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
      mkdir('cypress/e2e');
      writeFile(
        'cypress/e2e/starter.cy.js',
        dedent`
          describe('starter spec', () => {
            it('shows a hello message', () => {
              cy.visit('/');
              cy.contains('Hello, Vite!');
            });
          });
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
            files: ['e2e/**/*.test.js'],
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

function writeDetoxGitHubActionsConfig(answers) {
  if (answers.detox && answers.gitHubActions) {
    group('Configure GitHub Action for Detox', () => {
      const path = '.github/workflows';
      mkdir(path);
      writeFile(`${path}/detox.yml`, getDetoxGitHubActionsConfig(answers));
    });
  }
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
  {
    value: 'vite',
    name: 'React with Vite',
    devServerScript: 'dev',
    ciDevServerScript: 'dev --host',
    devServerPort: 5173,
    initializer: initializeVite,
    defaultProjectName: 'my-react-app',
    cypressAvailable: true,
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
