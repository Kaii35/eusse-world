import { CART_LIMITS, type PrintChoiceDto } from '@eusse/contracts'

import type { Money } from '@eusse/domain'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Línea del carrito: un producto con color, cantidades por talla, estampado opcional y el
 * precio por unidad congelado al agregarla (RFC-0006).
 *
 * Vive en `domain/`: sin NestJS, sin Prisma, sin HTTP.
 */
export type CartLine = {
  readonly id: string
  readonly ownerUserId: string
  readonly productId: string
  readonly supplierId: string
  readonly color: string
  readonly qtyBySize: Readonly<Record<string, number>>
  readonly print: PrintChoiceDto | null
  readonly unitPrice: Money
  readonly pricedAt: Date
}

/** Unidades de la línea: suma de todas sus tallas. */
export function lineUnits(line: Pick<CartLine, 'qtyBySize'>): number {
  return Object.values(line.qtyBySize).reduce((sum, qty) => sum + qty, 0)
}

/** Total de la línea: precio por unidad por unidades. */
export function lineTotal(line: CartLine): Money {
  return line.unitPrice.multiply(lineUnits(line))
}

/**
 * Valida las cantidades por talla. El contrato ya lo hace en la frontera; el dominio lo
 * repite porque una regla que sólo vive en la capa HTTP se salta con otro punto de entrada.
 */
export function assertQtyBySize(qtyBySize: Readonly<Record<string, number>>): void {
  const sizes = Object.keys(qtyBySize)
  if (sizes.length === 0 || sizes.length > CART_LIMITS.sizesPerLine) {
    throw new DomainError('COMMON_VALIDATION_FAILED', 'Indica al menos una talla', {
      field: 'qtyBySize',
    })
  }
  for (const size of sizes) {
    const qty = qtyBySize[size]
    if (qty === undefined || !Number.isInteger(qty) || qty <= 0 || qty > CART_LIMITS.unitsPerSize) {
      throw new DomainError(
        'COMMON_VALIDATION_FAILED',
        `Cantidad no válida para la talla ${size}`,
        {
          field: 'qtyBySize',
          size,
        },
      )
    }
  }
}
