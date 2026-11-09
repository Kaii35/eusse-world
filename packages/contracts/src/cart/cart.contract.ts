import { z } from 'zod'

import { uuidSchema } from '../shared/primitives'
import { printTechniqueSchema } from '../suppliers/supplier.contract'

/**
 * Contratos del carrito (RFC-0006, RFC-0016 §4.3).
 *
 * El cuerpo NUNCA lleva un precio: el servidor lo cotiza al agregar la línea y lo congela.
 */

/** Estampado elegido para una línea. Debe ser una de las opciones del proveedor. */
export const printChoiceSchema = z.object({
  technique: printTechniqueSchema,
  size: z.string().trim().min(1).max(16),
  placement: z.string().trim().min(1).max(80),
})

export type PrintChoiceDto = z.infer<typeof printChoiceSchema>

/** Máximo de tallas distintas por línea y de unidades por talla. */
export const CART_LIMITS = { sizesPerLine: 30, unitsPerSize: 9999 } as const

export const cartLineAddRequest = z.object({
  productId: uuidSchema,
  color: z.string().trim().min(1).max(60),
  qtyBySize: z
    .record(
      z.string().trim().min(1).max(16),
      z.number().int().positive().max(CART_LIMITS.unitsPerSize),
    )
    .refine(
      (sizes) => {
        const count = Object.keys(sizes).length
        return count >= 1 && count <= CART_LIMITS.sizesPerLine
      },
      { message: 'Indica al menos una talla' },
    ),
  print: printChoiceSchema.nullable(),
})

export type CartLineAddRequest = z.infer<typeof cartLineAddRequest>
