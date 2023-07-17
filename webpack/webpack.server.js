const { merge } = require('webpack-merge');
const DotenvWebpackPlugin = require('dotenv-webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { resolveRoot } = require('./utils');
const sharedConfig = require('./webpack.shared');

module.exports = merge(sharedConfig(), {
  name: 'server',
  target: 'node',
  entry: resolveRoot('src/server/index'),
  mode: 'production',
  devtool: false,
  output: {
    path: resolveRoot('dist/server'),
  },
  plugins: [new DotenvWebpackPlugin(), new NodePolyfillPlugin()],
});
