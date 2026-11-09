'use client'

import { cx } from './cx'
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from './icons'
import styles from './islands.module.css'
import { useDismissDetails } from './useDismissDetails'

import { useTheme, type Theme } from '@/components/ThemeProvider'

type ThemeSwitcherProps = {
  label: string
  heading: string
  options: Record<Theme, string>
}

const ICONS: Record<Theme, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
}

const ORDER: Theme[] = ['light', 'dark', 'system']

/** Selector de tema. La elección se guarda y se aplica antes de pintar (ThemeScript). */
export function ThemeSwitcher({ label, heading, options }: ThemeSwitcherProps) {
  const ref = useDismissDetails()
  const { theme, setTheme } = useTheme()
  const Current = ICONS[theme]

  return (
    <details ref={ref} className={styles.dropdown}>
      <summary className={cx(styles.dropdownTrigger, styles.iconButton)} aria-label={label}>
        <Current />
      </summary>
      <div className={styles.dropdownPanel}>
        <p className={styles.dropdownHeading}>{heading}</p>
        <ul className={styles.dropdownList}>
          {ORDER.map((option) => {
            const Icon = ICONS[option]
            const active = option === theme
            return (
              <li key={option}>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  aria-pressed={active}
                  onClick={() => {
                    setTheme(option)
                    if (ref.current) ref.current.open = false
                  }}
                >
                  <Icon className={styles.dropdownIcon} />
                  {options[option]}
                  {active ? <CheckIcon className={styles.check} /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </details>
  )
}
