# @eusse/config-eslint

Configuraciones de ESLint compartidas (flat config, ESLint 9).

| Preset       | Para                       | Añade                                                                                |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------ |
| `base`       | Todo el workspace          | `any` prohibido, orden de imports, sin ciclos, sin `console`, TODO sin issue = error |
| `react`      | Paquetes y apps con JSX    | react-hooks, jsx-a11y estricto, **cero literales de texto en JSX**                   |
| `next`       | `apps/web`, `apps/admin`   | **cero valores mágicos de Tailwind**, features aislados                              |
| `nest`       | `apps/api`, `apps/workers` | **fronteras hexagonales verificadas**                                                |
| `boundaries` | (incluido en `nest`)       | La regla que impide que el monolito modular degenere                                 |

## Uso

```js
// apps/web/eslint.config.js
import next from '@eusse/config-eslint/next'
export default next
```

## Las cuatro reglas que más se van a encontrar

| Regla                           | Por qué existe                                                             |
| ------------------------------- | -------------------------------------------------------------------------- |
| `no-explicit-any`               | Ver [docs/03-conventions.md](../../docs/03-conventions.md) §4              |
| `react/jsx-no-literals`         | Deuda de i18n: riesgo [R-12](../../docs/08-technical-risks.md)             |
| Valores arbitrarios de Tailwind | Deriva del design system: riesgo [R-10](../../docs/08-technical-risks.md)  |
| `boundaries/element-types`      | Degeneración del monolito: riesgo [R-05](../../docs/08-technical-risks.md) |

Ninguna se desactiva sin ADR.
