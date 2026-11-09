import { getLocale, getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { SECTION_IDS } from './data'
import styles from './landing.module.css'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav } from './MobileNav'
import { ThemeSwitcher } from './ThemeSwitcher'

import { routing, type AppLocale } from '@/lib/i18n/routing'

export const NAV_ITEMS = [
  ['services', SECTION_IDS.services],
  ['network', SECTION_IDS.network],
  ['process', SECTION_IDS.process],
  ['contact', SECTION_IDS.contact],
] as const

/**
 * Logotipo: el isotipo del logo (globo con anillo) más el nombre compuesto como en el
 * original — "EUSSE" ancho y "— WORLD —" pequeño debajo. El nombre va en texto real (no
 * imagen) para que se lea igual de bien sobre la noche que sobre el papel.
 */
export async function BrandLockup({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const t = await getTranslations('landing.brand')
  const height = size === 'lg' ? 44 : 34
  return (
    <span className={cx(styles.lockup, size === 'lg' && styles.lockupLg)}>
      {/* Decorativa: el nombre accesible lo da el enlace o el texto de al lado. */}
      <img
        src="/landing/logo-mark.png"
        alt=""
        width={Math.round((height * 153) / 96)}
        height={height}
        className={styles.lockupMark}
        decoding="async"
      />
      <span className={styles.lockupText} aria-hidden="true">
        <span className={styles.lockupName}>{t('name')}</span>
        <span className={styles.lockupSuffix}>{t('suffix')}</span>
      </span>
    </span>
  )
}

export async function SiteHeader() {
  const t = await getTranslations('landing')
  const ta = await getTranslations('a11y')
  const tm = await getTranslations('marketplace.nav')
  const locale = (await getLocale()) as AppLocale

  const links = NAV_ITEMS.map(([key, id]) => ({ href: `#${id}`, label: t(`nav.${key}`) }))
  const cta = { href: `#${SECTION_IDS.contact}`, label: t('nav.cta') }

  // Acceso a la zona de cuenta: tienda e ingreso. Son rutas reales, con el prefijo de idioma.
  const accountLinks = [
    { href: `/${locale}/tienda`, label: tm('store') },
    { href: `/${locale}/acceso`, label: tm('access') },
  ]

  return (
    <>
      <a className={styles.skip} href={`#${SECTION_IDS.main}`}>
        {ta('skipToContent')}
      </a>
      <header className={styles.header} data-nav="">
        <div className={cx(styles.container, styles.headerInner)}>
          <a className={styles.brand} href="#top" aria-label={t('brand.home')}>
            <BrandLockup />
          </a>

          <nav className={styles.nav} aria-label={t('nav.label')}>
            <ul className={styles.navList}>
              {links.map((link) => (
                <li key={link.href}>
                  <a className={styles.navLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.headerActions}>
            {accountLinks.map((link) => (
              <a key={link.href} className={styles.navLink} href={link.href}>
                {link.label}
              </a>
            ))}
            <LanguageSwitcher
              current={locale}
              label={t('language.label')}
              heading={t('language.heading')}
              options={routing.locales.map((code) => ({
                locale: code,
                name: t(`language.${code}`),
                href: `/${code}`,
              }))}
            />
            <ThemeSwitcher
              label={t('theme.label')}
              heading={t('theme.heading')}
              options={{
                light: t('theme.light'),
                dark: t('theme.dark'),
                system: t('theme.system'),
              }}
            />
            <a
              className={cx(styles.button, styles.buttonPrimary, styles.buttonSm, styles.headerCta)}
              href={cta.href}
            >
              {cta.label}
            </a>
            <MobileNav
              label={t('nav.openMenu')}
              title={t('nav.menu')}
              links={[...links, ...accountLinks]}
              cta={cta}
              ctaClassName={cx(styles.button, styles.buttonPrimary)}
            />
          </div>
        </div>
      </header>
    </>
  )
}
