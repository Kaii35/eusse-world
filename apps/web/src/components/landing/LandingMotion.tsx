'use client'

import { useScrolledFlag, useSpotlight } from './use-page-chrome'
import { useParallax } from './use-parallax'
import { useReveal } from './use-reveal'

/**
 * Único componente de cliente para el movimiento de la página: reveals, parallax,
 * barra de vidrio y foco de luz, todo sobre el DOM que ya pintó el servidor. Así las
 * secciones siguen siendo Server Components y el movimiento no añade librerías.
 */
export function LandingMotion() {
  useReveal()
  useParallax()
  useScrolledFlag()
  useSpotlight()
  return null
}
