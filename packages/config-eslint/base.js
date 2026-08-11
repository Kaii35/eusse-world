import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

/**
 * Base compartida por todo el workspace.
 * Las reglas marcadas como `error` NO son negociables: rompen el build.
 * Ver docs/03-conventions.md y docs/04-standards.md §5.
 */
export default tseslint.config(
  { ignores: ['dist/**', '.next/**', '.turbo/**', 'coverage/**', 'node_modules/**'] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: true },
    },
    plugins: { import: importPlugin },
    rules: {
      // --- Prohibiciones absolutas (docs/03-conventions.md §4) ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 20 },
      ],

      // Sin enums de TypeScript: usar `as const`
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Sin enums de TS. Usa `as const` + type. Ver docs/03-conventions.md §4.',
        },
      ],

      // --- Tipos e imports ---
      // `type`, no `interface`: docs/03-conventions.md §4 y §8 (props con `type`).
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // Los números en plantillas de texto son el caso normal en mensajes de error.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: false, allowNullish: false, allowAny: false },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // --- Calidad ---
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // TODO sin dueño e issue es un error (docs/03-conventions.md §13)
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'start' }],

      // --- Orden de imports (docs/03-conventions.md §7) ---
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [{ pattern: '@eusse/**', group: 'internal', position: 'before' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-cycle': ['error', { maxDepth: Infinity }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
    },
  },

  // Los archivos de configuración quedan fuera del proyecto de TypeScript:
  // se lintan sin reglas que requieran información de tipos.
  {
    files: ['**/*.config.{js,ts,mjs,cjs}', '**/eslint.config.js', '**/*.setup.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // Los tests pueden relajar algunas reglas de tipado
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e.ts', '**/test/**', '**/e2e/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // Los scripts del repo pueden usar console
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },

  prettier,
)
