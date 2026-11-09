import { DomainError } from '../shared-kernel/domain/domain-error'

import type { z } from 'zod'

/**
 * Valida el cuerpo de una petición con su contrato de `@eusse/contracts` (ADR-0009). Un
 * fallo devuelve 400 con la lista de campos, para que la interfaz marque cada uno.
 */
export function parseBody<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new DomainError('COMMON_VALIDATION_FAILED', 'Revisa los datos enviados', {
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }
  return result.data
}
