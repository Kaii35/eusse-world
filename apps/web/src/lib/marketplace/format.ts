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
