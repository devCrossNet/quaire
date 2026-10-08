import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['**/.github/**', '**/coverage/**', '**/dist/**', '**/node_modules/**', 'commitlint.config.mjs'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
      ],
      '@typescript-eslint/no-require-imports': 0,
      'no-async-promise-executor': 0,
      'no-prototype-builtins': 0,
    },
  },
);
