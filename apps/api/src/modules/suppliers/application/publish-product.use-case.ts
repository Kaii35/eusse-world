import { Inject, Injectable } from '@nestjs/common'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'
import {
  SUPPLIER_PRODUCT_REPOSITORY,
  type SupplierProductRepository,
} from '../domain/ports/supplier-product.repository.port'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'

import { requireActiveSupplierOf } from './require-supplier'

import type { SupplierProduct } from '../domain/supplier-product.entity'

/**
 * Publica un producto del proveedor del usuario. Un producto ajeno responde 404, nunca 403:
 * un 403 confirmaría que el identificador existe (skills/security.md).
 */
@Injectable()
export class PublishProductUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository,
    @Inject(SUPPLIER_PRODUCT_REPOSITORY) private readonly products: SupplierProductRepository,
  ) {}

  async execute(userId: string, productId: string): Promise<SupplierProduct> {
    const supplier = await requireActiveSupplierOf(this.suppliers, userId)
    const product = await this.products.findById(productId)
    if (product?.supplierId !== supplier.id) {
      throw new NotFoundError('Producto')
    }

    const published = product.publish()
    await this.products.save(published)
    return published
  }
}
