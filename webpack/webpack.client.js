const path = require('path');
const { merge } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const dotenv = require('dotenv');
const sharedConfig = require('./webpack.shared');
const pkg = require('../package.json');

const config = { ...dotenv.config().parsed };

module.exports = (env) => {
  const isDev = !!env.dev;

  const devPlugins = [];
  if (isDev) {
    devPlugins.push(new ReactRefreshWebpackPlugin());
  }

  return merge(
    sharedConfig({
      babelOptions: {
        presets: [['@babel/preset-react', { runtime: 'automatic' }], 'patronum/babel-preset'],
        plugins: ['effector/babel-plugin'],
      },
    }),
    {
      name: 'client',
      target: 'web',
      mode: isDev ? 'development' : 'production',
      entry: path.resolve(__dirname, '../src/client/index'),
      output: {
        path: path.resolve(__dirname, '../dist/client'),
        publicPath: 'auto',
      },
      devServer: {
        port: config.PORT,
        hot: true,
      },
      plugins: [
        new ModuleFederationPlugin({
          name: config.APP_NAME,
          filename: 'remoteEntry.js',
          exposes: {
            './Content': path.resolve(__dirname, '../src/client/content'),
          },
          shared: {
            ...pkg.dependencies,
            react: {
              singleton: true,
              requiredVersion: pkg.dependencies['react'],
            },
            'react-dom': {
              singleton: true,
              requiredVersion: pkg.dependencies['react-dom'],
            },
            '@emotion/react': {
              singleton: true,
            },
            '@mantine/core': {
              singleton: true,
            },
            '@mantine/hooks': {
              singleton: true,
            },
            '@mantine/notifications': {
              singleton: true,
            },
          },
        }),
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, '../public/index.html'),
          templateParameters: {
            APP_TITLE: config.APP_NAME.split('_').join(' '),
          },
          chunks: ['main'],
        }),
        new DefinePlugin({
          'process.env': JSON.stringify({ ...config }),
          __DEV__: isDev,
        }),
        ...devPlugins,
      ],
    },
  );
};
