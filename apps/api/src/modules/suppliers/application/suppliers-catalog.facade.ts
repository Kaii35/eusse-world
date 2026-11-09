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
import { PRODUCT_STATUS } from '../domain/supplier-product.entity'

import type {
  LineQuote,
  LineQuoteRequest,
  SuppliersCatalogPort,
} from '../public/suppliers-catalog.port'

@Injectable()
export class SuppliersCatalogFacade implements SuppliersCatalogPort {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository,
    @Inject(SUPPLIER_PRODUCT_REPOSITORY) private readonly products: SupplierProductRepository,
  ) {}

  async quoteLine(request: LineQuoteRequest): Promise<LineQuote> {
    const product = await this.products.findById(request.productId)
    if (product?.status !== PRODUCT_STATUS.PUBLISHED) {
      throw new NotFoundError('Producto')
    }
    const supplier = await this.suppliers.findById(product.supplierId)
    if (!supplier?.canAcceptOrders()) throw new NotFoundError('Producto')

    product.assertOrderable(request.color, request.sizes)
    const unitPrice = product.unitPriceFor(request.print)

    return { productId: product.id, supplierId: product.supplierId, unitPrice }
  }
}
