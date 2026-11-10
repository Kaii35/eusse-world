import type { Money } from './api/types'

/**
 * Importes en la menor unidad (centavos), tal como los devuelve la API. Se convierten sólo
 * para mostrarlos: ningún cálculo de precio ocurre en el navegador (CLAUDE.md).
 */
const MINOR_UNIT_DIGITS = 2

export function formatMoney(money: Money, locale: string): string {
  const major = money.amount / 10 ** MINOR_UNIT_DIGITS
  return new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency }).format(
    major,
  )
}

/** Convierte una cantidad escrita en unidades mayores a la menor unidad, sin decimales flotantes. */
export function toMinorUnits(majorText: string): number {
  const normalized = majorText.trim().replace(',', '.')
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0) return Number.NaN
  return Math.round(value * 10 ** MINOR_UNIT_DIGITS)
}

/** "S, M,L" → ["S", "M", "L"]. Sin vacíos ni repetidos. */
export function parseList(text: string): string[] {
  const items = text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return [...new Set(items)]
}

/** Iniciales para la marca de un proveedor o un comerciante: "Textiles Andinos" → "TA". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** Rango de tallas legible: ["XS","S","M","L"] → "XS–L". Respeta el orden en que se cargaron. */
export function sizeRange(sizes: string[]): string {
  if (sizes.length === 0) return ''
  const first = sizes[0] ?? ''
  const last = sizes[sizes.length - 1] ?? ''
  return first === last ? first : `${first}–${last}`
}
