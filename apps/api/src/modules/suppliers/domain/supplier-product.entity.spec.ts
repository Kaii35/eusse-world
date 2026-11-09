import { Money } from '@eusse/domain'
import { describe, expect, it } from 'vitest'

import {
  InvalidSupplierProductError,
  PrintNotAvailableError,
  SupplierProduct,
  SupplierProductIncompleteError,
  type NewSupplierProduct,
} from './supplier-product.entity'

const PRODUCT_ID = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c'
const SUPPLIER_ID = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b'

/** Camiseta de referencia: 4,80 COP base, estampado DTF por 1,20. */
function tShirt(overrides: Partial<NewSupplierProduct> = {}): NewSupplierProduct {
  return {
    id: PRODUCT_ID,
    supplierId: SUPPLIER_ID,
    name: 'Camiseta básica 180 g',
    category: 'Camisetas',
    basePrice: Money.fromMajorUnits(4.8, 'COP'),
    colors: ['Negro', 'Blanco'],
    sizes: ['S', 'M', 'L'],
    printOptions: [
      {
        technique: 'DTF',
        sizes: ['20x25', '30x40'],
        placements: ['Frente', 'Espalda'],
        unitFee: Money.fromMajorUnits(1.2, 'COP'),
      },
    ],
    ...overrides,
  }
}

describe('SupplierProduct · borrador', () => {
  it('debería permitir datos incompletos mientras es borrador', () => {
    const draft = SupplierProduct.draft(tShirt({ colors: [], sizes: [] }))

    expect(draft.status).toBe('DRAFT')
  })

  it('debería rechazar colores repetidos sin distinguir mayúsculas', () => {
    expect(() => SupplierProduct.draft(tShirt({ colors: ['Negro', 'negro'] }))).toThrow(
      InvalidSupplierProductError,
    )
  })

  it('debería rechazar una técnica de estampado repetida', () => {
    const dtf = tShirt().printOptions[0]!
    expect(() => SupplierProduct.draft(tShirt({ printOptions: [dtf, dtf] }))).toThrow(
      /aparece dos veces/,
    )
  })

  it('debería rechazar opciones de estampado en otra moneda', () => {
    const usdFee = Money.fromMajorUnits(1, 'USD')
    const option = { ...tShirt().printOptions[0]!, unitFee: usdFee }
    expect(() => SupplierProduct.draft(tShirt({ printOptions: [option] }))).toThrow(/misma moneda/)
  })
})

describe('SupplierProduct · publicación (I-6)', () => {
  it('debería publicar un producto completo', () => {
    const published = SupplierProduct.draft(tShirt()).publish()

    expect(published.status).toBe('PUBLISHED')
  })

  it('debería listar todo lo que falta, no solo el primer dato', () => {
    const draft = SupplierProduct.draft(
      tShirt({ colors: [], sizes: [], basePrice: Money.zero('COP') }),
    )

    expect(() => draft.publish()).toThrow(SupplierProductIncompleteError)
    try {
      draft.publish()
    } catch (error) {
      expect(error).toBeInstanceOf(SupplierProductIncompleteError)
      expect((error as SupplierProductIncompleteError).meta).toEqual({
        missing: ['al menos un color', 'al menos una talla', 'un precio base mayor que cero'],
      })
    }
  })

  it('no debería publicar dos veces', () => {
    const published = SupplierProduct.draft(tShirt()).publish()

    expect(() => published.publish()).toThrow(InvalidSupplierProductError)
  })
})

describe('SupplierProduct · precio por unidad (R-04)', () => {
  it('debería cobrar el precio base sin estampado', () => {
    const product = SupplierProduct.draft(tShirt())

    expect(product.unitPriceFor(null).amount).toBe(480)
  })

  it('debería sumar el costo del estampado al precio base', () => {
    const product = SupplierProduct.draft(tShirt())

    const price = product.unitPriceFor({ technique: 'DTF', size: '20x25', placement: 'Frente' })

    expect(price.amount).toBe(600)
  })

  it('debería rechazar una técnica que el proveedor no ofrece', () => {
    const product = SupplierProduct.draft(tShirt())

    expect(() =>
      product.unitPriceFor({ technique: 'EMBROIDERY', size: '20x25', placement: 'Frente' }),
    ).toThrow(PrintNotAvailableError)
  })

  it('debería rechazar un tamaño o una ubicación no ofrecidos', () => {
    const product = SupplierProduct.draft(tShirt())

    expect(() =>
      product.unitPriceFor({ technique: 'DTF', size: '50x50', placement: 'Frente' }),
    ).toThrow(/tamaño no ofrecido/)
    expect(() =>
      product.unitPriceFor({ technique: 'DTF', size: '20x25', placement: 'Manga' }),
    ).toThrow(/ubicación no ofrecida/)
  })
})
