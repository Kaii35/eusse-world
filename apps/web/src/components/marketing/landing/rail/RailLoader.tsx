'use client'

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

import type { ClothingRailProps } from './ClothingRail'

/**
 * Carga el perchero cuando su sección está a punto de entrar en pantalla. Hasta entonces
 * (y sin JS) se ve `children`: la lista estática de prendas renderizada en el servidor.
 * Así el componente, pesado, no entra en el JS inicial de la landing.
 */
export function RailLoader({ children, ...props }: ClothingRailProps & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [Rail, setRail] = useState<ComponentType<ClothingRailProps> | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    let cancelled = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        void import('./ClothingRail').then((module) => {
          if (!cancelled) setRail(() => module.ClothingRail)
        })
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(node)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  return <div ref={ref}>{Rail ? <Rail {...props} /> : children}</div>
}
