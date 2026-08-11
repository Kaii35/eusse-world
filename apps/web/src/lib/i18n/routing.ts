import { defineRouting } from 'next-intl/routing'

/**
 * Enrutamiento por prefijo de ruta: /es/... y /en/... (ADR-0013).
 *
 * Cada idioma tiene su URL: indexable, cacheable, compartible y con `hreflang` natural.
 * Un subdominio complicaría certificados y cookies; una cookie sin cambiar la URL
 * rompería la caché de CDN y el SEO.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  // Siempre con prefijo, también en el idioma por defecto: una URL, un contenido.
  localePrefix: 'always',
})

export type AppLocale = (typeof routing.locales)[number]
