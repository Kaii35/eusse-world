import { Barlow, Barlow_Condensed } from 'next/font/google'

/**
 * Tipografía de la landing. `next/font` las sirve desde el propio dominio, sin petición
 * a Google en tiempo de ejecución, y evita el salto de layout con `size-adjust`.
 */
export const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-landing-body',
})

export const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-landing-display',
})
