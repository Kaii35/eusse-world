# @eusse/tokens

Tokens de diseño de Eusse World. **Fuente única de verdad del sistema visual.**

## Cuándo usarlo

Siempre que necesites un color, un espacio, un radio, una sombra o una duración.

## Cuándo NO usarlo

Nunca escribas un valor visual a mano. Si falta un token, **se añade aquí**; no se inventa
en el componente. El lint bloquea `bg-[#1a2b3c]` y `p-[13px]` (ADR-0010).

## Uso

```css
/* apps/web/src/styles/globals.css */
@import '@eusse/tokens/theme.css';
```

```tsx
import { motion, breakpoints } from '@eusse/tokens'
```

## Arquitectura de tres capas (RFC-0008 §4.1)

```
1. Primitivos    --eusse-brand-600      ← cambiar de marca toca SÓLO esta capa
2. Semánticos    --color-primary        ← los que usan los componentes
3. De componente --surface-glass-bg     ← sólo donde el componente lo exija
```

Un componente **nunca** nombra un color literal. `bg-primary`, jamás `bg-blue-600`.

## Reglas verificadas por test

`src/contrast.spec.ts` es una **puerta de CI**:

- Todo par texto/fondo alcanza WCAG 2.2 AA (4.5:1) **en ambos temas**.
- Todo elemento de UI y el anillo de foco alcanzan 3:1.
- **Todo token de color tiene par claro/oscuro.** Uno sin par rompe el build.

Añadir un token de color obliga a añadir su par en `.dark` y su entrada en `TEXT_PAIRS`
o `UI_PAIRS`.

## Modo oscuro

Por **clase** (`.dark`), no por media query: el usuario elige. Nativo, no invertido — sin
negro puro. En oscuro las sombras dejan de funcionar: la elevación se comunica con
luminosidad.

## Glassmorphism

`--surface-glass-*` con **fallback sólido obligatorio**. Máximo dos capas superpuestas.
**Prohibido en `apps/admin`.** Ver [docs/12-ux-guidelines.md](../../docs/12-ux-guidelines.md) §3.
