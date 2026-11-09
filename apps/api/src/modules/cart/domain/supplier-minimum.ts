import { SUPPLIER_MINIMUM_UNITS, type CartSupplierMinimum } from '@eusse/contracts'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Regla de mínimo por proveedor (RFC-0016 §4.1, invariante I-1; regla R-01).
 *
 * El mínimo se cuenta por proveedor, no sobre el total del carrito: 6 camisetas de un
 * proveedor más 6 sudaderas de otro no cumplen con ninguno.
 *
 * Funciones puras: el carrito las usa para mostrar el progreso y el checkout para
 * revalidar antes de cobrar. Así la regla vive en un solo sitio.
 */

export type MinimumLine = {
  readonly supplierId: string
  /** Unidades de la línea, ya sumadas por talla. Entero positivo. */
  readonly quantity: number
}

/**
 * Estado de cada proveedor del carrito, en el orden en que aparece por primera vez.
 * Un proveedor con líneas siempre aparece, aunque no cumpla.
 */
export function evaluateSupplierMinimums(lines: readonly MinimumLine[]): CartSupplierMinimum[] {
  const units = new Map<string, number>()
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new DomainError(
        'COMMON_VALIDATION_FAILED',
        'La cantidad de una línea debe ser un entero positivo',
        { supplierId: line.supplierId, field: 'quantity' },
      )
    }
    units.set(line.supplierId, (units.get(line.supplierId) ?? 0) + line.quantity)
  }

  return [...units.entries()].map(([supplierId, total]) => {
    const missing = Math.max(0, SUPPLIER_MINIMUM_UNITS - total)
    return {
      supplierId,
      units: total,
      required: SUPPLIER_MINIMUM_UNITS,
      met: missing === 0,
      missing,
    }
  })
}

/**
 * Lanza si algún proveedor no llega al mínimo. El error lleva la lista completa de
 * proveedores que faltan, para que la interfaz muestre todos a la vez.
 */
export function assertSupplierMinimumsMet(lines: readonly MinimumLine[]): void {
  if (lines.length === 0) {
    throw new DomainError('CART_EMPTY', 'El carrito está vacío')
  }
  const failing = evaluateSupplierMinimums(lines).filter((s) => !s.met)
  if (failing.length > 0) {
    throw new DomainError(
      'CART_SUPPLIER_MINIMUM_NOT_MET',
      `Hay proveedores que no llegan al mínimo de ${SUPPLIER_MINIMUM_UNITS} unidades`,
      { suppliers: failing },
    )
  }
}
