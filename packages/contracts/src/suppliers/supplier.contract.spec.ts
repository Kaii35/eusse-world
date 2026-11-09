import { describe, expect, it } from 'vitest'

import {
  cartSupplierMinimumSchema,
  supplierProductCreateRequest,
  supplierRegistrationRequest,
} from './supplier.contract'

const SUPPLIER_ID = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b'

describe('contrato de registro de proveedor', () => {
  it('debería aceptar un registro válido y recortar espacios', () => {
    const parsed = supplierRegistrationRequest.parse({
      legalName: '  Textiles Andinos SAS  ',
      taxId: '900123456',
    })

    expect(parsed.legalName).toBe('Textiles Andinos SAS')
  })

  it('debería descartar un supplierId enviado por el cliente, que sale de la sesión', () => {
    const result = supplierRegistrationRequest.safeParse({
      legalName: 'Textiles',
      taxId: '900123456',
      supplierId: SUPPLIER_ID,
    })

    expect(result.success).toBe(true)
    expect(result.success && 'supplierId' in result.data).toBe(false)
  })
})

describe('contrato de producto de proveedor', () => {
  const valid = {
    name: 'Camiseta básica 180 g',
    category: 'Camisetas',
    basePrice: { amount: 480, currency: 'COP' },
    colors: ['Negro'],
    sizes: ['S', 'M'],
    printOptions: [
      {
        technique: 'DTF',
        sizes: ['20x25'],
        placements: ['Frente'],
        unitFee: { amount: 120, currency: 'COP' },
      },
    ],
  }

  it('debería aceptar un producto válido', () => {
    expect(supplierProductCreateRequest.safeParse(valid).success).toBe(true)
  })

  it('debería rechazar un precio con decimales', () => {
    const result = supplierProductCreateRequest.safeParse({
      ...valid,
      basePrice: { amount: 4.8, currency: 'COP' },
    })
    expect(result.success).toBe(false)
  })

  it('debería rechazar una técnica de estampado fuera del catálogo', () => {
    const result = supplierProductCreateRequest.safeParse({
      ...valid,
      printOptions: [{ ...valid.printOptions[0], technique: 'HOLOGRAM' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('contrato de mínimo en el carrito', () => {
  it('debería aceptar el estado de un proveedor que cumple', () => {
    const result = cartSupplierMinimumSchema.safeParse({
      supplierId: SUPPLIER_ID,
      units: 6,
      required: 6,
      met: true,
      missing: 0,
    })
    expect(result.success).toBe(true)
  })

  it('debería rechazar un mínimo distinto de 6', () => {
    const result = cartSupplierMinimumSchema.safeParse({
      supplierId: SUPPLIER_ID,
      units: 3,
      required: 3,
      met: false,
      missing: 0,
    })
    expect(result.success).toBe(false)
  })
})
