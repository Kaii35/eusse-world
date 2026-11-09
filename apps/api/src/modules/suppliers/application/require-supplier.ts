import { DomainError, NotFoundError } from '../../../shared-kernel/domain/domain-error'

import type { SupplierRepository } from '../domain/ports/supplier.repository.port'
import type { Supplier } from '../domain/supplier.entity'

/**
 * Proveedor del usuario, que debe estar activo para operar. Sin proveedor: 404. Proveedor
 * no activo: SUPPLIER_NOT_ACTIVE, porque el usuario sí es suyo y puede entender el motivo.
 */
export async function requireActiveSupplierOf(
  suppliers: SupplierRepository,
  userId: string,
): Promise<Supplier> {
  const supplier = await suppliers.findByMemberUserId(userId)
  if (!supplier) throw new NotFoundError('Proveedor')
  if (!supplier.canAcceptOrders()) {
    throw new DomainError('SUPPLIER_NOT_ACTIVE', 'Tu proveedor todavía no está activo', {
      status: supplier.status,
    })
  }
  return supplier
}

/** Proveedor del usuario sin exigir estado activo: para leer su propio panel. */
export async function requireSupplierOf(
  suppliers: SupplierRepository,
  userId: string,
): Promise<Supplier> {
  const supplier = await suppliers.findByMemberUserId(userId)
  if (!supplier) throw new NotFoundError('Proveedor')
  return supplier
}
