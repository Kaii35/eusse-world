import base from './base.js'
import boundaries from './boundaries.js'

/** Reglas para apps/api y apps/workers, con las fronteras hexagonales activas. */
export default [
  ...base,
  ...boundaries,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Los decoradores de Nest usan métodos vacíos y clases sin miembros
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['decoratedFunctions'] }],
      // Los controllers devuelven promesas que Nest resuelve
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { arguments: false, attributes: false } },
      ],
    },
  },
]
