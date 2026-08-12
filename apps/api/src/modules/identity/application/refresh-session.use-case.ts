import { Inject, Injectable } from '@nestjs/common'

import { ACCOUNTS_PORT, type AccountsPort } from '../../accounts/public/accounts.port'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from '../domain/ports/session.repository.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import {
  SessionExpiredError,
  evaluateRefresh,
  refreshExpiryFrom,
} from '../domain/refresh-token-family'

import { isStillActive, pickActiveAccount } from './active-account'
import { SessionIssuer } from './session-issuer'

export type RefreshResult = {
  readonly sessionId: string
  readonly accessToken: string
  readonly accessExpiresAt: Date
  readonly refreshToken: string
  readonly refreshExpiresAt: Date
  readonly activeAccountId: string | null
}

/**
 * Renovación de sesión con rotación y detección de reutilización (RFC-0003 §4.3).
 *
 * Es el caso de uso más delicado del módulo. Todo lo que no encaja termina igual —
 * `AUTH_SESSION_EXPIRED`— porque cualquier distinción le diría a un atacante en qué punto
 * exacto fue descubierto.
 */
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
    @Inject(ACCOUNTS_PORT) private readonly accounts: AccountsPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
    private readonly issuer: SessionIssuer,
  ) {}

  async execute(presentedToken: string): Promise<RefreshResult> {
    const now = this.clock.now()
    const stored = await this.sessions.findRefreshByHash(this.tokens.hashOf(presentedToken))

    if (!stored) throw new SessionExpiredError('El token no existe')

    const outcome = evaluateRefresh(stored, now)
    if (outcome.kind === 'reuse_detected') {
      // Dos copias del token en circulación. No se puede saber cuál es la legítima:
      // se cae la familia entera y ambos vuelven a autenticarse.
      await this.sessions.revokeFamily(outcome.familyId, now)
      throw new SessionExpiredError('Token reutilizado: se revocó la familia')
    }

    const session = await this.sessions.findSession(stored.sessionId)
    if (!session) throw new SessionExpiredError('La sesión no existe')
    // Un logout revoca la sesión pero el refresh sigue existiendo en la cookie del cliente:
    // sin esta comprobación, cerrar sesión no cerraría nada.
    if (session.revokedAt !== null) throw new SessionExpiredError('La sesión fue revocada')

    const next = this.tokens.generate()
    const refreshExpiresAt = refreshExpiryFrom(now)

    const rotated = await this.sessions.rotate(
      stored.id,
      {
        id: this.tokens.newId(),
        sessionId: stored.sessionId,
        // Misma familia: es lo que permite detectar la reutilización más adelante.
        familyId: stored.familyId,
        hash: next.hash,
        expiresAt: refreshExpiresAt,
        createdAt: now,
      },
      now,
    )

    if (!rotated) {
      // Otra petición rotó este mismo token entre la lectura y la escritura. Desde el
      // servidor es indistinguible de una reutilización, así que se trata como tal: se
      // falla cerrado. El coste es un reinicio de sesión si un cliente lanza dos refresh
      // en paralelo; el coste de acertar al revés es dejar dentro a un atacante.
      await this.sessions.revokeFamily(stored.familyId, now)
      throw new SessionExpiredError('Rotación concurrente del mismo token')
    }

    // La cuenta activa se reevalúa en cada renovación: si el staff suspendió la cuenta
    // hace diez minutos, la sesión deja de operar en ella ahora, no dentro de 30 días.
    const memberships = await this.accounts.membershipsOf(stored.userId)
    const activeAccountId = isStillActive(memberships, session.activeAccountId)
      ? session.activeAccountId
      : pickActiveAccount(memberships)

    if (activeAccountId !== session.activeAccountId) {
      await this.sessions.setActiveAccount(stored.sessionId, activeAccountId, now)
    }

    const grant = await this.issuer.grant({
      userId: stored.userId,
      sessionId: stored.sessionId,
      activeAccountId,
      now,
    })

    return {
      sessionId: stored.sessionId,
      accessToken: grant.accessToken,
      accessExpiresAt: grant.accessExpiresAt,
      refreshToken: next.value,
      refreshExpiresAt,
      activeAccountId,
    }
  }
}
