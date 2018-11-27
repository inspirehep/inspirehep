const { ESLINT_MODES } = require('@craco/craco');
const path = require('path');
const SassRuleRewirer = require('react-app-rewire-sass-rule');
const LessPlugin = require('craco-less');
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

function makeOverrideWebpackPlugin(overrideFunction) {
  return {
    plugin: {
      overrideWebpackConfig: overrideFunction,
    },
  };
}

module.exports = {
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    ],
  },
  eslint: {
    mode: ESLINT_MODES.file,
  },
  plugins: [
    makeOverrideWebpackPlugin(withCustomScssLoader),
    makeOverrideWebpackPlugin(
      withFilterWarningsPluginForCssImportOrderConflict
    ),
    {
      plugin: LessPlugin,
      options: {
        lessLoaderOptions: {
          javascriptEnabled: true,
          modifyVars: Object.entries(styleVariables)
            .map(([name, value]) => [`@${name}`, value])
            .reduce((lessVars, [name, value]) => {
              lessVars[name] = value;
              return lessVars;
            }),
        },
      },
    },
  ],
};
