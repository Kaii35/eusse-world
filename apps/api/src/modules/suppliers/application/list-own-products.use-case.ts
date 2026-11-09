import { Inject, Injectable } from '@nestjs/common'

import {
  SUPPLIER_PRODUCT_REPOSITORY,
  type SupplierProductRepository,
} from '../domain/ports/supplier-product.repository.port'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'

import { requireSupplierOf } from './require-supplier'

import type { SupplierProduct } from '../domain/supplier-product.entity'

/** Todos los productos del proveedor del usuario, en cualquier estado (borrador incluido). */
@Injectable()
export class ListOwnProductsUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository,
    @Inject(SUPPLIER_PRODUCT_REPOSITORY) private readonly products: SupplierProductRepository,
  ) {}

  async execute(userId: string): Promise<SupplierProduct[]> {
    const supplier = await requireSupplierOf(this.suppliers, userId)
    return this.products.listBySupplier(supplier.id)
  }
}
