const dotenv = require('dotenv');
const path = require('path');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { dependencies: deps } = require('./package.json');

const envConfig = { ...dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed };

module.exports = () => {
  const isDev = process.env.NODE_ENV === 'development';

  const babelOptions = {
    plugins: [isDev && require.resolve('react-refresh/babel')].filter(Boolean),
    presets: [['@babel/preset-react', { runtime: 'automatic' }], '@babel/preset-typescript'],
  };

  const devPlugins = [];
  if (isDev) {
    devPlugins.push(
      new ReactRefreshWebpackPlugin({
        exclude: [/node_modules/, /bootstrap\.tsx$/],
      }),
    );
  }

  return {
    target: 'web',
    entry: './src/index',
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'inline-source-map' : 'source-map',
    devServer: {
      hot: true,
      static: path.join(__dirname, 'dist'),
      port: envConfig.PORT,
      liveReload: false,
    },
    output: {
      publicPath: 'auto',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: babelOptions,
            },
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: envConfig.APP_NAME,
        filename: 'remoteEntry.js',
        exposes: {
          './Content': './src/content',
        },
        shared: {
          ...deps,
          react: {
            singleton: true,
            requiredVersion: deps['react'],
          },
          'react-dom': {
            singleton: true,
            requiredVersion: deps['react-dom'],
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        templateParameters: {
          title: envConfig.APP_NAME,
        },
        chunks: ['main'],
      }),
      new DefinePlugin({
        'process.env': JSON.stringify(envConfig),
        __DEV__: isDev,
      }),
      ...devPlugins,
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      plugins: [new TsconfigPathsPlugin()],
    },
  };
};
