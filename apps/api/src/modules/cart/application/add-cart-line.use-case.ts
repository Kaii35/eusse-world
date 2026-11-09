import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'

import type { CartLineAddRequest } from '@eusse/contracts'

import {
  SUPPLIERS_CATALOG_PORT,
  type SuppliersCatalogPort,
} from '../../suppliers/public/suppliers-catalog.port'
import { assertQtyBySize, type CartLine } from '../domain/cart-line'
import {
  CART_LINE_REPOSITORY,
  type CartLineRepository,
} from '../domain/ports/cart-line.repository.port'

/**
 * Agrega una línea al carrito del usuario. El precio lo cotiza Suppliers en el servidor y
 * se congela aquí: si el proveedor lo cambia después, la línea conserva el precio hasta la
 * revalidación de RFC-0006.
 */
@Injectable()
export class AddCartLineUseCase {
  constructor(
    @Inject(CART_LINE_REPOSITORY) private readonly lines: CartLineRepository,
    @Inject(SUPPLIERS_CATALOG_PORT) private readonly catalog: SuppliersCatalogPort,
  ) {}

  async execute(ownerUserId: string, input: CartLineAddRequest): Promise<CartLine> {
    assertQtyBySize(input.qtyBySize)

    const quote = await this.catalog.quoteLine({
      productId: input.productId,
      color: input.color,
      sizes: Object.keys(input.qtyBySize),
      print: input.print,
    })

    const line: CartLine = {
      id: randomUUID(),
      ownerUserId,
      productId: quote.productId,
      supplierId: quote.supplierId,
      color: input.color,
      qtyBySize: { ...input.qtyBySize },
      print: input.print,
      unitPrice: quote.unitPrice,
      pricedAt: new Date(),
    }
    await this.lines.insert(line)
    return line
  }
}
