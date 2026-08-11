'use client'

import { useEffect, useState } from 'react'

/**
 * Respeta `prefers-reduced-motion`.
 *
 * No es una mejora opcional: es un requisito de WCAG 2.3.3. Todo componente animado
 * debe consultarlo (docs/12-ux-guidelines.md §4).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent): void => {
      setReduced(event.matches)
    }
    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  return reduced
}
