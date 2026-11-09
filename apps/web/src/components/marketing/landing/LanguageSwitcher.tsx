'use client'

import { CheckIcon, ChevronDownIcon, GlobeIcon } from './icons'
import styles from './islands.module.css'
import { useDismissDetails } from './useDismissDetails'

import type { AppLocale } from '@/lib/i18n/routing'

type LanguageSwitcherProps = {
  current: AppLocale
  /** Nombre accesible del botón ("Cambiar idioma"). */
  label: string
  heading: string
  /** `href` ya resuelto en el servidor (p. ej. `/en`). */
  options: { locale: AppLocale; name: string; href: string }[]
}

/**
 * Selector de idioma. Son enlaces normales a `/es` y `/en`: el middleware de next-intl
 * guarda la elección en la cookie de locale al visitar la URL (ADR-0013), así que no
 * hace falta cargar su navegación en el cliente.
 */
export function LanguageSwitcher({ current, label, heading, options }: LanguageSwitcherProps) {
  const ref = useDismissDetails()

  return (
    <details ref={ref} className={styles.dropdown}>
      <summary className={styles.dropdownTrigger} aria-label={label}>
        <GlobeIcon size={16} />
        <span aria-hidden="true">{current.toUpperCase()}</span>
        <ChevronDownIcon className={styles.chevron} />
      </summary>
      <div className={styles.dropdownPanel}>
        <p className={styles.dropdownHeading}>{heading}</p>
        <ul className={styles.dropdownList}>
          {options.map(({ locale, name, href }) => {
            const active = locale === current
            return (
              <li key={locale}>
                <a
                  href={href}
                  lang={locale}
                  hrefLang={locale}
                  aria-current={active ? 'true' : undefined}
                  className={styles.dropdownItem}
                >
                  <span className={styles.localeCode} aria-hidden="true">
                    {locale.toUpperCase()}
                  </span>
                  {name}
                  {active ? <CheckIcon className={styles.check} /> : null}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </details>
  )
}
