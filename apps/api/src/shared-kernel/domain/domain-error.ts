import type { ErrorCode } from '@eusse/contracts'

/**
 * Error de dominio.
 *
 * Todo fallo de negocio se expresa así, NUNCA con `throw new Error('algo falló')`:
 * un error sin código estable no se puede traducir ni permite que el frontend reaccione
 * (docs/02-domain-model.md §6).
 *
 * `meta` lleva los datos que la interfaz necesita para ofrecer la corrección concreta:
 * "Se vende en cajas de 6" en lugar de "Valor inválido".
 *
 * Este archivo vive en `shared-kernel/domain/`: sin NestJS, sin Prisma, sin HTTP.
 */
export class DomainError extends Error {
  override readonly name: string = 'DomainError'

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly meta?: Readonly<Record<string, unknown>>,
  ) {
    super(message)
  }
}

/** El recurso existe pero no pertenece a la cuenta de la sesión, o no existe. */
export class NotFoundError extends DomainError {
  override readonly name = 'NotFoundError'

  constructor(resource: string, meta?: Readonly<Record<string, unknown>>) {
    // Se responde 404 y no 403: un 403 confirmaría la existencia del recurso ajeno.
    super('COMMON_NOT_FOUND', `${resource} no encontrado`, meta)
  }
}

/** El actor no tiene permiso para esta operación sobre este recurso. */
export class ForbiddenError extends DomainError {
  override readonly name = 'ForbiddenError'

  constructor(message = 'No tienes permiso para realizar esta operación') {
    super('AUTH_FORBIDDEN', message)
  }
}

/** Transición de estado no permitida por la máquina de estados del agregado. */
export class InvalidStateTransitionError extends DomainError {
  override readonly name = 'InvalidStateTransitionError'

  constructor(aggregate: string, from: string, to: string) {
    super('ORDER_INVALID_TRANSITION', `${aggregate} no puede pasar de ${from} a ${to}`, {
      aggregate,
      from,
      to,
    })
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}
