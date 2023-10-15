module.exports = {
  root: true,
  extends: ['@iszf-microfrontends/eslint-config', 'plugin:effector/recommended', 'plugin:effector/react', 'plugin:effector/scope'],
  plugins: ['react-refresh', 'effector'],
  ignorePatterns: ['dist', 'webpack.config.js', '.eslintrc.js'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
