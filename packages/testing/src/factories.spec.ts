import { describe, expect, it } from 'vitest'

import { anOutboxEvent, aSku, money, resetFactories, salesRules } from './factories'
import { hasServices, serviceConfig } from './services'

describe('fábricas', () => {
  it('debería generar SKUs únicos con el formato del catálogo', () => {
    resetFactories()
    const first = aSku('TAL')
    const second = aSku('TAL')

    expect(first).toMatch(/^TAL-\d+$/)
    expect(first).not.toBe(second)
  })

  it('debería usar reglas de venta mayoristas por defecto', () => {
    // Cajas de 6, mínimo 12: el caso que hace fallar a quien asume unidades sueltas.
    expect(salesRules()).toEqual({ minOrderQty: 12, qtyIncrement: 6 })
  })

  it('debería permitir sobrescribir las reglas', () => {
    expect(salesRules({ minOrderQty: 24, qtyIncrement: 12 })).toEqual({
      minOrderQty: 24,
      qtyIncrement: 12,
    })
  })

  it('debería producir importes en la menor unidad', () => {
    expect(money().amount).toBe(104_166)
    expect(money().currency).toBe('COP')
  })

  it('debería generar eventos con la forma del contrato', () => {
    const event = anOutboxEvent()

    expect(event.eventId).toMatch(/^[0-9a-f-]{36}$/)
    expect(event.type).toBe('orders.OrderPlaced.v1')
    expect(event.correlationId).toMatch(/^req-/)
    expect(event.tenantId).toBe('eusse')
  })

  it('debería permitir sobrescribir el tipo de evento', () => {
    expect(anOutboxEvent({ type: 'catalog.ProductPublished.v1' }).type).toBe(
      'catalog.ProductPublished.v1',
    )
  })
})

describe('detección de servicios', () => {
  it('debería coincidir con la presencia de configuración', () => {
    expect(hasServices()).toBe(serviceConfig() !== null)
  })
})
