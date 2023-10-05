module.exports = {
  root: true,
  extends: ['@iszf-microfrontends/eslint-config', 'plugin:effector/recommended', 'plugin:effector/scope'],
  plugins: ['react-refresh', 'effector'],
  ignorePatterns: ['webpack'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'effector/no-watch': 'off',
  },
};
