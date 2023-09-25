const { DefinePlugin } = require('webpack');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const dotenv = require('dotenv');
const { resolveRoot, singletonDeps } = require('./utils');
const sharedConfig = require('./webpack.shared');
const pkg = require('../package.json');

const config = { ...dotenv.config().parsed };

const sharedClientConfig = (env, options) => {
  const babelOptions = merge(
    {
      presets: [['@babel/preset-react', { runtime: 'automatic' }], 'patronum/babel-preset'],
      plugins: ['effector/babel-plugin'],
    },
    options?.babelOptions ?? {},
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
          ...pkg.dependencies,
          ...singletonDeps(
            pkg.dependencies,
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
        minify: true,
      }),
      new DefinePlugin({
        'process.env': JSON.stringify({ ...config, IS_DEV: !!env.dev }),
      }),
    ],
    resolve: {
      alias: {
        '~client': resolveRoot('src/client'),
      },
    },
  });
};

const devClientConfig = (env) => {
  return merge(sharedClientConfig(env, { babelOptions: { plugins: ['react-refresh/babel'] } }), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      port: config.PORT,
      hot: true,
      liveReload: false,
    },
    plugins: [new ReactRefreshWebpackPlugin()],
  });
};

const prodClientConfig = (env) => {
  return merge(sharedClientConfig(env), {
    mode: 'production',
    devtool: 'source-map',
  });
};

module.exports = (env) => {
  const isDev = !!env.dev;
  if (isDev) {
    return devClientConfig(env);
  }
  return prodClientConfig(env);
};
