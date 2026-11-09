'use client'

import { cx } from './cx'
import { MenuIcon } from './icons'
import styles from './islands.module.css'
import { useDismissDetails } from './useDismissDetails'

type MobileNavProps = {
  label: string
  title: string
  links: { href: string; label: string }[]
  cta: { href: string; label: string }
  /** Clases del botón principal, que viven en landing.module.css (servidor). */
  ctaClassName: string
}

/** Menú de navegación por debajo de 960 px. `<details>`: funciona también sin JS. */
export function MobileNav({ label, title, links, cta, ctaClassName }: MobileNavProps) {
  const ref = useDismissDetails()

  return (
    <details ref={ref} className={cx(styles.dropdown, styles.mobileNav)}>
      <summary className={cx(styles.dropdownTrigger, styles.iconButton)} aria-label={label}>
        <MenuIcon />
      </summary>
      <nav className={styles.mobilePanel} aria-label={title}>
        <ul className={styles.mobileList}>
          {links.map((link) => (
            <li key={link.href}>
              <a className={styles.mobileLink} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a className={cx(ctaClassName, styles.mobileCta)} href={cta.href}>
          {cta.label}
        </a>
      </nav>
    </details>
  )
}
