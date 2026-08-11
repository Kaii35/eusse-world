import { describe, expect, it } from 'vitest'

import {
  ERROR_CODE,
  ERROR_STATUS,
  errorCodeSchema,
  errorTypeUri,
  problemDetailsSchema,
} from './errors'

describe('catálogo de errores', () => {
  it('debería tener un mapeo HTTP para cada código', () => {
    const codes = Object.values(ERROR_CODE)
    const mapped = Object.keys(ERROR_STATUS)
    const missing = codes.filter((code) => !mapped.includes(code))

    expect(missing, `Códigos sin mapeo HTTP: ${missing.join(', ')}`).toEqual([])
  })

  it('no debería tener mapeos huérfanos', () => {
    const codes = new Set<string>(Object.values(ERROR_CODE))
    const orphans = Object.keys(ERROR_STATUS).filter((key) => !codes.has(key))

    expect(orphans, `Mapeos sin código: ${orphans.join(', ')}`).toEqual([])
  })

  it('debería usar el mismo string como clave y valor en el catálogo', () => {
    for (const [key, value] of Object.entries(ERROR_CODE)) {
      expect(value, `El código ${key} no coincide con su clave`).toBe(key)
    }
  })

  it('debería asignar códigos HTTP dentro del rango válido', () => {
    for (const [code, status] of Object.entries(ERROR_STATUS)) {
      expect(status, `${code} tiene un status fuera de rango`).toBeGreaterThanOrEqual(100)
      expect(status, `${code} tiene un status fuera de rango`).toBeLessThanOrEqual(599)
    }
  })

  it('debería devolver 404 y no 403 para el aislamiento entre cuentas', () => {
    // Un 403 confirmaría la existencia del recurso ajeno (skills/security.md).
    expect(ERROR_STATUS.COMMON_NOT_FOUND).toBe(404)
  })

  it('debería tratar la aprobación por umbral como 202, no como error', () => {
    // La orden SÍ se creó: quedó en PENDING_APPROVAL (regla CHK-02).
    expect(ERROR_STATUS.CHECKOUT_APPROVAL_REQUIRED).toBe(202)
  })

  it('debería tratar una lista de precios ambigua como fallo del servidor', () => {
    // Es un error de configuración: el sistema no debe adivinar (RFC-0006 §10).
    expect(ERROR_STATUS.PRICING_AMBIGUOUS_PRICE_LIST).toBe(500)
  })
})

describe('errorTypeUri', () => {
  it('debería convertir el código a una URI legible', () => {
    expect(errorTypeUri(ERROR_CODE.CART_QTY_NOT_MULTIPLE)).toBe(
      'https://api.eusse.world/errors/cart-qty-not-multiple',
    )
  })

  it('debería producir una URL válida para todos los códigos', () => {
    for (const code of Object.values(ERROR_CODE)) {
      expect(() => new URL(errorTypeUri(code))).not.toThrow()
    }
  })
})

describe('esquema de respuesta de error', () => {
  const valid = {
    type: 'https://api.eusse.world/errors/cart-qty-not-multiple',
    title: 'Cantidad no válida',
    status: 422,
    code: ERROR_CODE.CART_QTY_NOT_MULTIPLE,
    detail: 'TAL-500 se vende en cajas de 6 unidades',
    instance: '/api/v1/cart/items',
    correlationId: 'req-abc123',
    meta: { sku: 'TAL-500', requested: 7, qtyIncrement: 6, suggested: 12 },
  }

  it('debería aceptar una respuesta completa', () => {
    expect(problemDetailsSchema.parse(valid)).toEqual(valid)
  })

  it('debería aceptar una respuesta sin meta', () => {
    const { meta: _meta, ...withoutMeta } = valid
    expect(() => problemDetailsSchema.parse(withoutMeta)).not.toThrow()
  })

  it('debería rechazar un código fuera del catálogo', () => {
    expect(() => problemDetailsSchema.parse({ ...valid, code: 'INVENTADO' })).toThrow()
  })

  it('debería exigir correlationId para poder rastrear el fallo', () => {
    const { correlationId: _id, ...withoutCorrelation } = valid
    expect(() => problemDetailsSchema.parse(withoutCorrelation)).toThrow()
  })

  it('debería validar todos los códigos del catálogo', () => {
    for (const code of Object.values(ERROR_CODE)) {
      expect(() => errorCodeSchema.parse(code)).not.toThrow()
    }
  })
})
