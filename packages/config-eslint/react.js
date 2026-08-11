import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

import base from './base.js'

/** Reglas para cualquier paquete o app con JSX. */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.strict.rules,

      // --- Convenciones (docs/03-conventions.md §8) ---
      'react/prop-types': 'off',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/no-array-index-key': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/function-component-definition': [
        'error',
        { namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
      ],

      // --- i18n: cero literales de texto en JSX (riesgo R-12) ---
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          allowedStrings: ['·', '—', '/', '×', '+', '-'],
          ignoreProps: true,
        },
      ],

      // --- Accesibilidad: no negociable ---
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
    },
  },
  {
    files: ['**/*.stories.tsx', '**/*.spec.tsx', '**/*.test.tsx'],
    rules: { 'react/jsx-no-literals': 'off' },
  },
]
