import boundaries from 'eslint-plugin-boundaries'

/**
 * Fronteras de arquitectura de `apps/api`.
 *
 * Esta es la regla que impide que el monolito modular degenere en monolito (riesgo R-05).
 * NO es una convención: es una puerta de CI. Ver docs/07-module-dependencies.md.
 *
 *   interface → application → domain
 *   infrastructure → domain
 *   domain → (nada)
 *
 * Y entre módulos: sólo se importa `public/`.
 */
export default [
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'shared-kernel', pattern: 'src/shared-kernel/**' },
        { type: 'common', pattern: 'src/common/**' },
        { type: 'config', pattern: 'src/config/**' },
        {
          type: 'module-public',
          pattern: 'src/modules/*/public/**',
          capture: ['moduleName'],
        },
        {
          type: 'module-domain',
          pattern: 'src/modules/*/domain/**',
          capture: ['moduleName'],
        },
        {
          type: 'module-application',
          pattern: 'src/modules/*/application/**',
          capture: ['moduleName'],
        },
        {
          type: 'module-infrastructure',
          pattern: 'src/modules/*/infrastructure/**',
          capture: ['moduleName'],
        },
        {
          type: 'module-interface',
          pattern: 'src/modules/*/interface/**',
          capture: ['moduleName'],
        },
        { type: 'module-root', pattern: 'src/modules/*/*.module.ts', capture: ['moduleName'] },
      ],
    },
    rules: {
      'boundaries/no-unknown-files': 'off',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message:
            '${file.type} no puede importar ${dependency.type}. Ver docs/07-module-dependencies.md',
          rules: [
            // --- DOMINIO: no depende de nadie salvo de sí mismo y del shared-kernel ---
            {
              from: ['module-domain'],
              allow: [['module-domain', { moduleName: '${from.moduleName}' }], 'shared-kernel'],
              message:
                'domain/ no importa NestJS, Prisma, otro módulo ni capas externas. Es TypeScript puro.',
            },

            // --- APLICACIÓN: su dominio + shared-kernel + public de otros módulos ---
            {
              from: ['module-application'],
              allow: [
                ['module-domain', { moduleName: '${from.moduleName}' }],
                ['module-application', { moduleName: '${from.moduleName}' }],
                'shared-kernel',
                'common',
                'module-public',
              ],
              message:
                'application/ sólo usa su dominio, el shared-kernel y el public/ de otros módulos.',
            },

            // --- INFRAESTRUCTURA: su dominio (implementa sus puertos) ---
            {
              from: ['module-infrastructure'],
              allow: [
                ['module-domain', { moduleName: '${from.moduleName}' }],
                ['module-infrastructure', { moduleName: '${from.moduleName}' }],
                'shared-kernel',
                'common',
                'config',
              ],
              message: 'infrastructure/ implementa los puertos de SU dominio. Nada más.',
            },

            // --- INTERFAZ: su aplicación. Nunca el dominio de otro módulo ---
            {
              from: ['module-interface'],
              allow: [
                ['module-application', { moduleName: '${from.moduleName}' }],
                ['module-domain', { moduleName: '${from.moduleName}' }],
                ['module-interface', { moduleName: '${from.moduleName}' }],
                'shared-kernel',
                'common',
                'config',
              ],
              message: 'interface/ delega en su application/. No conoce otros módulos.',
            },

            // --- PUBLIC: la fachada. Expone DTOs, se apoya en su aplicación ---
            {
              from: ['module-public'],
              allow: [
                ['module-application', { moduleName: '${from.moduleName}' }],
                ['module-domain', { moduleName: '${from.moduleName}' }],
                'shared-kernel',
              ],
            },

            // --- MODULE ROOT: cablea todo lo suyo ---
            {
              from: ['module-root'],
              allow: [
                ['module-domain', { moduleName: '${from.moduleName}' }],
                ['module-application', { moduleName: '${from.moduleName}' }],
                ['module-infrastructure', { moduleName: '${from.moduleName}' }],
                ['module-interface', { moduleName: '${from.moduleName}' }],
                ['module-public', { moduleName: '${from.moduleName}' }],
                'shared-kernel',
                'common',
                'config',
              ],
            },

            // --- SHARED KERNEL y COMMON ---
            { from: ['shared-kernel'], allow: ['shared-kernel'] },
            { from: ['common'], allow: ['common', 'shared-kernel', 'config'] },
            { from: ['config'], allow: ['config'] },
          ],
        },
      ],

      // Refuerzo explícito: el dominio no ve el framework ni el ORM
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['module-domain'],
              disallow: ['@nestjs/*', '@prisma/client', 'prisma', 'bullmq', 'ioredis', 'express'],
              message:
                'domain/ no importa framework ni infraestructura ({{ dependency.source }}). Ver ADR-0002.',
            },
            {
              from: ['module-application'],
              disallow: ['@prisma/client', 'prisma'],
              message:
                'Prisma sólo en infrastructure/persistence/. Ver docs/01-architecture.md §2.2.',
            },
          ],
        },
      ],
    },
  },
]
