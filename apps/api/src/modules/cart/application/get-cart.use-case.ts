import { Inject, Injectable } from '@nestjs/common'

import type { CartSupplierMinimum } from '@eusse/contracts'

import { lineUnits, type CartLine } from '../domain/cart-line'
import {
  CART_LINE_REPOSITORY,
  type CartLineRepository,
} from '../domain/ports/cart-line.repository.port'
import { evaluateSupplierMinimums, type MinimumLine } from '../domain/supplier-minimum'

export type CartView = {
  readonly lines: readonly CartLine[]
  /** Mínimo por proveedor, calculado aquí. La interfaz lo muestra tal cual. */
  readonly suppliers: readonly CartSupplierMinimum[]
}

/** Carrito del usuario con el estado de mínimo de cada proveedor (R-01). */
@Injectable()
export class GetCartUseCase {
  constructor(@Inject(CART_LINE_REPOSITORY) private readonly lines: CartLineRepository) {}

  async execute(ownerUserId: string): Promise<CartView> {
    const lines = await this.lines.listByOwner(ownerUserId)
    const minimumLines: MinimumLine[] = lines.map((line) => ({
      supplierId: line.supplierId,
      quantity: lineUnits(line),
    }))
    return { lines, suppliers: evaluateSupplierMinimums(minimumLines) }
  }
}
