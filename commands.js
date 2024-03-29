const {execSync} = require('child_process');
const fs = require('fs');
const {chdir} = require('process');
const jq = require('node-jq');

const DRY_RUN = false;

function cd(path) {
  console.log(`$ cd ${path}`);

  if (!DRY_RUN) {
    chdir(path);
  }
}

function mkdir(path) {
  console.log(`$ mkdir -p ${path}`);

  if (!DRY_RUN) {
    fs.mkdirSync(path, {recursive: true});
  }
}

function command(commandText) {
  console.log(`$ ${commandText}`);

  // TODO: use polymorphism instead of a conditional
  if (!DRY_RUN) {
    try {
      execSync(commandText, {stdio: 'inherit'});
    } catch (e) {
      console.error(e.stdout.toString());
      console.error(e.stderr.toString());
      throw e;
    }
  }
}

function group(message, stepImplementation, {commit = true} = {}) {
  console.log(message.toUpperCase());
  console.log('');
  stepImplementation();
  if (commit) {
    command('git add .');
    command(`git commit -m "${message}"`);
  }
  console.log('');
}

async function groupAsync(
  message,
  stepImplementationAsync,
  {commit = true} = {}
) {
  console.log(message.toUpperCase());
  console.log('');
  await stepImplementationAsync();
  if (commit) {
    command('git add .');
    command(`git commit -m "${message}"`);
  }
  console.log('');
}

async function modifyJson(jsonFile, query) {
  const formattedJsonData = await jq.run(query, jsonFile);
  writeFile(jsonFile, formattedJsonData);
}

function setScript(scriptName, implementation) {
  command(`npm pkg set "scripts.${scriptName}"="${implementation}"`);
}

function writeFile(path, contents) {
  console.log(`Write ${path}`);
  console.log('');
  console.log(contents);
  console.log('');
  console.log('(end of file)');
  console.log('');

  if (!DRY_RUN) {
    fs.writeFileSync(path, contents);
  }
}

function addNpmPackages({dev = false, packages}) {
  command(`yarn add ${dev ? '-D ' : ''}${packages.join(' ')}`);
}

function displayMessage(message) {
  console.log(message);
}

module.exports = {
  addNpmPackages,
  cd,
  command,
  displayMessage,
  group,
  groupAsync,
  mkdir,
  modifyJson,
  setScript,
  writeFile,
};
