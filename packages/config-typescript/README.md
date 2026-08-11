# @eusse/config-typescript

Configuraciones de TypeScript compartidas. Heredadas por todo el workspace.

| Preset               | Para                                                        |
| -------------------- | ----------------------------------------------------------- |
| `base.json`          | Base de todo. `strict` y comprobaciones estrictas activadas |
| `library.json`       | Paquetes que compilan a `dist/`                             |
| `react-library.json` | Paquetes con JSX (`@eusse/ui`)                              |
| `next.json`          | `apps/web`, `apps/admin`                                    |
| `nest.json`          | `apps/api`, `apps/workers` (decoradores, CommonJS)          |

## Uso

```json
{ "extends": "@eusse/config-typescript/next.json" }
```

## Reglas heredadas

`strict` · `noUncheckedIndexedAccess` · `exactOptionalPropertyTypes` ·
`verbatimModuleSyntax` · `isolatedModules`. Ver [docs/03-conventions.md](../../docs/03-conventions.md) §4.

**`any` está prohibido por lint, no por tsconfig.** Ver `@eusse/config-eslint`.
