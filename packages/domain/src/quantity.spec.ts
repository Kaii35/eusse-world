import { describe, expect, it } from 'vitest'

import { checkQuantity, createSalesRules, nextValidQuantity, QUANTITY_ISSUE } from './quantity'

/**
 * Regla CRT-02 (docs/02-domain-model.md §3): la cantidad debe respetar `minOrderQty`
 * y ser múltiplo de `qtyIncrement`.
 *
 * Caso de referencia: TAL-500 se vende en cajas de 6, con mínimo 12.
 */
const TAL_500 = createSalesRules(12, 6)

describe('reglas de venta', () => {
  it('debería rechazar un mínimo que no sea múltiplo del incremento', () => {
    expect(() => createSalesRules(10, 6)).toThrow(/múltiplo/)
  })

  it('debería aceptar un mínimo igual al incremento', () => {
    expect(createSalesRules(6, 6)).toEqual({ minOrderQty: 6, qtyIncrement: 6 })
  })

  it('debería rechazar valores no enteros o no positivos', () => {
    expect(() => createSalesRules(0, 6)).toThrow(/entero positivo/)
    expect(() => createSalesRules(12, 0)).toThrow(/entero positivo/)
    expect(() => createSalesRules(12.5, 6)).toThrow(/entero positivo/)
  })
})

describe('verificación de cantidad', () => {
  it('debería aceptar exactamente el mínimo', () => {
    expect(checkQuantity(12, TAL_500)).toEqual({ valid: true })
  })

  it('debería aceptar un múltiplo por encima del mínimo', () => {
    expect(checkQuantity(18, TAL_500)).toEqual({ valid: true })
    expect(checkQuantity(24, TAL_500)).toEqual({ valid: true })
  })

  it('debería rechazar una cantidad por debajo del mínimo y sugerir el mínimo', () => {
    expect(checkQuantity(6, TAL_500)).toEqual({
      valid: false,
      issue: QUANTITY_ISSUE.BELOW_MINIMUM,
      suggested: 12,
    })
  })

  it('debería rechazar una cantidad que no es múltiplo y sugerir el siguiente válido', () => {
    // El caso del RFC-0004: el visitante pide 7 unidades de un SKU con incremento 6.
    expect(checkQuantity(7, TAL_500)).toEqual({
      valid: false,
      issue: QUANTITY_ISSUE.BELOW_MINIMUM,
      suggested: 12,
    })

    expect(checkQuantity(13, TAL_500)).toEqual({
      valid: false,
      issue: QUANTITY_ISSUE.NOT_MULTIPLE,
      suggested: 18,
    })
  })

  it('debería rechazar cero, negativos y decimales', () => {
    for (const invalid of [0, -6, 12.5]) {
      expect(checkQuantity(invalid, TAL_500)).toMatchObject({
        valid: false,
        issue: QUANTITY_ISSUE.NOT_POSITIVE_INTEGER,
      })
    }
  })
})

describe('siguiente cantidad válida', () => {
  it('debería devolver el mínimo cuando la cantidad está por debajo', () => {
    expect(nextValidQuantity(1, TAL_500)).toBe(12)
    expect(nextValidQuantity(12, TAL_500)).toBe(12)
  })

  it('debería redondear hacia arriba al siguiente múltiplo', () => {
    expect(nextValidQuantity(13, TAL_500)).toBe(18)
    expect(nextValidQuantity(17, TAL_500)).toBe(18)
    expect(nextValidQuantity(18, TAL_500)).toBe(18)
  })

  it('debería producir siempre una cantidad que pasa la verificación', () => {
    for (let quantity = 1; quantity <= 100; quantity += 1) {
      const suggested = nextValidQuantity(quantity, TAL_500)
      expect(checkQuantity(suggested, TAL_500)).toEqual({ valid: true })
    }
  })
})
