'use client'

import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { useCart, useLogout, useMe } from '@/lib/marketplace/api/queries'

/**
 * Cabecera de la zona de cuenta: marca, secciones y sesión. Las secciones de proveedor y
 * el carrito sólo aparecen con sesión, para no ofrecer lo que no se puede usar.
 */
export function AppNav({ brand }: { brand: ReactNode }) {
  const t = useTranslations('marketplace.nav')
  const me = useMe()
  const logout = useLogout()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const signedIn = me.isSuccess

  const sections = [
    { href: '/tienda', label: t('store') },
    ...(signedIn
      ? [
          { href: '/carrito', label: t('cart') },
          { href: '/proveedor', label: t('supplier') },
        ]
      : []),
  ]

  return (
    <header className="border-border bg-surface sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/tienda" aria-label={t('brand')} className="flex items-center">
            {brand}
          </Link>
          <nav aria-label={t('label')} className="hidden md:block">
            <ul className="flex items-center gap-6">
              {sections.map((section) => {
                const current = pathname === section.href
                return (
                  <li key={section.href}>
                    <Link
                      href={section.href}
                      aria-current={current ? 'page' : undefined}
                      className={
                        current
                          ? 'text-primary text-body font-semibold'
                          : 'text-muted-foreground hover:text-foreground text-body'
                      }
                    >
                      {section.label}
                      {section.href === '/carrito' ? <CartCount /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={logout.isPending}
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
            <Button asChild size="sm">
              <Link href="/acceso">{t('access')}</Link>
            </Button>
          )}
          <button
            type="button"
            className="text-body-sm text-foreground border-border rounded-md border px-3 py-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="account-menu"
            onClick={() => {
              setMenuOpen((open) => !open)
            }}
          >
            {t('label')}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="account-menu"
          aria-label={t('label')}
          className="border-border border-t px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-3">
            {sections.map((section) => (
              <li key={section.href}>
                <Link href={section.href} className="text-foreground text-body">
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}

/** Unidades en el carrito. Sólo se consulta con sesión, así no llama al servidor a ciegas. */
function CartCount() {
  const t = useTranslations('marketplace.nav')
  const cart = useCart()
  if (!cart.isSuccess || !(cart.data.totalUnits > 0)) return null
  return (
    <span className="bg-primary text-primary-foreground text-caption ms-2 rounded-full px-2 py-0.5">
      {t('cartCount', { count: cart.data.totalUnits })}
    </span>
  )
}
