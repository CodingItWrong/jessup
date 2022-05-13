function command(commandText) {
  console.log(`$ ${commandText}`);
}

function commit(message, stepImplementation) {
  console.log(message.toUpperCase());
  console.log('');
  stepImplementation();
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
}

function addNpmPackages({dev = false, packages}) {
  command(`yarn add ${dev ? '-D ' : ''}${packages.join(' ')}`);
}

module.exports = {
  addNpmPackages,
  command,
  commit,
  setScript,
  writeFile,
};
