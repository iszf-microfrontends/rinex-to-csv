const { merge } = require('webpack-merge');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (options) => {
  const babelOptions = merge(
    {
      presets: ['@babel/preset-typescript'],
    },
    options?.babelOptions || {},
  );

  return {
    output: {
      filename: 'index.js',
      clean: true,
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
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      plugins: [new TsconfigPathsPlugin()],
    },
  };
};
