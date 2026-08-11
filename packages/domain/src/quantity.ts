import { invariant } from '@eusse/utils'

/**
 * Reglas de venta de un SKU mayorista.
 *
 * Si un taladro se vende en cajas de 6 con mínimo 12, el sistema no acepta 7.
 * Rechazarlo en dominio evita que operaciones reciba pedidos imposibles de despachar
 * (regla CRT-02, docs/02-domain-model.md §3).
 */
export type SalesRules = {
  readonly minOrderQty: number
  readonly qtyIncrement: number
}

export const QUANTITY_ISSUE = {
  BELOW_MINIMUM: 'BELOW_MINIMUM',
  NOT_MULTIPLE: 'NOT_MULTIPLE',
  NOT_POSITIVE_INTEGER: 'NOT_POSITIVE_INTEGER',
} as const

export type QuantityIssue = (typeof QUANTITY_ISSUE)[keyof typeof QUANTITY_ISSUE]

export type QuantityCheck =
  | { readonly valid: true }
  | { readonly valid: false; readonly issue: QuantityIssue; readonly suggested: number }

/** Crea unas reglas de venta coherentes. El mínimo debe ser múltiplo del incremento. */
export function createSalesRules(minOrderQty: number, qtyIncrement: number): SalesRules {
  invariant(
    Number.isInteger(minOrderQty) && minOrderQty > 0,
    'minOrderQty debe ser un entero positivo',
  )
  invariant(
    Number.isInteger(qtyIncrement) && qtyIncrement > 0,
    'qtyIncrement debe ser un entero positivo',
  )
  invariant(
    minOrderQty % qtyIncrement === 0,
    `minOrderQty (${minOrderQty}) debe ser múltiplo de qtyIncrement (${qtyIncrement})`,
  )
  return { minOrderQty, qtyIncrement }
}

/**
 * Verifica una cantidad contra las reglas de venta.
 *
 * Devuelve `suggested` para que la interfaz pueda ofrecer la corrección concreta
 * ("Ajustar a 12") en vez de un mensaje genérico (skills/ux-design.md).
 */
export function checkQuantity(quantity: number, rules: SalesRules): QuantityCheck {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      valid: false,
      issue: QUANTITY_ISSUE.NOT_POSITIVE_INTEGER,
      suggested: rules.minOrderQty,
    }
  }

  if (quantity < rules.minOrderQty) {
    return { valid: false, issue: QUANTITY_ISSUE.BELOW_MINIMUM, suggested: rules.minOrderQty }
  }

  if (quantity % rules.qtyIncrement !== 0) {
    return {
      valid: false,
      issue: QUANTITY_ISSUE.NOT_MULTIPLE,
      suggested: nextValidQuantity(quantity, rules),
    }
  }

  return { valid: true }
}

/** Menor cantidad válida mayor o igual a la pedida. */
export function nextValidQuantity(quantity: number, rules: SalesRules): number {
  if (quantity <= rules.minOrderQty) return rules.minOrderQty
  return Math.ceil(quantity / rules.qtyIncrement) * rules.qtyIncrement
}
