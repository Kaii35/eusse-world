import { z } from 'zod'

import { moneySchema, uuidSchema } from '../shared/primitives'

/**
 * Contratos del marketplace mayorista (RFC-0016 §4.3).
 *
 * El cuerpo de una petición nunca lleva `supplierId`, `accountId` ni importes calculados:
 * el proveedor sale de la sesión y el precio lo calcula el servidor.
 */

/** Ciclo de vida de un proveedor (RFC-0016 §4.6). */
export const SUPPLIER_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const

export type SupplierStatus = (typeof SUPPLIER_STATUS)[keyof typeof SUPPLIER_STATUS]

export const supplierStatusSchema = z.enum([
  SUPPLIER_STATUS.PENDING_REVIEW,
  SUPPLIER_STATUS.ACTIVE,
  SUPPLIER_STATUS.REJECTED,
  SUPPLIER_STATUS.SUSPENDED,
])

/** Técnicas de estampado que un proveedor puede ofrecer (RFC-0016 §4.1). */
export const PRINT_TECHNIQUE = {
  DTF: 'DTF',
  SCREEN: 'SCREEN',
  EMBROIDERY: 'EMBROIDERY',
  SUBLIMATION: 'SUBLIMATION',
} as const

export type PrintTechnique = (typeof PRINT_TECHNIQUE)[keyof typeof PRINT_TECHNIQUE]

export const printTechniqueSchema = z.enum([
  PRINT_TECHNIQUE.DTF,
  PRINT_TECHNIQUE.SCREEN,
  PRINT_TECHNIQUE.EMBROIDERY,
  PRINT_TECHNIQUE.SUBLIMATION,
])

/** Unidades mínimas por proveedor en cada pedido (regla R-01 del análisis funcional). */
export const SUPPLIER_MINIMUM_UNITS = 6

/** Límites de texto. Se validan aquí y en el dominio, con el mismo valor. */
export const SUPPLIER_TEXT_LIMITS = {
  legalName: 200,
  taxId: 32,
  productName: 200,
  category: 80,
  colorName: 60,
  sizeLabel: 16,
  placementLabel: 80,
} as const

export const supplierRegistrationRequest = z.object({
  legalName: z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.legalName),
  taxId: z.string().trim().min(3).max(SUPPLIER_TEXT_LIMITS.taxId),
  phone: z.string().trim().max(32).optional(),
})

export type SupplierRegistrationRequest = z.infer<typeof supplierRegistrationRequest>

/** Opción de estampado que el proveedor ofrece para un producto. */
export const printOptionSchema = z.object({
  technique: printTechniqueSchema,
  sizes: z.array(z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.sizeLabel)).min(1).max(10),
  placements: z
    .array(z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.placementLabel))
    .min(1)
    .max(10),
  unitFee: moneySchema,
})

export type PrintOptionDto = z.infer<typeof printOptionSchema>

export const supplierProductCreateRequest = z.object({
  name: z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.productName),
  category: z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.category),
  basePrice: moneySchema,
  colors: z.array(z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.colorName)).min(0).max(50),
  sizes: z.array(z.string().trim().min(1).max(SUPPLIER_TEXT_LIMITS.sizeLabel)).min(0).max(30),
  printOptions: z.array(printOptionSchema).max(4),
})

export type SupplierProductCreateRequest = z.infer<typeof supplierProductCreateRequest>

/**
 * Estado de mínimo de un proveedor dentro del carrito. Lo calcula el servidor y la interfaz
 * lo muestra tal cual: "faltan N unidades" no se recalcula en el cliente.
 */
export const cartSupplierMinimumSchema = z.object({
  supplierId: uuidSchema,
  units: z.number().int().nonnegative(),
  required: z.literal(SUPPLIER_MINIMUM_UNITS),
  met: z.boolean(),
  missing: z.number().int().nonnegative(),
})

export type CartSupplierMinimum = z.infer<typeof cartSupplierMinimumSchema>

/** Decisión de Operaciones sobre un proveedor. Rechazar y suspender exigen motivo. */
export const supplierDecisionRequest = z.discriminatedUnion('action', [
  z.object({ action: z.literal('APPROVE') }),
  z.object({ action: z.literal('REJECT'), reason: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal('SUSPEND'), reason: z.string().trim().min(1).max(500) }),
  z.object({ action: z.literal('REACTIVATE') }),
])

export type SupplierDecisionRequest = z.infer<typeof supplierDecisionRequest>
