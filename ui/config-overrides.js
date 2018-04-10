const { injectBabelPlugin } = require('react-app-rewired');

module.exports = function override(config) {
  const withBabelImportPlugin = injectBabelPlugin(['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }], config);
  return withBabelImportPlugin;
};
