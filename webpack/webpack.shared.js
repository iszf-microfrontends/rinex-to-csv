const { merge } = require('webpack-merge');

module.exports = (options = {}) => {
  const babelOptions = merge(
    {
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
      plugins: ['@babel/plugin-transform-runtime'],
    },
    options.babelOptions ?? {},
  );

  return {
    output: {
      publicPath: 'auto',
      clean: true,
      filename: 'index.js',
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
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
  };
};
