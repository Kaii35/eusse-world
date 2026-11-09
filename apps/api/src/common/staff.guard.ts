import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common'

import { ENV } from '../config/config.module'
import { DomainError } from '../shared-kernel/domain/domain-error'

import type { AuthedRequest } from './auth.guard'
import type { Env } from '../config/env.schema'

/**
 * Sólo Operaciones. Debe usarse después de `AuthGuard`.
 *
 * TEMPORAL: la lista viene de `OPS_USER_IDS`. Se sustituye por roles de staff en Identity
 * (RFC-0003). Un usuario fuera de la lista recibe 403 sin más detalle.
 */
@Injectable()
export class StaffGuard implements CanActivate {
  constructor(@Inject(ENV) private readonly env: Env) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>()
    const userId = request.auth?.userId
    if (!userId || !this.env.OPS_USER_IDS.includes(userId)) {
      throw new DomainError('AUTH_FORBIDDEN', 'No tienes permiso para esta operación')
    }
    return true
  }
}
