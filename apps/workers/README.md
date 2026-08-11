# apps/workers

Consumidores de BullMQ, jobs programados y **relay del outbox**.

## Cuándo se toca

Cuando hay trabajo que no debe ocurrir dentro de una petición HTTP: correo transaccional,
reindexación, exportaciones, reproceso.

## Cuándo NO

- **No define su propio esquema de Prisma.** El esquema vive en
  [`apps/api/prisma/`](../api/prisma/) y es la única fuente de verdad; aquí se consume el
  cliente generado. Duplicarlo garantizaría que ambos divergen.
- **No expone HTTP.** Es una aplicación standalone de Nest.

## Piezas

| Pieza                       | Qué hace                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `outbox-relay.service.ts`   | Publica a BullMQ los eventos pendientes de `shared.outbox_events`, con `FOR UPDATE SKIP LOCKED` para que varias réplicas no se pisen |
| `notifications.consumer.ts` | Consume la cola de notificaciones. **Idempotente** por `eventId`                                                                     |
| `queues.ts`                 | Una cola por dominio de trabajo, no una gigante                                                                                      |

## La regla que no se negocia

La entrega es **at-least-once**: el mensaje llegará dos veces. Todo consumidor deduplica
con `INSERT ... ON CONFLICT DO NOTHING` sobre `processed_events`. Un handler que no
tolera reprocesamiento es un bug, no una limitación de la infraestructura
([ADR-0014](../../adrs/ADR-0014-transactional-outbox.md)).

## Local

```bash
pnpm db:up                    # PostgreSQL y Redis
pnpm --filter @eusse/workers dev
```
