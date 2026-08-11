import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { Worker, type Job } from 'bullmq'

import { ENV } from '../config/config.module'
import { PrismaService } from '../shared/prisma.service'
import { QUEUE } from '../shared/queues'

import type { Env } from '../config/env.schema'

const HANDLER_NAME = 'notifications'

export type IntegrationEvent = {
  eventId: string
  type: string
  occurredAt: string
  correlationId: string
  tenantId: string
  payload: unknown
}

/**
 * Consumidor de la cola de notificaciones.
 *
 * La entrega es **at-least-once**: el mensaje LLEGARÁ dos veces. Un handler que no
 * tolera reprocesamiento es un bug, no una limitación de la infraestructura
 * (RFC-0013 §4.1).
 *
 * La deduplicación es un `INSERT ... ON CONFLICT DO NOTHING` sobre `processed_events`:
 * si no inserta fila, este handler ya procesó ese `eventId` y sale sin efecto.
 */
@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsConsumer.name)
  private worker: Worker | undefined

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker(
      QUEUE.NOTIFICATIONS,
      async (job: Job<IntegrationEvent>) => this.handle(job.data),
      {
        connection: { url: this.env.REDIS_URL },
        prefix: this.env.REDIS_PREFIX,
        concurrency: 5,
      },
    )

    this.worker.on('failed', (job, error) => {
      this.logger.error({
        event: 'queue.job_failed',
        queue: QUEUE.NOTIFICATIONS,
        jobId: job?.id,
        attempt: job?.attemptsMade,
        error: error.message,
      })
    })

    this.logger.log({ event: 'queue.consumer_started', queue: QUEUE.NOTIFICATIONS })
  }

  async onModuleDestroy(): Promise<void> {
    // Apagado ordenado: se terminan los jobs en curso antes de cerrar.
    await this.worker?.close()
  }

  /** Devuelve `true` si ejecutó el efecto, `false` si ya estaba procesado. */
  async handle(event: IntegrationEvent): Promise<boolean> {
    const inserted = await this.prisma.$executeRaw`
      INSERT INTO shared.processed_events (event_id, handler)
      VALUES (${event.eventId}::uuid, ${HANDLER_NAME})
      ON CONFLICT DO NOTHING
    `

    if (inserted === 0) {
      this.logger.log({
        event: 'queue.duplicate_skipped',
        eventId: event.eventId,
        handler: HANDLER_NAME,
        correlationId: event.correlationId,
      })
      return false
    }

    // Aquí iría el efecto real: componer y enviar el correo transaccional.
    // Se implementa en el Bloque F, con el módulo Notifications (RFC-0007 §4.8).
    this.logger.log({
      event: 'notifications.event_processed',
      eventId: event.eventId,
      type: event.type,
      correlationId: event.correlationId,
    })

    return true
  }
}
