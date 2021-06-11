const path = require('path');

module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    tsconfigRootDir: path.resolve(__dirname),
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-async-promise-executor': 0,
    'no-prototype-builtins': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
  globals: {
    NodeJS: false,
    DEVELOPMENT: false,
    nodeRequire: false,
  },
};
