import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'
import {
  TOKEN_PURPOSE,
  type StoredOneTimeToken,
  type TokenPurpose,
} from '../../domain/one-time-token'

import type { OneTimeTokenRepositoryPort } from '../../domain/ports/one-time-token.repository.port'
import type { OneTimeToken as TokenRow } from '@prisma/client'

@Injectable()
export class PrismaOneTimeTokenRepository implements OneTimeTokenRepositoryPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
  ) {}

  async create(token: StoredOneTimeToken): Promise<void> {
    await this.tx.client(this.prisma).oneTimeToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        purpose: token.purpose,
        tokenHash: token.hash,
        expiresAt: token.expiresAt,
        consumedAt: token.consumedAt,
      },
    })
  }

  async findByHash(hash: string): Promise<StoredOneTimeToken | null> {
    const row = await this.tx
      .client(this.prisma)
      .oneTimeToken.findUnique({ where: { tokenHash: hash } })
    return row ? toDomain(row) : null
  }

  async consume(tokenId: string, at: Date): Promise<boolean> {
    // La condición va EN EL `WHERE`, no en un `if` previo: dos peticiones simultáneas con
    // el mismo enlace llegarían aquí a la vez y ambas habrían pasado la validación. Sólo
    // una puede actualizar una fila con `consumed_at IS NULL`.
    const { count } = await this.tx.client(this.prisma).oneTimeToken.updateMany({
      where: { id: tokenId, consumedAt: null },
      data: { consumedAt: at },
    })
    return count === 1
  }

  async invalidateAllFor(userId: string, purpose: TokenPurpose, at: Date): Promise<void> {
    await this.tx.client(this.prisma).oneTimeToken.updateMany({
      where: { userId, purpose, consumedAt: null },
      data: { consumedAt: at },
    })
  }
}

function toDomain(row: TokenRow): StoredOneTimeToken {
  return {
    id: row.id,
    userId: row.userId,
    purpose: toPurpose(row.purpose),
    hash: row.tokenHash,
    expiresAt: row.expiresAt,
    consumedAt: row.consumedAt,
  }
}

/**
 * Un propósito desconocido se resuelve como verificación de correo, el menos poderoso de
 * los dos: nunca se degrada un token raro a "sirve para cambiar la contraseña".
 */
function toPurpose(value: string): TokenPurpose {
  return value === TOKEN_PURPOSE.PASSWORD_RESET
    ? TOKEN_PURPOSE.PASSWORD_RESET
    : TOKEN_PURPOSE.EMAIL_VERIFICATION
}
