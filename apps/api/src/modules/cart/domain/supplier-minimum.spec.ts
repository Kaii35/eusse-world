import { describe, expect, it } from 'vitest'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

import { assertSupplierMinimumsMet, evaluateSupplierMinimums } from './supplier-minimum'

const SUPPLIER_A = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b'
const SUPPLIER_B = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5d'

describe('mínimo por proveedor (R-01, I-1)', () => {
  it('debería cumplir con 4 camisetas y 2 sudaderas del mismo proveedor', () => {
    const status = evaluateSupplierMinimums([
      { supplierId: SUPPLIER_A, quantity: 4 },
      { supplierId: SUPPLIER_A, quantity: 2 },
    ])

    expect(status).toEqual([
      { supplierId: SUPPLIER_A, units: 6, required: 6, met: true, missing: 0 },
    ])
  })

  it('no debería sumar unidades de proveedores distintos', () => {
    const status = evaluateSupplierMinimums([
      { supplierId: SUPPLIER_A, quantity: 3 },
      { supplierId: SUPPLIER_B, quantity: 3 },
    ])

    expect(status.map((s) => [s.supplierId, s.met, s.missing])).toEqual([
      [SUPPLIER_A, false, 3],
      [SUPPLIER_B, false, 3],
    ])
  })

  it('debería indicar cuántas unidades faltan', () => {
    const [status] = evaluateSupplierMinimums([{ supplierId: SUPPLIER_A, quantity: 2 }])

    expect(status).toMatchObject({ units: 2, met: false, missing: 4 })
  })

  it('debería rechazar el pago y listar todos los proveedores que no cumplen', () => {
    try {
      assertSupplierMinimumsMet([
        { supplierId: SUPPLIER_A, quantity: 3 },
        { supplierId: SUPPLIER_B, quantity: 6 },
        { supplierId: SUPPLIER_A, quantity: 1 },
      ])
      expect.fail('debería haber lanzado')
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError)
      expect((error as DomainError).code).toBe('CART_SUPPLIER_MINIMUM_NOT_MET')
      const suppliers = (error as DomainError).meta?.suppliers as { supplierId: string }[]
      expect(suppliers.map((s) => s.supplierId)).toEqual([SUPPLIER_A])
    }
  })

  it('debería aceptar un carrito en el que todos los proveedores cumplen', () => {
    expect(() => {
      assertSupplierMinimumsMet([
        { supplierId: SUPPLIER_A, quantity: 6 },
        { supplierId: SUPPLIER_B, quantity: 7 },
      ])
    }).not.toThrow()
  })

  it('debería rechazar un carrito vacío', () => {
    expect(() => {
      assertSupplierMinimumsMet([])
    }).toThrow(/vacío/)
  })

  it('debería rechazar cantidades no positivas', () => {
    expect(() => evaluateSupplierMinimums([{ supplierId: SUPPLIER_A, quantity: 0 }])).toThrow(
      /entero positivo/,
    )
    expect(() => evaluateSupplierMinimums([{ supplierId: SUPPLIER_A, quantity: 1.5 }])).toThrow(
      /entero positivo/,
    )
  })
})
