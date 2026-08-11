/**
 * Utilidades de contraste.
 *
 * Existen para que la accesibilidad sea VERIFICABLE, no declarada:
 * `contrast.spec.ts` comprueba todos los pares texto/fondo en ambos temas y
 * rompe el build si alguno baja de WCAG 2.2 AA (RFC-0008 §4.6).
 */

/** Color en el espacio OKLCH. `l` en [0,1], `c` en [0,~0.4], `h` en grados. */
export type Oklch = { l: number; c: number; h: number }

/** Color en sRGB con canales en [0,1]. */
export type Srgb = { r: number; g: number; b: number }

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.%]+\s*)?\)$/

/** Parsea `oklch(0.546 0.198 258)`. Devuelve `null` si no encaja. */
export function parseOklch(input: string): Oklch | null {
  const match = OKLCH_PATTERN.exec(input.trim())
  if (!match) return null
  const [, l, c, h] = match
  if (l === undefined || c === undefined || h === undefined) return null
  return { l: Number(l), c: Number(c), h: Number(h) }
}

/** OKLCH → sRGB lineal → sRGB con gamma. Canales recortados a [0,1]. */
export function oklchToSrgb({ l, c, h }: Oklch): Srgb {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bb = c * Math.sin(hRad)

  // OKLab → LMS
  const lms = l + 0.3963377774 * a + 0.2158037573 * bb
  const mms = l - 0.1055613458 * a - 0.0638541728 * bb
  const sms = l - 0.0894841775 * a - 1.291485548 * bb

  const lCubed = lms ** 3
  const mCubed = mms ** 3
  const sCubed = sms ** 3

  // LMS → sRGB lineal
  const rLin = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed
  const gLin = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed
  const bLin = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed

  return {
    r: clamp01(linearToGamma(rLin)),
    g: clamp01(linearToGamma(gLin)),
    b: clamp01(linearToGamma(bLin)),
  }
}

function linearToGamma(value: number): number {
  const abs = Math.abs(value)
  const sign = value < 0 ? -1 : 1
  return abs <= 0.0031308 ? value * 12.92 : sign * (1.055 * abs ** (1 / 2.4) - 0.055)
}

function gammaToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Luminancia relativa según WCAG 2.x. */
export function relativeLuminance({ r, g, b }: Srgb): number {
  return 0.2126 * gammaToLinear(r) + 0.7152 * gammaToLinear(g) + 0.0722 * gammaToLinear(b)
}

/** Ratio de contraste WCAG entre dos colores sRGB. Rango [1, 21]. */
export function contrastRatio(a: Srgb, b: Srgb): number {
  const lumA = relativeLuminance(a)
  const lumB = relativeLuminance(b)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Ratio de contraste entre dos colores expresados en OKLCH. */
export function contrastRatioOklch(fg: string, bg: string): number {
  const parsedFg = parseOklch(fg)
  const parsedBg = parseOklch(bg)
  if (!parsedFg || !parsedBg) {
    throw new Error(`Color OKLCH no válido: ${!parsedFg ? fg : bg}`)
  }
  return contrastRatio(oklchToSrgb(parsedFg), oklchToSrgb(parsedBg))
}

/** Umbrales de WCAG 2.2. */
export const WCAG_AA_NORMAL = 4.5
export const WCAG_AA_LARGE = 3
export const WCAG_AA_UI = 3
