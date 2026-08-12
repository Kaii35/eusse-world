import { Inject, Injectable } from '@nestjs/common'

import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from '../domain/ports/session.repository.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'

/**
 * Cierre de sesión.
 *
 * Invalida la sesión **en el servidor**, no sólo borra la cookie: una sesión que sigue
 * siendo válida tras el logout es un fallo clásico, y el usuario que cierra sesión en un
 * ordenador compartido cree lo contrario.
 *
 * Es idempotente y nunca falla. Responder distinto según si el token existía convertiría
 * el logout en un oráculo de tokens válidos.
 */
@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
  ) {}

  async execute(presentedToken: string | null): Promise<void> {
    if (!presentedToken) return

    const stored = await this.sessions.findRefreshByHash(this.tokens.hashOf(presentedToken))
    if (!stored) return

    const now = this.clock.now()
    // La familia entera, no sólo el token presentado: si quedara vivo cualquier
    // descendiente, la sesión se podría renovar después del logout.
    await this.sessions.revokeFamily(stored.familyId, now)
    await this.sessions.revokeSession(stored.sessionId, now)
  }
}
