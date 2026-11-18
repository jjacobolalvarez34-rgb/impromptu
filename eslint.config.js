import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      'graphify-out/**',
      'playwright-report/**',
      'test-results/**',
      // Compilados de las apps (instalador, copia de la web y proyecto de Android).
      'apps/desktop/release/**',
      'apps/desktop/modelos/**',
      'apps/mobile/build/**',
      'apps/mobile/app/**',
      'apps/mobile/.gradle/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    // Los scripts de la terminal sí pueden escribir en consola.
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
);
