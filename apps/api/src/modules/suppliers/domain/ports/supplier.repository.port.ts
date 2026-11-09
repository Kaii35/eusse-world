import type { Supplier } from '../supplier.entity'

/** Puerto de persistencia de `Supplier`. La implementación vive en `infrastructure/`. */
export type SupplierRepository = {
  findById(id: string): Promise<Supplier | null>

  /** Proveedor que administra un usuario, si lo hay. */
  findByMemberUserId(userId: string): Promise<Supplier | null>

  findByTaxId(taxId: string): Promise<Supplier | null>

  listActive(): Promise<Supplier[]>

  /** Alta de proveedor y de su usuario administrador, en una sola transacción. */
  insertWithMember(supplier: Supplier, memberUserId: string): Promise<void>

  /** Actualiza estado y datos de auditoría. */
  update(supplier: Supplier): Promise<void>
}

export const SUPPLIER_REPOSITORY = Symbol('SUPPLIER_REPOSITORY')
