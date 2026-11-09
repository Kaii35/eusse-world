import { randomUUID } from 'node:crypto'

import { Money } from '@eusse/domain'
import { Inject, Injectable } from '@nestjs/common'

import type { SupplierProductCreateRequest } from '@eusse/contracts'

import {
  SUPPLIER_PRODUCT_REPOSITORY,
  type SupplierProductRepository,
} from '../domain/ports/supplier-product.repository.port'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'
import { SupplierProduct } from '../domain/supplier-product.entity'

import { requireActiveSupplierOf } from './require-supplier'

/**
 * Crea un producto en borrador para el proveedor del usuario. Solo proveedores activos
 * (I-4). El proveedor sale de la sesión, nunca del cuerpo de la petición.
 */
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository,
    @Inject(SUPPLIER_PRODUCT_REPOSITORY) private readonly products: SupplierProductRepository,
  ) {}

  async execute(userId: string, input: SupplierProductCreateRequest): Promise<SupplierProduct> {
    const supplier = await requireActiveSupplierOf(this.suppliers, userId)
    const currency = input.basePrice.currency

    const product = SupplierProduct.draft({
      id: randomUUID(),
      supplierId: supplier.id,
      name: input.name,
      category: input.category,
      basePrice: Money.of(input.basePrice.amount, currency),
      colors: input.colors,
      sizes: input.sizes,
      printOptions: input.printOptions.map((option) => ({
        technique: option.technique,
        sizes: option.sizes,
        placements: option.placements,
        unitFee: Money.of(option.unitFee.amount, option.unitFee.currency),
      })),
    })
    await this.products.save(product)
    return product
  }
}
