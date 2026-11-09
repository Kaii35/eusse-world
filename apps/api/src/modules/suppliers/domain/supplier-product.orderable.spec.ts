import { Money } from '@eusse/domain'
import { describe, expect, it } from 'vitest'

import { InvalidSupplierProductError, SupplierProduct } from './supplier-product.entity'

function published(): SupplierProduct {
  return SupplierProduct.draft({
    id: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c',
    supplierId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b',
    name: 'Camiseta básica',
    category: 'Camisetas',
    basePrice: Money.of(480, 'COP'),
    colors: ['Negro', 'Blanco'],
    sizes: ['S', 'M', 'L'],
    printOptions: [],
  }).publish()
}

describe('SupplierProduct · pedido permitido', () => {
  it('debería aceptar un color y tallas declarados', () => {
    expect(() => {
      published().assertOrderable('Negro', ['S', 'M'])
    }).not.toThrow()
  })

  it('debería rechazar un color que el proveedor no declara', () => {
    expect(() => {
      published().assertOrderable('Verde', ['S'])
    }).toThrow(InvalidSupplierProductError)
  })

  it('debería rechazar una talla inventada aunque el resto sea válido', () => {
    expect(() => {
      published().assertOrderable('Negro', ['S', 'XXXL'])
    }).toThrow(/XXXL/)
  })

  it('no debería aceptar pedidos de un producto que no está publicado', () => {
    const draft = SupplierProduct.draft({
      id: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c',
      supplierId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b',
      name: 'Camiseta',
      category: 'Camisetas',
      basePrice: Money.of(480, 'COP'),
      colors: ['Negro'],
      sizes: ['S'],
      printOptions: [],
    })

    expect(() => {
      draft.assertOrderable('Negro', ['S'])
    }).toThrow(/publicado/)
  })
})
