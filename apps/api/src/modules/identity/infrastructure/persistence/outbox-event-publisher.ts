import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'

import { getCorrelationId } from '../../../../common/correlation-id.middleware'
import { ENV } from '../../../../config/config.module'
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'

import type { Env } from '../../../../config/env.schema'
import type { DomainEventInput, EventPublisherPort } from '../../domain/ports/event-publisher.port'
import type { Prisma } from '@prisma/client'

/**
 * Publica eventos escribiéndolos en el outbox (ADR-0014).
 *
 * "Publicar" aquí es un `INSERT` en `shared.outbox_events` **dentro de la transacción del
 * caso de uso**. El relay los saca después. Es lo que elimina por diseño el caso "usuario
 * creado, correo nunca enviado".
 *
 * `eventId`, `tenantId` y `correlationId` los rellena este adaptador: el caso de uso no
 * conoce el contexto de la petición y no debe inventárselo.
 */
@Injectable()
export class OutboxEventPublisher implements EventPublisherPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
    @Inject(ENV) private readonly env: Env,
  ) {}

  async publish(events: readonly DomainEventInput[]): Promise<void> {
    if (events.length === 0) return

    // Sin correlationId sólo se llega desde un proceso sin petición HTTP (un job, un
    // seed). Se genera uno para que la traza no se corte en seco.
    const correlationId = getCorrelationId() ?? `bg-${randomUUID()}`

    await this.tx.client(this.prisma).outboxEvent.createMany({
      data: events.map((event) => ({
        eventId: randomUUID(),
        type: event.type,
        // El puerto declara el payload como `Record<string, unknown>` para no atar el
        // dominio a los tipos de Prisma. Aquí se cruza la frontera: lo que llega es
        // siempre un objeto serializable a JSON.
        payload: event.payload as Prisma.InputJsonObject,
        tenantId: this.env.TENANT_ID,
        correlationId,
        occurredAt: event.occurredAt,
      })),
    })
  }
}
