const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const { dependencies: deps } = require('./package.json');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const resolveRoot = (...segments) => path.resolve(__dirname, ...segments);

const defaultEnvFile = dotenv.config();

module.exports = (env) => {
  const isDev = !!env.dev;

  const modeEnvFile = dotenv.config({
    path: resolveRoot(`.env.${isDev ? 'dev' : 'prod'}`),
  });
  const parsedEnv = { ...defaultEnvFile.parsed, ...modeEnvFile.parsed };

  const babelOptions = {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-runtime', '@emotion', isDev && 'react-refresh/babel', 'effector/babel-plugin'].filter(Boolean),
  };

  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev && 'inline-source-map',
    output: {
      clean: true,
    },
    devServer: {
      static: {
        directory: resolveRoot('dist'),
      },
      historyApiFallback: true,
      port: parsedEnv.PORT,
      onListening: (devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        try {
          const body = JSON.stringify({
            name: parsedEnv.NAME,
            url: `${parsedEnv.DOMAIN}:${parsedEnv.PORT}`,
            component: parsedEnv.COMPONENT,
          }).replace(/"/g, '\\"');
          execSync(
            `curl -X POST -H "Content-Type: application/json" -d "${body}" ${parsedEnv.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/start`,
          );
        } catch (error) {
          console.error('Error starting microfrontend:', error);
        }

        devServer.server.on('close', () => {
          try {
            execSync(
              `curl -X GET -H "Content-Type: application/json" ${parsedEnv.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/close?name=${parsedEnv.NAME}`,
            );
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
            },
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: parsedEnv.NAME,
        filename: 'remoteEntry.js',
        exposes: {
          [`./${parsedEnv.COMPONENT}`]: resolveRoot('src/remote-entry.ts'),
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
        template: resolveRoot('public/index.html'),
      }),
      isDev && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '~': resolveRoot('src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};
