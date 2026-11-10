'use client'

import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

import { buttonClass, cx } from './kit'
import styles from './wholesale.module.css'

import { Link, usePathname, useRouter } from '@/lib/i18n/navigation'
import { useCart, useLogout, useMe } from '@/lib/marketplace/api/queries'

/**
 * Cabecera de la zona mayorista. Va siempre en azul de la landing, así el logo y el texto
 * se leen igual en tema claro y oscuro. Las secciones de cuenta sólo aparecen con sesión.
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
          { href: '/pedidos', label: t('orders') },
          { href: '/proveedor', label: t('supplier') },
        ]
      : []),
  ]

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={styles.header}>
      <div className={cx(styles.container, styles.headerInner)}>
        <Link href="/tienda" aria-label={t('brand')} className={styles.brand}>
          {brand}
        </Link>

        <nav aria-label={t('label')} className="hidden md:block">
          <ul className={styles.navList}>
            {sections.map((section) => {
              const current = isCurrent(section.href)
              return (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    aria-current={current ? 'page' : undefined}
                    className={cx(styles.navLink, current && styles.navLinkOn)}
                  >
                    {section.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={styles.headerEnd}>
          {signedIn ? (
            <Link
              href="/carrito"
              aria-current={isCurrent('/carrito') ? 'page' : undefined}
              className={buttonClass({ variant: 'primary', size: 'sm' })}
            >
              {t('cart')}
              <CartCount />
            </Link>
          ) : null}
          {signedIn ? (
            <button
              type="button"
              className={buttonClass({ variant: 'onDarkGhost', size: 'sm' })}
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
            </button>
          ) : (
            <Link href="/acceso" className={buttonClass({ variant: 'primary', size: 'sm' })}>
              {t('access')}
            </Link>
          )}
          <div className="md:hidden">
            <button
              type="button"
              className={buttonClass({ variant: 'onDark', size: 'sm' })}
              aria-expanded={menuOpen}
              aria-controls="account-menu"
              onClick={() => {
                setMenuOpen((open) => !open)
              }}
            >
              {t('menu')}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="account-menu"
          aria-label={t('label')}
          className="border-t px-4 py-4 md:hidden"
          style={{ borderColor: 'var(--landing-night-line)' }}
        >
          <ul className="flex flex-col gap-2">
            {sections.map((section) => (
              <li key={section.href}>
                <Link href={section.href} className={styles.navLink}>
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
  const cart = useCart()
  if (!cart.isSuccess || !(cart.data.totalUnits > 0)) return null
  return <span className={styles.countBadge}>{cart.data.totalUnits}</span>
}
