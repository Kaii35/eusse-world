import react from './react.js'

/**
 * Reglas para apps Next.js.
 * Añade: prohibición de valores mágicos de Tailwind (riesgo R-10) y
 * fronteras entre features (docs/07-module-dependencies.md §3).
 */
export default [
  ...react,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Sin enums de TS. Usa `as const` + type.',
        },
        {
          // bg-[#1a2b3c], p-[13px], text-[14px]… todo valor arbitrario de Tailwind.
          //
          // El selector se construye por concatenación a propósito: escrito como
          // literal, Prettier normaliza las comillas y se lleva por delante los
          // escapes (`\\b` acaba siendo un retroceso literal), dejando un selector
          // inválido que ESLint ignora en silencio. La regla parecía activa y no
          // protegía nada.
          selector:
            'Literal[value=/' +
            String.raw`\b(?:bg|text|border|p|m|w|h|gap|rounded|shadow|z|size|leading|tracking)-\[` +
            '/]',
          message:
            'Sin valores mágicos de Tailwind. Usa un token de @eusse/tokens. Si falta, pídelo al Design System (ADR-0010).',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*', '!@/features/*/index'],
              message:
                'Un feature no importa de otro. Sube lo común a components/, lib/ o a un paquete. Ver docs/07-module-dependencies.md §3.',
            },
            {
              group: ['@eusse/domain/*'],
              message: 'Importa desde la raíz del paquete: @eusse/domain.',
            },
          ],
          paths: [
            {
              name: 'zod',
              importNames: ['z'],
              message:
                'Los esquemas viven en @eusse/contracts, no se declaran en la app. Ver ADR-0009.',
            },
          ],
        },
      ],
    },
  },
  {
    // Los contratos y la config sí pueden usar Zod directamente
    files: ['src/lib/env.ts', 'src/**/*.contract.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]
