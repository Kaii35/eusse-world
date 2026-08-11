import { randomUUID } from 'node:crypto'

import { PrismaClient } from '@prisma/client'
import { Queue, Worker, type Job } from 'bullmq'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { QUEUE } from '../shared/queues'

/**
 * Puerta A: un evento fluye del outbox al worker, una sola vez.
 *
 * Usa PostgreSQL y Redis REALES (ADR-0015). Un mock de Prisma no detectaría que
 * `FOR UPDATE SKIP LOCKED` no bloquea lo que creemos, ni que la restricción de
 * `processed_events` no impide el duplicado — que es justo lo que se está probando.
 *
 * Se salta si no hay servicios levantados: `pnpm db:up`.
 */
const DATABASE_URL = process.env.DATABASE_URL
const REDIS_URL = process.env.REDIS_URL
const enabled = Boolean(DATABASE_URL && REDIS_URL)

// El bloque entero se salta si falta configuración; esta constante existe para que el
// compilador lo sepa también.
const redisUrl = REDIS_URL ?? ''

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL ?? '' } } })

type Published = {
  eventId: string
  type: string
  correlationId: string
  payload: unknown
}

describe.runIf(enabled)('outbox → cola → consumidor', () => {
  const queueName = QUEUE.NOTIFICATIONS
  let queue: Queue
  let worker: Worker | undefined

  beforeAll(async () => {
    await prisma.$connect()
    queue = new Queue(queueName, { connection: { url: redisUrl }, prefix: 'eusse-test' })
    await queue.obliterate({ force: true })
  })

  afterAll(async () => {
    await worker?.close()
    await queue.obliterate({ force: true })
    await queue.close()
    await prisma.$disconnect()
  })

  it('debería escribir el evento en el outbox y publicarlo una sola vez', async () => {
    const eventId = randomUUID()
    const correlationId = `req-${randomUUID()}`

    // 1. El caso de uso escribe el evento DENTRO de su transacción.
    await prisma.$executeRaw`
      INSERT INTO shared.outbox_events
        (event_id, type, payload, tenant_id, correlation_id, occurred_at, status)
      VALUES (
        ${eventId}::uuid,
        'orders.OrderPlaced.v1',
        ${JSON.stringify({ orderNumber: 'EW-2026-000123' })}::jsonb,
        'eusse',
        ${correlationId},
        now(),
        'PENDING'
      )
    `

    // 2. El relay lo lee con SKIP LOCKED y lo publica.
    const rows = await prisma.$queryRaw<{ id: string; event_id: string; type: string }[]>`
      SELECT id, event_id, type FROM shared.outbox_events
      WHERE event_id = ${eventId}::uuid AND status = 'PENDING'
      FOR UPDATE SKIP LOCKED
    `
    expect(rows).toHaveLength(1)

    await queue.add(
      'orders.OrderPlaced.v1',
      { eventId, type: 'orders.OrderPlaced.v1', correlationId, payload: {} },
      { jobId: eventId },
    )
    await prisma.$executeRaw`
      UPDATE shared.outbox_events SET status = 'SENT', published_at = now()
      WHERE event_id = ${eventId}::uuid
    `

    // 3. El consumidor lo recibe.
    const received: Published[] = []
    worker = new Worker(
      queueName,
      (job: Job<Published>) => {
        received.push(job.data)
        return Promise.resolve()
      },
      { connection: { url: redisUrl }, prefix: 'eusse-test' },
    )

    await waitFor(() => received.length === 1)

    expect(received[0]?.eventId).toBe(eventId)
    // El correlationId sobrevive de la petición HTTP al worker: es lo que convierte
    // logs sueltos en una historia (skills/observability.md).
    expect(received[0]?.correlationId).toBe(correlationId)

    const [outbox] = await prisma.$queryRaw<{ status: string }[]>`
      SELECT status FROM shared.outbox_events WHERE event_id = ${eventId}::uuid
    `
    expect(outbox?.status).toBe('SENT')
  })

  it('debería ejecutar el efecto una sola vez ante entrega doble', async () => {
    // La entrega es at-least-once: esto NO es un caso hipotético.
    const eventId = randomUUID()

    const first = await prisma.$executeRaw`
      INSERT INTO shared.processed_events (event_id, handler)
      VALUES (${eventId}::uuid, 'notifications') ON CONFLICT DO NOTHING
    `
    const second = await prisma.$executeRaw`
      INSERT INTO shared.processed_events (event_id, handler)
      VALUES (${eventId}::uuid, 'notifications') ON CONFLICT DO NOTHING
    `

    expect(first).toBe(1) // procesa
    expect(second).toBe(0) // sale sin efecto
  })

  it('debería permitir que handlers distintos procesen el mismo evento', async () => {
    // La deduplicación es por (eventId, handler): Notifications y CRM deben poder
    // reaccionar ambos al mismo OrderPlaced.
    const eventId = randomUUID()

    const notifications = await prisma.$executeRaw`
      INSERT INTO shared.processed_events (event_id, handler)
      VALUES (${eventId}::uuid, 'notifications') ON CONFLICT DO NOTHING
    `
    const search = await prisma.$executeRaw`
      INSERT INTO shared.processed_events (event_id, handler)
      VALUES (${eventId}::uuid, 'search-index') ON CONFLICT DO NOTHING
    `

    expect(notifications).toBe(1)
    expect(search).toBe(1)
  })

  it('debería impedir dos órdenes con la misma clave de idempotencia', async () => {
    // La restricción que previene el riesgo R-04 (doble clic en confirmar).
    const accountId = randomUUID()
    const key = randomUUID()

    const insert = (): Promise<number> => prisma.$executeRaw`
      INSERT INTO shared.idempotency_records
        (account_id, idempotency_key, request_hash, response_status, response_body, expires_at)
      VALUES (${accountId}::uuid, ${key}::uuid, 'abc123', 201, '{}'::jsonb, now() + interval '24 hours')
    `

    await expect(insert()).resolves.toBe(1)
    await expect(insert()).rejects.toThrow()
  })
})

async function waitFor(condition: () => boolean, timeoutMs = 10_000): Promise<void> {
  const startedAt = Date.now()
  while (!condition()) {
    if (Date.now() - startedAt > timeoutMs) throw new Error('Tiempo de espera agotado')
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}
