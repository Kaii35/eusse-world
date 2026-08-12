import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'
import { TOKEN_STATE, type TokenState } from '../../domain/refresh-token-family'

import type {
  NewRefreshToken,
  NewSession,
  SessionRecord,
  SessionRepositoryPort,
  StoredRefreshToken,
} from '../../domain/ports/session.repository.port'
import type { RefreshToken as TokenRow } from '@prisma/client'

@Injectable()
export class PrismaSessionRepository implements SessionRepositoryPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
  ) {}

  async openSession(session: NewSession, refresh: NewRefreshToken): Promise<void> {
    // Sesión y primer token en la misma escritura: una sesión sin token no se puede
    // renovar y nadie la limpiaría.
    await this.tx.client(this.prisma).session.create({
      data: {
        id: session.id,
        userId: session.userId,
        activeAccountId: session.activeAccountId,
        ip: session.ip,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        lastSeenAt: session.createdAt,
        refreshTokens: {
          create: {
            id: refresh.id,
            familyId: refresh.familyId,
            userId: session.userId,
            tokenHash: refresh.hash,
            state: TOKEN_STATE.ACTIVE,
            expiresAt: refresh.expiresAt,
            createdAt: refresh.createdAt,
          },
        },
      },
    })
  }

  async findSession(sessionId: string): Promise<SessionRecord | null> {
    const row = await this.tx.client(this.prisma).session.findUnique({ where: { id: sessionId } })
    if (!row) return null

    return {
      id: row.id,
      userId: row.userId,
      activeAccountId: row.activeAccountId,
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
      revokedAt: row.revokedAt,
    }
  }

  async findRefreshByHash(hash: string): Promise<StoredRefreshToken | null> {
    const row = await this.tx
      .client(this.prisma)
      .refreshToken.findUnique({ where: { tokenHash: hash } })
    return row ? toDomain(row) : null
  }

  async rotate(usedTokenId: string, next: NewRefreshToken, usedAt: Date): Promise<boolean> {
    const client = this.tx.client(this.prisma)

    // `state: 'ACTIVE'` en el WHERE es lo que resuelve la carrera: si dos peticiones
    // presentan el mismo token a la vez, sólo una actualiza una fila. La otra recibe
    // `count === 0` y el caso de uso la trata como reutilización.
    const { count } = await client.refreshToken.updateMany({
      where: { id: usedTokenId, state: TOKEN_STATE.ACTIVE },
      data: { state: TOKEN_STATE.USED, usedAt },
    })

    if (count !== 1) return false

    const session = await client.session.findUniqueOrThrow({
      where: { id: next.sessionId },
      select: { userId: true },
    })

    await client.refreshToken.create({
      data: {
        id: next.id,
        sessionId: next.sessionId,
        familyId: next.familyId,
        userId: session.userId,
        tokenHash: next.hash,
        state: TOKEN_STATE.ACTIVE,
        expiresAt: next.expiresAt,
        createdAt: next.createdAt,
      },
    })

    await client.session.update({
      where: { id: next.sessionId },
      data: { lastSeenAt: usedAt },
    })

    return true
  }

  async revokeFamily(familyId: string, at: Date): Promise<void> {
    const client = this.tx.client(this.prisma)

    const tokens = await client.refreshToken.findMany({
      where: { familyId },
      select: { sessionId: true },
    })

    await client.refreshToken.updateMany({
      where: { familyId },
      data: { state: TOKEN_STATE.REVOKED, revokedAt: at },
    })

    // La sesión también cae: dejar viva la sesión de una familia revocada permitiría
    // seguir usando el access token en curso hasta 15 minutos después del robo.
    const sessionIds = [...new Set(tokens.map((token) => token.sessionId))]
    if (sessionIds.length > 0) {
      await client.session.updateMany({
        where: { id: { in: sessionIds }, revokedAt: null },
        data: { revokedAt: at },
      })
    }
  }

  async revokeSession(sessionId: string, at: Date): Promise<void> {
    const client = this.tx.client(this.prisma)

    await client.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: at },
    })
    await client.refreshToken.updateMany({
      where: { sessionId, state: { not: TOKEN_STATE.REVOKED } },
      data: { state: TOKEN_STATE.REVOKED, revokedAt: at },
    })
  }

  async revokeAllForUser(userId: string, at: Date): Promise<void> {
    const client = this.tx.client(this.prisma)

    await client.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: at },
    })
    await client.refreshToken.updateMany({
      where: { userId, state: { not: TOKEN_STATE.REVOKED } },
      data: { state: TOKEN_STATE.REVOKED, revokedAt: at },
    })
  }

  async setActiveAccount(sessionId: string, accountId: string | null, at: Date): Promise<void> {
    await this.tx.client(this.prisma).session.update({
      where: { id: sessionId },
      data: { activeAccountId: accountId, lastSeenAt: at },
    })
  }
}

function toDomain(row: TokenRow): StoredRefreshToken {
  return {
    id: row.id,
    familyId: row.familyId,
    state: toState(row.state),
    expiresAt: row.expiresAt,
    sessionId: row.sessionId,
    userId: row.userId,
  }
}

/**
 * Un estado desconocido se trata como `REVOKED`.
 *
 * Fallar cerrado: si una fila trae basura, lo peor que pasa es que alguien tenga que
 * volver a entrar. Resolverlo a `ACTIVE` dejaría pasar un token que nadie emitió.
 */
function toState(value: string): TokenState {
  if (value === TOKEN_STATE.ACTIVE) return TOKEN_STATE.ACTIVE
  if (value === TOKEN_STATE.USED) return TOKEN_STATE.USED
  return TOKEN_STATE.REVOKED
}
