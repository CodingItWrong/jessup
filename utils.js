function includeIf(condition, text) {
  if (condition) {
    return text;
  } else {
    return '';
  }
}

module.exports = {includeIf};
