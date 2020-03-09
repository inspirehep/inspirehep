const { ESLINT_MODES } = require('@craco/craco');
const path = require('path');
const SassRuleRewirer = require('react-app-rewire-sass-rule');
const CracoAntDesignPlugin = require('craco-antd');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

const styleVariables = require('./src/styleVariables');

function withCustomScssLoader({ webpackConfig, context }) {
  return new SassRuleRewirer()
    .withRuleOptions({
      use: [
        {
          loader: '@epegzz/sass-vars-loader',
          options: {
            syntax: 'scss',
            vars: styleVariables,
          },
        },
      ],
    })
    .withLoaderOptions({
      includePaths: [path.resolve(__dirname, './src')],
    })
    .rewire(webpackConfig, context.env);
}

function withFilterWarningsPluginForCssImportOrderConflict({ webpackConfig }) {
  const filterOrderConflictWarnings = new FilterWarningsPlugin({
    exclude: /Conflicting order between:/,
  });
  webpackConfig.plugins.push(filterOrderConflictWarnings);
  return webpackConfig;
}

// to workaround https://github.com/DocSpring/craco-less/issues/34
function appendLoaderOptionsIntoUseForSassRule({ webpackConfig }) {
  const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
  const sassRule = oneOfRule.oneOf.find(
    rule => rule.test && rule.test.toString().includes("scss|sass")
  );
  sassRule.use = [...(sassRule.use || []), ...sassRule.loader];
  delete sassRule.loader;
  return webpackConfig;
}

function makeOverrideWebpackPlugin(overrideFunction) {
  return {
    plugin: {
      overrideWebpackConfig: overrideFunction,
    },
  };
}

module.exports = {
  eslint: {
    mode: ESLINT_MODES.file,
  },
  plugins: [
    makeOverrideWebpackPlugin(withCustomScssLoader),
    makeOverrideWebpackPlugin(
      withFilterWarningsPluginForCssImportOrderConflict
    ),
    makeOverrideWebpackPlugin(appendLoaderOptionsIntoUseForSassRule),
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: Object.entries(styleVariables)
          .map(([name, value]) => [`@${name}`, value])
          .reduce((lessVars, [name, value]) => {
            lessVars[name] = value;
            return lessVars;
          }),
      }
    },
  ],
};
