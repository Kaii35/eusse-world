# @eusse/config-tailwind

Configuración de PostCSS compartida por las apps Next.js.

## Cuándo usarlo

En `apps/web` y `apps/admin`:

```js
// postcss.config.js
export { default } from '@eusse/config-tailwind/postcss'
```

```css
/* src/styles/globals.css */
@import '@eusse/tokens/theme.css';
```

## Cuándo NO usarlo

**No añadas aquí valores de diseño.** Tailwind v4 es CSS-first: no existe
`tailwind.config.js`. Los colores, espacios, radios y sombras viven en `@theme` dentro de
[`@eusse/tokens`](../tokens/README.md), que es la única fuente de verdad ([ADR-0010](../../adrs/ADR-0010-tailwind-v4-tokens.md)).

Este paquete existe sólo para que las dos apps compartan el pipeline de PostCSS y no
diverjan.
