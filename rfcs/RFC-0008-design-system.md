# RFC-0008 — Design System y tokens

| Campo             | Valor                                                           |
| ----------------- | --------------------------------------------------------------- |
| **Estado**        | Aprobado · **Autor** Design System + UI · **Creado** 2026-08-06 |
| **Revisores**     | UX · Frontend · Accesibilidad · Performance · Arquitecto        |
| **ADR generados** | ADR-0010, ADR-0011                                              |
| **Bloque**        | A (A8, A9) · Sprint 0                                           |

---

## 1. Problema

Dos aplicaciones (`web` y `admin`) con usuarios, densidades y objetivos distintos deben
sentirse el mismo producto. Sin un sistema único y verificado, en seis meses habrá cuatro
botones primarios distintos y ningún modo oscuro que funcione (riesgo R-10).

Además, la landing debe alcanzar un nivel de ejecución alto (glassmorphism, movimiento,
dark mode) sin que eso se cuele en el back-office, donde sería ruido.

## 2. Objetivos y no-objetivos

**Objetivos:** tokens semánticos con par claro/oscuro · contraste AA verificado por test ·
primitivos accesibles sobre Radix · un solo sistema para ambas apps · Storybook como
catálogo · regresión visual.

**No-objetivos:** temas por cliente (multi-marca es F4) · librería pública ·
soporte RTL (preparado, no implementado).

## 3. Alternativas consideradas

| Alternativa                                                                                                     | Descarte                                                                                           |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A. Librería de componentes externa completa (MUI, Ant)                                                          | Estética ajena difícil de personalizar; bundle grande; se lucha contra ella                        |
| B. Todo a medida desde cero                                                                                     | Meses reimplementando accesibilidad ya resuelta                                                    |
| **C. Radix (comportamiento) + Tailwind v4 (estilo) + shadcn/ui como punto de partida, copiado a `packages/ui`** | **Elegida.** Accesibilidad resuelta, control total del estilo, sin dependencia de versiones ajenas |

## 4. Diseño

### 4.1 Tokens en tres capas

```
1. Primitivos    --blue-600, --gray-100 …          (sólo los usa la capa 2)
2. Semánticos    --color-primary, --color-danger … (los usan los componentes)
3. De componente --button-primary-bg …             (sólo donde el componente lo exija)
```

Un cambio de marca toca la capa 1. Los componentes no se enteran.

### 4.2 Familias de tokens

Color (superficie, contenido, marca, estado, borde) · Tipografía (familia, escala modular
1.25, pesos, números tabulares) · Espaciado (escala de 4 px) · Radio (`sm` `md` `lg` `xl`
`full`) · Sombra y elevación (5 niveles con su `z-index`) · Movimiento (`--motion-fast`
150 ms, `--motion-base` 250 ms, `--motion-slow` 450 ms + curvas) · Vidrio
(`--surface-glass-*` con fallback sólido).

### 4.3 Reglas duras

- **Todo token con par claro/oscuro.** Uno sin par no existe.
- **Todo par texto/fondo con contraste verificado por test.**
- **Cero valores arbitrarios en las apps**: `text-[#...]` y `p-[13px]` fallan el lint.
- **`z-index` sólo desde tokens.**
- **`@eusse/ui` no importa dominio, SDK ni contratos.**
- Un componente sube a `@eusse/ui` cuando **ya se usa en dos sitios** y es agnóstico del
  dominio.
- **Sin glassmorphism ni animaciones de entrada en `apps/admin`.**

### 4.4 Contenido de `@eusse/ui`

`primitives/` Button · Input · Textarea · Select · Checkbox · Radio · Switch · Dialog ·
Sheet · Popover · Tooltip · Tabs · Toast · Skeleton · Badge · Avatar · Separator

`patterns/` DataTable · FormField · EmptyState · ErrorState · PageHeader · StatCard ·
Pagination · Money

`motion/` FadeIn · SlideIn · ScrollReveal · Stagger

`hooks/` useMediaQuery · useTheme · useReducedMotion

### 4.5 API de componente

`forwardRef` · props del elemento nativo propagadas · `className` componible con `cn` ·
variantes con CVA tipadas · `asChild` con `Slot` donde tenga sentido · sin efectos
secundarios en el import (tree-shakeable).

### 4.6 Verificación

| Qué              | Cómo                                                 | Bloquea |
| ---------------- | ---------------------------------------------------- | ------- |
| Contraste        | Test sobre todos los pares de tokens, en ambos temas | Sí      |
| Accesibilidad    | Test de comportamiento + axe                         | Sí      |
| Regresión visual | Snapshots de Playwright en ambos temas               | Sí      |
| Valores mágicos  | Regla de ESLint                                      | Sí      |
| Bundle           | `size-limit` por paquete                             | Sí      |
| Documentación    | Story obligatoria por variante y estado              | Sí      |

## 5. Impacto

Base de toda la UI. Bloquea C, D, E, F, G, H. Un cambio rompedor requiere changeset con
guía de migración y actualización de ambos consumidores.

## 6. Riesgos

| Riesgo                                   | Prob. | Impacto | Mitigación                                                                       |
| ---------------------------------------- | ----- | ------- | -------------------------------------------------------------------------------- |
| Deriva del sistema (R-10)                | Alta  | Medio   | Lint contra valores arbitrarios + auditoría trimestral de duplicación entre apps |
| Modo oscuro que falla                    | Media | Medio   | Token sin par oscuro no compila; test de contraste en ambos temas                |
| Bundle inflado por Radix e iconos (R-11) | Media | Medio   | Imports granulares + `size-limit` + iconos uno a uno                             |
| Promoción prematura a `@eusse/ui`        | Media | Medio   | Regla de las dos apariciones                                                     |

## 7. Criterios de aceptación

```gherkin
Escenario: Contraste verificado en ambos temas
  Cuando se ejecuta la suite de tokens
  Entonces todo par texto/fondo alcanza al menos 4.5:1 en claro y en oscuro

Escenario: Valores arbitrarios bloqueados
  Dado un componente con la clase "text-[#1a2b3c]"
  Cuando se ejecuta pnpm lint
  Entonces el build falla

Escenario: El design system no conoce el dominio
  Cuando se analizan los imports de packages/ui
  Entonces ninguno proviene de @eusse/domain, @eusse/sdk ni @eusse/contracts

Escenario: Componente accesible por teclado
  Dado el componente Dialog
  Cuando se abre
  Entonces el foco entra en el diálogo, Escape lo cierra y el foco vuelve al disparador
```

## 8. Plan de implementación

A8 (tokens) y A9 (primitivos) del Bloque A. Ampliación continua durante C, D, E.

## 9. Preparación para fases futuras

**Hueco:** tokens en tres capas → multi-marca en F4 es sustituir la capa 1 · propiedades
lógicas de CSS (`margin-inline`) desde el día 1 → RTL posible sin refactor.
**No se construye:** temas por cliente, RTL activo, librería pública.

## 10. Preguntas abiertas

Ninguna bloqueante.

## 11. Enlaces

[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) ·
[`skills/design-system.md`](../skills/design-system.md) ·
[ADR-0010](../adrs/ADR-0010-tailwind-v4-tokens.md) · [ADR-0011](../adrs/ADR-0011-radix-shadcn.md)
