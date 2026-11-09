import type { SupplierProduct } from '../supplier-product.entity'

/** Puerto de persistencia de `SupplierProduct`. */
export type SupplierProductRepository = {
  findById(id: string): Promise<SupplierProduct | null>

  /** Todos los productos de un proveedor, cualquiera que sea su estado. */
  listBySupplier(supplierId: string): Promise<SupplierProduct[]>

  /** Crea o actualiza el producto y sus estampados. */
  save(product: SupplierProduct): Promise<void>
}

export const SUPPLIER_PRODUCT_REPOSITORY = Symbol('SUPPLIER_PRODUCT_REPOSITORY')
