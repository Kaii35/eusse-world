import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'

import type { UnitOfWorkPort } from '../../domain/ports/unit-of-work.port'

@Injectable()
export class PrismaUnitOfWork implements UnitOfWorkPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
  ) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    // Ya estamos dentro de una transacción: se reutiliza. PostgreSQL no anida
    // transacciones de verdad, y abrir una segunda con Prisma agotaría el pool en cuanto
    // dos casos de uso se compongan.
    if (this.tx.current) return work()

    return this.prisma.$transaction((client) => this.tx.run(client, work), {
      // Un registro toca usuario, cuenta, membresía, token y outbox. Con el valor por
      // defecto de 5 s, Argon2id más cinco escrituras se acerca demasiado al límite.
      timeout: 15_000,
    })
  }
}
