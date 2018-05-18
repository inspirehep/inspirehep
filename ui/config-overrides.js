const { injectBabelPlugin } = require('react-app-rewired');
const rewireSass = require('react-app-rewire-sass-modules');

module.exports = function override(config, env) {
  let overridenConfig = injectBabelPlugin(['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }], config);
  overridenConfig = rewireSass(config, env);
  return overridenConfig;
};
