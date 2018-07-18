const { injectBabelPlugin } = require('react-app-rewired');
const rewireSass = require('react-app-rewire-sass-modules');
const rewireLess = require('react-app-rewire-less');

module.exports = function override(config, env) {
  let overridenConfig = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    config
  );
  overridenConfig = rewireSass(overridenConfig, env);
  overridenConfig = rewireLess.withLoaderOptions({ javascriptEnabled: true })(
    overridenConfig,
    env
  );
  return overridenConfig;
};
