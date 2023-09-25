module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['dist', 'webpack', '.eslintrc.cjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:effector/react',
    'plugin:prettier/recommended',
  ],
  plugins: ['react-refresh', '@typescript-eslint', 'simple-import-sort', 'effector'],
  rules: {
    'react-refresh/only-export-components': 'warn',

    'react/react-in-jsx-scope': 'off',

    'import/no-named-as-default-member': 'off',
    'import/export': 'off',
    'import/no-named-as-default': 'off',

    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^react'],
          ['^effector'],
          ['^@mantine'],
          ['^@?\\w'],
          ['^@client'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^.+\\.?(css|scss)$'],
        ],
      },
    ],

    '@typescript-eslint/no-explicit-any': 'off',

    'no-console': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
