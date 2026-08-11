/**
 * Configuración de PostCSS compartida por apps/web y apps/admin.
 *
 * Tailwind v4 es CSS-first: no hay `tailwind.config.js`. Los tokens se definen con
 * `@theme` en @eusse/tokens y se importan desde el CSS de cada app (ADR-0010).
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
