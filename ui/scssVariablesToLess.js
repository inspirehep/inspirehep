// This loader will simply replace all $something sass-variable with @something less-variables
module.exports = function scssVariablesToLess(source) {
  return source.replace(/\$/gi, '@');
};
