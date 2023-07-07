const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const path = require('path');
const dotenv = require('dotenv');
const { dependencies } = require('./package.json');
const { execSync } = require('child_process');

const defaultEnvFile = dotenv.config();

module.exports = (env) => {
  const isDev = !!env.dev;

  const modeEnvFile = dotenv.config({ path: resolveRoot(`.env.${isDev ? 'dev' : 'prod'}`) });
  const parsedEnv = { ...defaultEnvFile.parsed, ...modeEnvFile.parsed };

  const babelOptions = {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-runtime', '@emotion', isDev && 'react-refresh/babel', 'effector/babel-plugin'].filter(Boolean),
  };

  const devPlugins = [];
  if (isDev) {
    devPlugins.push(new ReactRefreshWebpackPlugin());
  }

  return {
    entry: resolveRoot('src/index'),
    mode: isDev ? 'development' : 'production',
    devtool: isDev && 'inline-source-map',
    output: {
      publicPath: 'auto',
      clean: true,
    },
    devServer: {
      port: parsedEnv.PORT,
      static: resolveRoot('dist'),
      hot: true,
      liveReload: false,
      onListening: (devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        let failedStart = false;
        try {
          const body = JSON.stringify({
            name: parsedEnv.MICROFRONTEND_NAME,
            url: `${parsedEnv.DOMAIN}:${parsedEnv.PORT}`,
            scope: parsedEnv.MODULE_FEDERATION_SCOPE,
            component: parsedEnv.MAIN_EXPOSED_COMPONENT,
            backendName: parsedEnv.BACKEND_NAME,
          }).replace(/"/g, '\\"');
          execSync(
            `curl -X POST -H "Content-Type: application/json" -d "${body}" ${parsedEnv.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/start`,
          );
        } catch (error) {
          failedStart = true;
          console.error('Error starting microfrontend:', error);
        }

        devServer.server.on('close', () => {
          try {
            if (!failedStart) {
              execSync(
                `curl -X GET -H "Content-Type: application/json" ${parsedEnv.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/close?name=${parsedEnv.MICROFRONTEND_NAME}`,
              );
            }
          } catch (error) {
            console.error('Error closing microfrontend:', error);
          }
        });
      },
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
        name: parsedEnv.MICROFRONTEND_NAME,
        library: { type: 'var', name: parsedEnv.MODULE_FEDERATION_SCOPE },
        filename: 'remoteEntry.js',
        exposes: {
          [`./${parsedEnv.MAIN_EXPOSED_COMPONENT}`]: resolveRoot('src/remote-entry.ts'),
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

function resolveRoot(...segments) {
  return path.resolve(__dirname, ...segments);
}

function singletonDeps(...deps) {
  return deps.reduce((depsObj, dep) => {
    depsObj[dep] = {
      singleton: true,
      requiredVersion: dependencies[dep],
    };
    return depsObj;
  }, {});
}
