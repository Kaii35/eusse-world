import { join } from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const config: NextConfig = {
  reactStrictMode: true,
  // El monorepo tiene varios lockfiles potenciales; se fija la raíz explícitamente.
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  poweredByHeader: false,
  // Los paquetes internos se publican como fuente TypeScript: Next los compila.
  // Evita un paso de build intermedio y conserva las directivas "use client".
  transpilePackages: ['@eusse/ui', '@eusse/tokens', '@eusse/contracts', '@eusse/domain'],
  experimental: { typedRoutes: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Rutas privadas: nunca cacheables, nunca indexables (skills/seo.md).
        source: '/:locale(es|en)/(cart|checkout|dashboard)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default withNextIntl(config)
