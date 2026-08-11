import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Envoltorios de navegación que conservan el prefijo de idioma.
 *
 * REGLA: en la app se usan ESTOS, no los de `next/link`. Con los de Next se pierde el
 * locale al navegar (skills/i18n.md).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
