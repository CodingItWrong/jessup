const {execSync} = require('child_process');
const fs = require('fs');
const {chdir} = require('process');

const DRY_RUN = false;

function cd(path) {
  console.log(`$ cd ${path}`);

  if (!DRY_RUN) {
    chdir(path);
  }
}

function command(commandText) {
  console.log(`$ ${commandText}`);

  // TODO: use polymorphism instead of a conditional
  if (!DRY_RUN) {
    try {
      execSync(commandText);
    } catch (e) {
      console.error(e.stdout.toString());
      console.error(e.stderr.toString());
      throw e;
    }
  }
}

function commit(message, stepImplementation) {
  console.log(message.toUpperCase());
  console.log('');
  stepImplementation();
  command('git add .');
  command(`git commit -m "${message}"`);
  console.log('');
}

function setScript(scriptName, implementation) {
  command(`npm set-script ${scriptName} "${implementation}"`);
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

module.exports = {
  addNpmPackages,
  cd,
  command,
  commit,
  setScript,
  writeFile,
};
