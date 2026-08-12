import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

import { ENV } from '../config/config.module'
import { PrismaService } from '../shared/prisma.service'
import { QUEUE_FOR_EVENT, type QueueName } from '../shared/queues'
import { partitionForRedaction } from '../shared/sensitive-events'

import type { Env } from '../config/env.schema'

/** Fila del outbox tal y como la devuelve la consulta con bloqueo. */
type OutboxRow = {
  id: string
  event_id: string
  type: string
  payload: unknown
  tenant_id: string
  correlation_id: string
  occurred_at: Date
}

/**
 * Relay del outbox transaccional (ADR-0014).
 *
 * El caso de uso escribió el evento en `shared.outbox` DENTRO de su transacción. Este
 * proceso lo publica después. Es lo que elimina por diseño la clase entera de bugs
 * "se guardó pero no se notificó".
 *
 * `FOR UPDATE SKIP LOCKED` permite que varias réplicas del worker corran a la vez sin
 * publicar el mismo evento dos veces: cada una se lleva las filas que otra no tenga
 * bloqueadas.
 */
@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name)
  private readonly queues = new Map<QueueName, Queue>()
  private timer: NodeJS.Timeout | undefined
  private running = false

  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENV) private readonly env: Env,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.drain()
    }, this.env.OUTBOX_POLL_INTERVAL_MS)

    this.logger.log({
      event: 'outbox.relay_started',
      intervalMs: this.env.OUTBOX_POLL_INTERVAL_MS,
      batchSize: this.env.OUTBOX_BATCH_SIZE,
    })
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    await Promise.all([...this.queues.values()].map((queue) => queue.close()))
  }

  /**
   * Publica una tanda de eventos pendientes.
   *
   * Devuelve cuántos publicó. Es público para poder ejercitarlo desde los tests sin
   * depender del temporizador.
   */
  async drain(): Promise<number> {
    // Sin solaparse consigo mismo: si una tanda tarda más que el intervalo, la
    // siguiente esperaría y acabaríamos con dos lecturas concurrentes del mismo lote.
    if (this.running) return 0
    this.running = true

    try {
      return await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<OutboxRow[]>`
          SELECT id, event_id, type, payload, tenant_id, correlation_id, occurred_at
          FROM shared.outbox_events
          WHERE status = 'PENDING'
          ORDER BY occurred_at ASC
          LIMIT ${this.env.OUTBOX_BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        `

        if (rows.length === 0) return 0

        const sent: OutboxRow[] = []
        for (const row of rows) {
          try {
            await this.publish(row)
            sent.push(row)
          } catch (error) {
            // Un evento que falla no bloquea a los demás de la tanda: se reintenta en
            // la siguiente vuelta y, si insiste, se marca como fallido.
            await this.recordFailure(tx, row, error)
          }
        }

        const { keep, redact } = partitionForRedaction(sent)

        if (keep.length > 0) {
          await tx.$executeRaw`
            UPDATE shared.outbox_events
            SET status = 'SENT', published_at = now()
            WHERE id = ANY(${keep}::uuid[])
          `
        }

        if (redact.length > 0) {
          // El payload lleva un token en claro. Ya está en la cola, con sus datos; aquí
          // se borra en el mismo UPDATE que marca la fila como enviada, para no dejarlo
          // guardado (RFC-0013 §4.4).
          await tx.$executeRaw`
            UPDATE shared.outbox_events
            SET status = 'SENT', published_at = now(), payload = '{"redacted":true}'::jsonb
            WHERE id = ANY(${redact}::uuid[])
          `
        }

        this.logger.log({ event: 'outbox.batch_published', count: sent.length })
        return sent.length
      })
    } catch (error) {
      this.logger.error({
        event: 'outbox.drain_failed',
        error: error instanceof Error ? error.message : 'unknown',
      })
      return 0
    } finally {
      this.running = false
    }
  }

  private async publish(row: OutboxRow): Promise<void> {
    const queueName = QUEUE_FOR_EVENT[row.type] ?? 'notifications'
    const queue = this.getQueue(queueName)

    await queue.add(
      row.type,
      {
        eventId: row.event_id,
        type: row.type,
        occurredAt: row.occurred_at.toISOString(),
        correlationId: row.correlation_id,
        tenantId: row.tenant_id,
        payload: row.payload,
      },
      {
        // La deduplicación real la hace el consumidor con `processed_events`: la
        // entrega es at-least-once y el jobId sólo evita el duplicado más obvio.
        jobId: row.event_id,
        attempts: this.env.JOB_MAX_ATTEMPTS,
        // Exponencial CON jitter: sin jitter, todos los reintentos coinciden y
        // golpean a la vez al servicio que ya estaba caído.
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: false,
      },
    )
  }

  private getQueue(name: QueueName): Queue {
    const existing = this.queues.get(name)
    if (existing) return existing

    const queue = new Queue(name, {
      connection: { url: this.env.REDIS_URL },
      prefix: this.env.REDIS_PREFIX,
    })
    this.queues.set(name, queue)
    return queue
  }

  private async recordFailure(
    tx: { $executeRaw: PrismaService['$executeRaw'] },
    row: OutboxRow,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : 'unknown'
    this.logger.warn({ event: 'outbox.publish_failed', eventId: row.event_id, error: message })

    await tx.$executeRaw`
      UPDATE shared.outbox_events
      SET attempts = attempts + 1,
          last_error = ${message},
          status = CASE WHEN attempts + 1 >= ${this.env.JOB_MAX_ATTEMPTS} THEN 'FAILED' ELSE 'PENDING' END
      WHERE id = ${row.id}::uuid
    `
  }
}
