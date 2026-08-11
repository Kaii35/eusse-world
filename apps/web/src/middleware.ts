import createMiddleware from 'next-intl/middleware'

import { routing } from './lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Se excluyen API, estáticos y archivos con extensión: el middleware se ejecuta en
  // CADA petición, así que su coste importa (skills/frontend-nextjs.md).
  matcher: ['/((?!api|_next|_vercel|.*[.].*).*)'],
}
