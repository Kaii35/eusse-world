export {
  contrastRatio,
  contrastRatioOklch,
  oklchToSrgb,
  parseOklch,
  relativeLuminance,
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
  WCAG_AA_UI,
} from './contrast'
export type { Oklch, Srgb } from './contrast'

/** Duraciones de movimiento, en ms. Espejo de los tokens CSS (ADR-0016). */
export const motion = {
  fast: 150,
  base: 250,
  slow: 450,
} as const

/** Puntos de corte, en px. Espejo de Tailwind (docs/12-ux-guidelines.md §8). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints
