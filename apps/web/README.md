# apps/web

Landing, catálogo, carrito, checkout, autenticación y portal de cliente. Next.js App Router, puerto 3000.

```bash
pnpm --filter @eusse/web dev      # http://localhost:3000 → /es · /en
pnpm --filter @eusse/web build
```

## Estructura

```
src/
├── app/[locale]/
│   ├── layout.tsx · error.tsx · loading.tsx · not-found.tsx
│   └── (marketing)/page.tsx           landing
├── components/marketing/landing/      secciones, movimiento (motion.ts) y globo 3D (globe.ts)
├── lib/i18n/                          rutas y navegación con locale
└── styles/globals.css                 sólo importa @eusse/tokens
messages/                              es.json · en.json — todo texto visible
public/landing/                        logo original, isotipo transparente y máscara del globo
```

## Landing

- Server Components; islas de cliente: `LandingRoot` (movimiento, planificador de ruta), `QuoteForm` (envío), `LanguageSwitcher`, `ThemeSwitcher` y `MobileNav`.
- Las islas importan sólo `islands.module.css`: un CSS Module importado en el cliente envía el mapa de todas sus clases al navegador.
- Colores desde los tokens `--landing-*` de `@eusse/tokens`, con contraste verificado por test.
- three.js se carga diferido ([ADR-0021](../../adrs/ADR-0021-threejs-landing-globe.md)): JS inicial ≈ 112 KB.
- Globo del planificador con cobe, diferido y con el diagrama SVG como respaldo ([ADR-0022](../../adrs/ADR-0022-cobe-route-planner-globe.md)).
- Perchero de prendas (Personal Shopper) en `components/marketing/landing/rail`, adaptado del prompt `prompts/shirts.md`: carga diferida y lista estática de respaldo sin JS.
- Diseño de origen: [`docs/design/prototypes`](../../docs/design/prototypes/README.md).

Ver [apps/](../README.md) para el contexto completo.
