'use client'

import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'

import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { useLogout, useMe } from '@/lib/marketplace/api/queries'

/** Navegación de la zona de cuenta: tienda, carrito, proveedor y sesión. */
export function AppNav() {
  const t = useTranslations('marketplace.nav')
  const me = useMe()
  const logout = useLogout()
  const router = useRouter()
  const pathname = usePathname()

  const signedIn = me.isSuccess

  const links = [
    { href: '/tienda', label: t('store') },
    { href: '/carrito', label: t('cart') },
    { href: '/proveedor', label: t('supplier') },
  ] as const

  return (
    <header className="border-border bg-surface border-b">
      <nav
        aria-label={t('label')}
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3"
      >
        <Link href="/tienda" className="text-foreground font-semibold">
          {t('brand')}
        </Link>
        <ul className="flex flex-1 flex-wrap items-center gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {signedIn ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout.mutate(undefined, {
                onSettled: () => {
                  router.push('/acceso')
                },
              })
            }}
          >
            {t('logout')}
          </Button>
        ) : (
          <Link href="/acceso" className="text-primary font-medium">
            {t('access')}
          </Link>
        )}
      </nav>
    </header>
  )
}
