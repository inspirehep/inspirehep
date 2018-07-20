const path = require('path');
const { injectBabelPlugin } = require('react-app-rewired');
const SassRuleRewirer = require('react-app-rewire-sass-rule');
const rewireLess = require('react-app-rewire-less');

function rewireSassVariablesToLess(config) {
  const sassVariablesToLessRule = {
    test: /\.scss$/,
    issuer: /\.less$/,
    use: {
      loader: './scssVariablesToLess.js',
    },
  };
  config.module.rules.push(sassVariablesToLessRule);
  return config;
}

module.exports = function override(config, env) {
  let overridenConfig = injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    config
  );
  overridenConfig = new SassRuleRewirer()
    .withRuleOptions({ issuer: { exclude: /\.less$/ } })
    .withLoaderOptions({
      data: '@import "variables";',
      includePaths: [path.resolve(__dirname, './src')],
    })
    .rewire(overridenConfig, env);
  overridenConfig = rewireSassVariablesToLess(overridenConfig);
  overridenConfig = rewireLess.withLoaderOptions({ javascriptEnabled: true })(
    overridenConfig,
    env
  );
  return overridenConfig;
};
