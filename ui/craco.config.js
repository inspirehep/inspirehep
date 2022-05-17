const { ESLINT_MODES } = require('@craco/craco');
const CracoLessPlugin = require('craco-less');
const CracoAntDesignPlugin = require('craco-antd');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

const styleVariables = require('./src/styleVariables');

function withFilterWarningsPluginForCssImportOrderConflict({ webpackConfig }) {
  const filterOrderConflictWarnings = new FilterWarningsPlugin({
    exclude: /Conflicting order between:/,
  });
  webpackConfig.plugins.push(filterOrderConflictWarnings);
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
  plugins: [
    makeOverrideWebpackPlugin(
      withFilterWarningsPluginForCssImportOrderConflict
    ),
    makeOverrideWebpackPlugin(withMomentTimezoneDataPlugin),
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: styleVariables,
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: CracoAntDesignPlugin,
    },
  ],
};
