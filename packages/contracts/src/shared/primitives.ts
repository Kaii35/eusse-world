import { CURRENCIES } from '@eusse/domain'
import { z } from 'zod'

/**
 * Primitivos compartidos por todos los contratos.
 *
 * `@eusse/contracts` NO importa NestJS, React ni Prisma: es el único punto de encuentro
 * entre backend, frontend y (en Fase 4) móvil, y debe ser neutral (ADR-0009).
 */

/** UUID v7 con variante RFC 4122. Todo identificador del sistema lo es. */
export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Debe ser un UUID válido',
  )

/** SKU: mayúsculas, dígitos y guiones. El comprador B2B lo conoce de memoria. */
export const skuSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9][A-Z0-9-]{1,31}$/, 'SKU no válido')

export const currencySchema = z.enum(CURRENCIES)

/**
 * Importe monetario. `amount` es un ENTERO en la menor unidad (centavos).
 *
 * Nunca `float`, nunca un número suelto sin moneda (docs/03-conventions.md §5).
 */
export const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: currencySchema,
})

export type MoneyDto = z.infer<typeof moneySchema>

/** Fecha en UTC ISO-8601. La zona horaria se aplica sólo al formatear en la UI. */
export const isoDateTimeSchema = z.string().datetime({ offset: false })

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug no válido')

export const emailSchema = z.string().trim().toLowerCase().email().max(254)

/** Clave de idempotencia. Se genera al montar el formulario, no al pulsar enviar. */
export const idempotencyKeySchema = uuidSchema

export const localeSchema = z.enum(['es', 'en'])
export type Locale = z.infer<typeof localeSchema>
