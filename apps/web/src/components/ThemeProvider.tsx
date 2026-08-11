'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'eusse-theme'

export type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = { theme: Theme; setTheme: (next: Theme) => void }

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => undefined,
})

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

/**
 * Modo oscuro por CLASE, no por media query: el usuario elige (ADR-0010).
 *
 * En B2B se trabaja en almacenes con mucha luz y en oficinas sin ella; la preferencia
 * del sistema no siempre es la que quiere la persona.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = (): void => {
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark.matches)
      root.classList.toggle('dark', isDark)
      // Alinea los controles nativos (scrollbars, inputs) con el tema elegido.
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }

    apply()
    // Sólo se sigue la preferencia del sistema si el usuario no ha elegido.
    if (theme !== 'system') return

    prefersDark.addEventListener('change', apply)
    return () => {
      prefersDark.removeEventListener('change', apply)
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
