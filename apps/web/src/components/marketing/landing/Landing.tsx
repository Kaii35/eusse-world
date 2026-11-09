import { getLocale, getTranslations } from 'next-intl/server'

import { ContactForm } from './ContactForm'
import { cx } from './cx'
import { CONTACT_POINTS, HUBS, SECTION_IDS } from './data'
import { barlow, barlowCondensed } from './fonts'
import { Hero, Highlights } from './Hero'
import { ClockIcon, FileTextIcon, RouteIcon } from './icons'
import styles from './landing.module.css'
import { LandingRoot } from './LandingRoot'
import { PersonalShopper } from './PersonalShopper'
import { Process } from './Process'
import { RoutePlanner } from './RoutePlanner'
import { About, Network } from './Sections'
import { Services } from './Services'
import { BrandLockup, NAV_ITEMS, SiteHeader } from './SiteHeader'

import { routing } from '@/lib/i18n/routing'

/**
 * Landing pública de Eusse World (RFC-0009).
 *
 * Server Components: todo el contenido se renderiza en el servidor y se ve sin JS.
 * Islas de cliente: `LandingRoot` (movimiento y globo diferido), `QuoteForm` (envío),
 * `LanguageSwitcher` y `MobileNav`.
 */
export function Landing() {
  return (
    <LandingRoot className={cx(styles.root, barlow.variable, barlowCondensed.variable)}>
      <SiteHeader />
      <main id={SECTION_IDS.main} tabIndex={-1}>
        <Hero />
        <Highlights />
        <About />
        <Services />
        <PersonalShopper />
        <Network />
        <Process />
        <RoutePlanner />
        <Contact />
      </main>
      <SiteFooter />
    </LandingRoot>
  )
}

const CONTACT_ICONS = { response: ClockIcon, coverage: RouteIcon, proposal: FileTextIcon } as const

async function Contact() {
  const t = await getTranslations('landing.contact')

  return (
    <section id={SECTION_IDS.contact} className={styles.contact} aria-labelledby="contact-title">
      <div className={cx(styles.container, styles.contactLayout)}>
        <div className={styles.contactIntro} data-reveal="">
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h2 id="contact-title" className={styles.sectionTitle}>
            {t('title')}
          </h2>
          <p className={styles.lead}>{t('lead')}</p>
          <ul className={styles.contactPoints}>
            {CONTACT_POINTS.map((key) => {
              const Icon = CONTACT_ICONS[key]
              return (
                <li key={key} className={styles.contactPoint}>
                  <Icon />
                  {t(`points.${key}`)}
                </li>
              )
            })}
          </ul>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}

async function SiteFooter() {
  const t = await getTranslations('landing')
  const locale = await getLocale()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <BrandLockup size="lg" />
            <p className={styles.footerTagline}>{t('footer.tagline')}</p>
          </div>
          <div>
            <h2 className={styles.footerHeading}>{t('footer.operatesIn')}</h2>
            <ul className={styles.footerCol}>
              {HUBS.map((hub) => (
                <li key={hub.country}>{t(`countries.${hub.country}`)}</li>
              ))}
            </ul>
          </div>
          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={styles.footerHeading}>
              {t('footer.navigation')}
            </h2>
            <ul className={styles.footerCol}>
              {NAV_ITEMS.map(([key, id]) => (
                <li key={key}>
                  <a className={styles.footerLink} href={`#${id}`}>
                    {t(`nav.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className={styles.footerHeading}>{t('language.heading')}</h2>
            <ul className={styles.footerCol}>
              {routing.locales.map((code) => (
                <li key={code}>
                  <a
                    className={styles.footerLink}
                    href={`/${code}`}
                    lang={code}
                    hrefLang={code}
                    aria-current={code === locale ? 'true' : undefined}
                  >
                    {t(`language.${code}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span>{HUBS.map((hub) => t(`countries.${hub.country}`)).join(' · ')}</span>
        </div>
      </div>
    </footer>
  )
}
