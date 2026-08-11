# ADR-0007 — Redis + BullMQ para caché y colas

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0013 |
| ------ | --------------------------------------------------------------------------- |

## Contexto

Hace falta transporte de eventos entre módulos, ejecución de trabajo pesado fuera de la
petición HTTP (correos, reindexación, exportaciones), caché de datos calculados, y
almacenamiento de límites de frecuencia y nonces de un solo uso.

## Decisión

**Redis 7** para caché, rate limiting y nonces. **BullMQ** sobre Redis para colas de
trabajo y transporte de eventos, tras el puerto `EventBusPort`.

Colas por dominio de trabajo: `outbox-relay`, `notifications`, `search-index`, `reports`,
`cleanup`. Reintento exponencial con jitter, 5 intentos, DLQ y runbook.

## Alternativas descartadas

| Alternativa                         | Por qué se descarta                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Kafka                               | Infraestructura pesada y curva alta para el volumen de la Fase 1                 |
| RabbitMQ                            | Un servicio más que operar; Redis ya está en el stack por la caché               |
| Colas en PostgreSQL (`SKIP LOCKED`) | Viable, pero sin las primitivas de reintento, prioridad y DLQ que BullMQ ya trae |
| SQS u otro gestionado               | Ata a un proveedor y complica el desarrollo local                                |

## Consecuencias

**Positivas** — un solo servicio cubre caché y colas · reintentos, prioridades, jobs
programados y DLQ incluidos · desarrollo local trivial con Docker Compose · el puerto
permite cambiar de transporte sin tocar dominio.

**Negativas** — **Redis no es fuente de verdad**: la persistencia es de mejor esfuerzo, por
eso el outbox vive en PostgreSQL (ADR-0014) · si Redis cae, se detienen las colas (los
eventos quedan pendientes en el outbox y se publican al volver) · el escalado a Redis
Cluster exige revisar las claves.

**Neutras** — obliga a que todo consumidor sea idempotente, que es correcto con cualquier
transporte.

## Criterio de revisión

Se migra a un broker dedicado si: el volumen de eventos supera lo que Redis sostiene con
holgura, o se necesita replay histórico, o un consumidor externo a la plataforma debe
suscribirse.

## Enlaces

[RFC-0013](../rfcs/RFC-0013-domain-and-integration-events.md) ·
[ADR-0014](ADR-0014-transactional-outbox.md) ·
[`skills/events-messaging.md`](../skills/events-messaging.md)
