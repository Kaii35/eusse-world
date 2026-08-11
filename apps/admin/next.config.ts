import { join } from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  transpilePackages: ['@eusse/ui', '@eusse/tokens', '@eusse/contracts', '@eusse/domain'],
  typedRoutes: true,
  async headers() {
    return [
      {
        // El back-office entero es privado: nunca cacheable, nunca indexable.
        // Sin excepciones, a diferencia de apps/web (ADR-0004).
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ]
  },
}

export default withNextIntl(config)
