const { ESLINT_MODES } = require('@craco/craco');
const path = require('path');
const SassRuleRewirer = require('react-app-rewire-sass-rule');
const CracoAntDesignPlugin = require('craco-antd');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

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
      sassOptions: {
        includePaths: [path.resolve(__dirname, './src')],
      },
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
    rule => rule.test && rule.test.toString().includes('scss|sass')
  );
  sassRule.use = [...(sassRule.use || []), ...(sassRule.loader || [])];
  delete sassRule.loader;
  return webpackConfig;
}

function withMomentTimezoneDataPlugin({ webpackConfig }) {
  const reduceMomentTimezoneData = new MomentTimezoneDataPlugin({
    startYear: 2020,
  });
  webpackConfig.plugins.push(reduceMomentTimezoneData);
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
  // HACK: until https://github.com/DocSpring/craco-antd/issues/24 is fixed
  // properly, current fix causes other problems https://github.com/DocSpring/craco-antd/pull/31#issuecomment-700829934
  jest: {
    configure(config) {
      config.transformIgnorePatterns = ['/node_modules/(?!antd|rc-*)/.+\\.js$'];
      return config;
    },
  },
  plugins: [
    makeOverrideWebpackPlugin(withCustomScssLoader),
    makeOverrideWebpackPlugin(
      withFilterWarningsPluginForCssImportOrderConflict
    ),
    makeOverrideWebpackPlugin(withMomentTimezoneDataPlugin),
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
      },
    },
  ],
};
