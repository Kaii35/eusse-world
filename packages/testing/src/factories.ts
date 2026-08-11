import { randomUUID } from 'node:crypto'

import { Money, createSalesRules, createSku, type Currency, type SalesRules } from '@eusse/domain'

/**
 * Fábricas de datos de prueba.
 *
 * Cada test crea LO SUYO con valores por defecto sensatos y sobrescritura explícita.
 * Nada de fixtures compartidos: contaminan entre tests e impiden paralelizar
 * (skills/testing.md).
 *
 * Los valores por defecto son realistas a propósito. Un SKU de prueba que se vende de
 * uno en uno no ejercita las reglas de venta mayorista, que es donde están los bugs.
 */

let counter = 0
function nextSequence(): number {
  counter += 1
  return counter
}

export function anId(): string {
  return randomUUID()
}

export function aCorrelationId(): string {
  return `req-${randomUUID()}`
}

/** SKU con el formato real del catálogo: `TAL-500`, `MAR-220`. */
export function aSku(prefix = 'TST'): ReturnType<typeof createSku> {
  return createSku(`${prefix}-${String(100 + nextSequence())}`)
}

/**
 * Reglas de venta por defecto: cajas de 6, mínimo 12.
 *
 * Es el caso de TAL-500 en la documentación, y el que hace fallar a quien asume que se
 * vende de uno en uno.
 */
export function salesRules(overrides: Partial<SalesRules> = {}): SalesRules {
  return createSalesRules(overrides.minOrderQty ?? 12, overrides.qtyIncrement ?? 6)
}

/** Importe en la menor unidad. Por defecto, un precio mayorista realista en pesos. */
export function money(amount = 104_166, currency: Currency = 'COP'): Money {
  return Money.of(amount, currency)
}

export type OutboxEventInput = {
  eventId: string
  type: string
  payload: Record<string, unknown>
  tenantId: string
  correlationId: string
}

/** Evento de integración con la forma del contrato (RFC-0013 §4.2). */
export function anOutboxEvent(overrides: Partial<OutboxEventInput> = {}): OutboxEventInput {
  return {
    eventId: anId(),
    type: 'orders.OrderPlaced.v1',
    payload: { orderNumber: `EW-2026-${String(nextSequence()).padStart(6, '0')}` },
    tenantId: 'eusse',
    correlationId: aCorrelationId(),
    ...overrides,
  }
}

/** Reinicia el contador. Útil cuando un test necesita valores deterministas. */
export function resetFactories(): void {
  counter = 0
}
