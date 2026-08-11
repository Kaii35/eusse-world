import { z } from 'zod'

/**
 * Paginación por cursor (RFC-0012 §4.3).
 *
 * El offset queda prohibido: es inestable ante inserciones (duplicados y saltos) y su
 * coste crece con el número de página.
 */

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const cursorQuerySchema = z.object({
  /** Cursor opaco. El cliente no lo interpreta: lo devuelve tal cual. */
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
})

export type CursorQuery = z.infer<typeof cursorQuerySchema>

/**
 * Envoltorio de respuesta paginada.
 *
 * `totalCount` sólo se incluye si es barato de calcular. En listados grandes con filtros
 * un `COUNT(*)` puede costar más que la propia consulta, así que se omite.
 */
export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    totalCount: z.number().int().nonnegative().optional(),
  })
}

export type Paginated<T> = {
  items: T[]
  nextCursor: string | null
  totalCount?: number
}

/** Orden: `campo` ascendente, `-campo` descendente. */
export const sortSchema = z.string().regex(/^-?[a-zA-Z][a-zA-Z0-9]*$/, 'Orden no válido')

export function parseSort(value: string): { field: string; direction: 'asc' | 'desc' } {
  return value.startsWith('-')
    ? { field: value.slice(1), direction: 'desc' }
    : { field: value, direction: 'asc' }
}
