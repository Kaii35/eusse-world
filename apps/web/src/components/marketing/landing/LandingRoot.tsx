'use client'

import { useEffect, useRef } from 'react'

import { initLandingMotion } from './motion'

type LandingRootProps = {
  className: string
  children: React.ReactNode
}

/**
 * Única isla de cliente de la landing, además del formulario. Las secciones llegan
 * renderizadas en el servidor como `children`; aquí sólo se engancha el movimiento.
 */
export function LandingRoot({ className, children }: LandingRootProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return undefined
    return initLandingMotion(ref.current, () => import('./globe'))
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
