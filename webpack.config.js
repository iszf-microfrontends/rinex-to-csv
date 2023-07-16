const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const dotenv = require('dotenv');
const { dependencies } = require('./package.json');
const { resolveRoot } = require('./server/utils');

const envFile = dotenv.config();
const parsedEnv = { ...envFile.parsed };

module.exports = (env) => {
  const isDev = !!env.dev;

  const babelOptions = {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-runtime', '@emotion', isDev && 'react-refresh/babel', 'effector/babel-plugin'].filter(Boolean),
  };

  const devPlugins = [];
  if (isDev) {
    devPlugins.push(new ReactRefreshWebpackPlugin());
  }

  const { PORT, MICROFRONTEND_NAME, MODULE_FEDERATION_SCOPE, MAIN_EXPOSED_COMPONENT } = parsedEnv;

  return {
    entry: resolveRoot('src/index'),
    mode: isDev ? 'development' : 'production',
    devtool: isDev && 'inline-source-map',
    output: {
      publicPath: 'auto',
      clean: true,
    },
    devServer: {
      port: PORT,
      static: resolveRoot('dist'),
      hot: true,
      liveReload: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: babelOptions,
            },
          ],
        },
        {
          test: /\.(ts|tsx)?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => ({
                  before: [isDev && ReactRefreshTypeScript()].filter(Boolean),
                }),
                transpileOnly: isDev,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: MICROFRONTEND_NAME,
        library: { type: 'var', name: MODULE_FEDERATION_SCOPE },
        filename: 'remoteEntry.js',
        exposes: {
          [`./${MAIN_EXPOSED_COMPONENT}`]: resolveRoot('src/remote-entry.ts'),
        },
        shared: {
          ...dependencies,
          ...singletonDeps(
            'react',
            'react-dom',
            '@emotion/react',
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            'effector',
            'effector-react',
          ),
        },
      }),
      new HtmlWebpackPlugin({
        template: resolveRoot('public/index.html'),
        chunks: ['main'],
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(parsedEnv),
      }),
      ...devPlugins,
    ].filter(Boolean),
    resolve: {
      alias: {
        '~': resolveRoot('src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};

function singletonDeps(...deps) {
  return deps.reduce((depsObj, dep) => {
    depsObj[dep] = {
      singleton: true,
      requiredVersion: dependencies[dep],
    };
    return depsObj;
  }, {});
}
