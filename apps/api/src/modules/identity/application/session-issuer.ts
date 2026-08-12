import { Inject, Injectable } from '@nestjs/common'

import { ACCESS_TOKEN, type AccessTokenPort } from '../domain/ports/access-token.port'
import { CLOCK, type ClockPort } from '../domain/ports/clock.port'
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from '../domain/ports/session.repository.port'
import { TENANT_ID } from '../domain/ports/tenant.port'
import { TOKEN_GENERATOR, type TokenGeneratorPort } from '../domain/ports/token-generator.port'
import { accessExpiryFrom, refreshExpiryFrom } from '../domain/refresh-token-family'

/**
 * Emisión de sesiones: el único sitio donde nacen los tokens.
 *
 * Está centralizado a propósito. Si cada caso de uso montara su propia sesión, tarde o
 * temprano uno olvidaría guardar sólo el hash del refresh, o le pondría una caducidad
 * distinta, y el fallo no se vería hasta que fuese explotado.
 */

export type IssuedSession = {
  readonly sessionId: string
  readonly accessToken: string
  readonly accessExpiresAt: Date
  /** Valor en claro. Sólo viaja a la cookie; en la base de datos queda su hash. */
  readonly refreshToken: string
  readonly refreshExpiresAt: Date
}

export type AccessGrant = {
  readonly accessToken: string
  readonly accessExpiresAt: Date
}

@Injectable()
export class SessionIssuer {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepositoryPort,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGeneratorPort,
    @Inject(ACCESS_TOKEN) private readonly access: AccessTokenPort,
    @Inject(CLOCK) private readonly clock: ClockPort,
    @Inject(TENANT_ID) private readonly tenantId: string,
  ) {}

  async open(params: {
    userId: string
    activeAccountId: string | null
    ip: string | null
    userAgent: string | null
  }): Promise<IssuedSession> {
    const now = this.clock.now()
    const sessionId = this.tokens.newId()
    const refresh = this.tokens.generate()
    const refreshExpiresAt = refreshExpiryFrom(now)

    await this.sessions.openSession(
      {
        id: sessionId,
        userId: params.userId,
        activeAccountId: params.activeAccountId,
        ip: params.ip,
        userAgent: params.userAgent,
        createdAt: now,
      },
      {
        id: this.tokens.newId(),
        sessionId,
        // Primera sesión, primera familia. Todas las rotaciones heredarán este id.
        familyId: this.tokens.newId(),
        hash: refresh.hash,
        expiresAt: refreshExpiresAt,
        createdAt: now,
      },
    )

    const grant = await this.grant({
      userId: params.userId,
      sessionId,
      activeAccountId: params.activeAccountId,
      now,
    })

    return {
      sessionId,
      accessToken: grant.accessToken,
      accessExpiresAt: grant.accessExpiresAt,
      refreshToken: refresh.value,
      refreshExpiresAt,
    }
  }

  /** Emite sólo el access token: rotación de refresh y cambio de cuenta activa. */
  async grant(params: {
    userId: string
    sessionId: string
    activeAccountId: string | null
    now?: Date
  }): Promise<AccessGrant> {
    const now = params.now ?? this.clock.now()
    const accessExpiresAt = accessExpiryFrom(now)

    const accessToken = await this.access.sign(
      {
        sub: params.userId,
        sid: params.sessionId,
        acc: params.activeAccountId,
        ten: this.tenantId,
      },
      accessExpiresAt,
    )

    return { accessToken, accessExpiresAt }
  }
}
