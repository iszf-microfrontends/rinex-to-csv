const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const dotenv = require('dotenv');
const { resolveRoot } = require('./utils');
const sharedConfig = require('./webpack.shared');
const { dependencies } = require('../package.json');

const config = { ...dotenv.config().parsed };

const sharedClientConfig = (options = {}) => {
  const babelOptions = merge(
    {
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
      plugins: ['@emotion', 'effector/babel-plugin'],
    },
    options.babelOptions ?? {},
  );

  return merge(sharedConfig({ babelOptions }), {
    name: 'client',
    target: 'web',
    entry: resolveRoot('src/client/index'),
    output: {
      path: resolveRoot('dist/client'),
    },
    plugins: [
      new ModuleFederationPlugin({
        name: config.MICROFRONTEND_NAME,
        library: { type: 'var', name: config.MODULE_FEDERATION_SCOPE },
        filename: 'remoteEntry.js',
        exposes: {
          [`./${config.MAIN_EXPOSED_COMPONENT}`]: resolveRoot('src/client/remote-entry.ts'),
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
      new DefinePlugin({
        'process.env': JSON.stringify(config),
      }),
    ],
    resolve: {
      alias: {
        '@client': resolveRoot('src/client'),
      },
    },
  });
};

const devClientConfig = merge(sharedClientConfig({ babelOptions: { plugins: ['react-refresh/babel'] } }), {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    port: config.PORT,
    static: resolveRoot('dist/client'),
    hot: true,
    liveReload: false,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
});

const prodClientConfig = merge(sharedClientConfig(), {
  mode: 'production',
  devtool: false,
});

module.exports = (env) => {
  const isDev = !!env.dev;
  if (isDev) {
    return devClientConfig;
  }
  return prodClientConfig;
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
