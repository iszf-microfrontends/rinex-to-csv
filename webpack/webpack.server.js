const DotenvWebpackPlugin = require('dotenv-webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { merge } = require('webpack-merge');
const { resolveRoot } = require('./utils');
const sharedConfig = require('./webpack.shared');

module.exports = merge(sharedConfig(), {
  name: 'server',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  entry: resolveRoot('src/server/index'),
  output: {
    path: resolveRoot('dist/server'),
  },
  plugins: [new NodePolyfillPlugin(), new DotenvWebpackPlugin()],
  resolve: {
    alias: {
      '@server': resolveRoot('src/server'),
    },
  },
});
