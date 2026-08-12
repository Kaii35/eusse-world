import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'
import { USER_STATUS, User, type UserStatus } from '../../domain/user.entity'

import type { UserRepositoryPort } from '../../domain/ports/user.repository.port'
import type { User as UserRow } from '@prisma/client'

/**
 * Repositorio de usuarios sobre Prisma.
 *
 * Toda consulta pasa por `tx.client(...)` para que caiga dentro de la transacción abierta
 * por la unidad de trabajo, si la hay. Usar `this.prisma` directamente escaparía de la
 * transacción sin avisar.
 */
@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    // El email llega ya normalizado desde el dominio; la columna guarda la forma
    // normalizada. Buscar sin normalizar dejaría al usuario fuera de su propia cuenta.
    const row = await this.tx.client(this.prisma).user.findUnique({ where: { email } })
    return row ? toDomain(row) : null
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.tx.client(this.prisma).user.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async create(user: User): Promise<void> {
    const snapshot = user.toSnapshot()
    await this.tx.client(this.prisma).user.create({
      data: {
        id: snapshot.id,
        email: snapshot.email,
        passwordHash: snapshot.passwordHash,
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        status: snapshot.status,
        emailVerifiedAt: snapshot.emailVerifiedAt,
        lastLoginAt: snapshot.lastLoginAt,
      },
    })
  }

  async save(user: User): Promise<void> {
    const snapshot = user.toSnapshot()
    await this.tx.client(this.prisma).user.update({
      where: { id: snapshot.id },
      data: {
        passwordHash: snapshot.passwordHash,
        status: snapshot.status,
        emailVerifiedAt: snapshot.emailVerifiedAt,
        lastLoginAt: snapshot.lastLoginAt,
      },
    })
  }
}

function toDomain(row: UserRow): User {
  return User.fromSnapshot({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    firstName: row.firstName,
    lastName: row.lastName,
    status: toStatus(row.status),
    emailVerifiedAt: row.emailVerifiedAt,
    lastLoginAt: row.lastLoginAt,
  })
}

/**
 * La columna es `varchar`, no un enum de PostgreSQL: un valor desconocido es posible si
 * alguien escribe a mano. Se resuelve al estado más restrictivo, no al más permisivo.
 */
function toStatus(value: string): UserStatus {
  return value === USER_STATUS.ACTIVE ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED
}
