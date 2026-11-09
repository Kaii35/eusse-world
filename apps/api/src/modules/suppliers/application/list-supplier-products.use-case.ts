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
import { PRODUCT_STATUS, type SupplierProduct } from '../domain/supplier-product.entity'

/**
 * Catálogo publicado de un proveedor activo, para los comerciantes. Un proveedor que no
 * está activo responde 404: no se revela que existe ni qué vendía.
 */
@Injectable()
export class ListSupplierProductsUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository,
    @Inject(SUPPLIER_PRODUCT_REPOSITORY) private readonly products: SupplierProductRepository,
  ) {}

  async execute(supplierId: string): Promise<SupplierProduct[]> {
    const supplier = await this.suppliers.findById(supplierId)
    if (!supplier?.canAcceptOrders()) throw new NotFoundError('Proveedor')

    const all = await this.products.listBySupplier(supplierId)
    return all.filter((product) => product.status === PRODUCT_STATUS.PUBLISHED)
  }
}
