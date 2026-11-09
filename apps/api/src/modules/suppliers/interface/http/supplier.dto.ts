import type { SupplierProduct } from '../../domain/supplier-product.entity'
import type { Supplier } from '../../domain/supplier.entity'

/**
 * Formas de respuesta. Cada una deja fuera lo que su lector no debe ver: el documento
 * tributario sólo lo ve el propio proveedor; un comerciante ve nombre y estado.
 */

export function toOwnSupplierDto(supplier: Supplier) {
  return {
    id: supplier.id,
    legalName: supplier.legalName,
    taxId: supplier.taxId,
    status: supplier.status,
    rejectionReason: supplier.rejectionReason,
    approvedAt: supplier.approvedAt?.toISOString() ?? null,
  }
}

export function toPublicSupplierDto(supplier: Supplier) {
  return {
    id: supplier.id,
    legalName: supplier.legalName,
    status: supplier.status,
  }
}

export function toProductDto(product: SupplierProduct) {
  return {
    id: product.id,
    supplierId: product.supplierId,
    name: product.name,
    category: product.category,
    basePrice: { amount: product.basePrice.amount, currency: product.basePrice.currency },
    colors: [...product.colors],
    sizes: [...product.sizes],
    printOptions: product.printOptions.map((option) => ({
      technique: option.technique,
      sizes: [...option.sizes],
      placements: [...option.placements],
      unitFee: { amount: option.unitFee.amount, currency: option.unitFee.currency },
    })),
    status: product.status,
  }
}
