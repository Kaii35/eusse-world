/**
 * Formas de respuesta de la API que usa la interfaz. Espejan las funciones `toDto` del
 * backend; cualquier cambio allí se refleja aquí.
 */

export type SupplierStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type PrintTechnique = 'DTF' | 'SCREEN' | 'EMBROIDERY' | 'SUBLIMATION'
export type Currency = 'COP' | 'USD' | 'EUR'

export type Money = { amount: number; currency: Currency }

/** Proveedor visto por el propio proveedor: incluye su documento tributario. */
export type OwnSupplier = {
  id: string
  legalName: string
  taxId: string
  status: SupplierStatus
  rejectionReason: string | null
  approvedAt: string | null
}

/** Proveedor visto por un comerciante: sin documento tributario. */
export type PublicSupplier = {
  id: string
  legalName: string
  status: SupplierStatus
}

export type PrintOption = {
  technique: PrintTechnique
  sizes: string[]
  placements: string[]
  unitFee: Money
}

export type Product = {
  id: string
  supplierId: string
  name: string
  category: string
  basePrice: Money
  colors: string[]
  sizes: string[]
  printOptions: PrintOption[]
  status: ProductStatus
}

export type PrintChoice = { technique: PrintTechnique; size: string; placement: string }

export type CartLine = {
  id: string
  productId: string
  supplierId: string
  color: string
  qtyBySize: Record<string, number>
  print: PrintChoice | null
  unitPrice: Money
  /** Total de la línea calculado por el servidor. */
  lineTotal: Money
  pricedAt: string
}

export type SupplierMinimum = {
  supplierId: string
  units: number
  required: number
  met: boolean
  missing: number
  /** Subtotal del proveedor calculado por el servidor. */
  subtotal: Money
}

export type Cart = { lines: CartLine[]; suppliers: SupplierMinimum[] }

export type Me = {
  userId: string
  activeAccountId: string | null
  memberships: unknown[]
}
