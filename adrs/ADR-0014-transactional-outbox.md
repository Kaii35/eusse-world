# ADR-0014 — Outbox transaccional para publicar eventos

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0013 |
| ------ | --- |

## Contexto

Un caso de uso crea una orden y debe publicar `OrderPlaced`. La base de datos y la cola son
sistemas distintos: no hay transacción que abarque a ambos. Cualquier orden ingenua produce
inconsistencia:

- Publicar **dentro** de la transacción: si la cola falla, se revierte una operación de
  negocio válida por un problema de infraestructura.
- Publicar **después** del commit: si el proceso muere en ese instante, el evento se pierde
  para siempre y nadie se entera.

En el checkout, "se guardó pero no se notificó" significa un cliente que no recibe
confirmación de su pedido.

## Decisión

**Outbox transaccional.** El evento se escribe en la tabla `shared.outbox` **en la misma
transacción** que el cambio de estado. Un **relay** consulta los pendientes
(`FOR UPDATE SKIP LOCKED`), los publica a BullMQ y los marca enviados.

La entrega es *at-least-once*. **Todo consumidor deduplica** por `eventId` mediante
`shared.processed_events` con `INSERT ... ON CONFLICT DO NOTHING`.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| Publicar dentro de la transacción | Acopla la disponibilidad de la cola a la del negocio |
| Publicar tras el commit | Pérdida silenciosa de eventos si el proceso muere |
| Captura de cambios (CDC) con Debezium | Infraestructura considerable; el evento sería un reflejo del esquema, no un contrato de dominio |
| Hooks `afterCommit` del ORM | Siguen sin ser atómicos: el problema es el mismo |
| Confiar en que "casi nunca pasa" | Sí pasa, y cuando pasa nadie sabe por qué |

## Consecuencias

**Positivas** — atomicidad garantizada entre cambio y evento · elimina por diseño la clase
entera de bugs "se guardó pero no se notificó" · el evento sobrevive a caídas de Redis
(queda pendiente y se publica al volver) · el outbox es un registro auditable de todo lo
ocurrido.

**Negativas** — latencia extra entre el commit y la publicación (el intervalo del relay,
< 1 s) · una tabla más que mantener y purgar · el relay es un punto que hay que monitorizar
(alerta si hay pendientes de más de 5 min) · **obliga a que todo consumidor sea
idempotente**, que es trabajo real por handler.

**Neutras** — la idempotencia es necesaria con cualquier transporte; el outbox sólo la hace
explícita.

## Criterio de revisión

Si la latencia del relay se vuelve inaceptable para algún caso, se añade notificación
inmediata (`LISTEN/NOTIFY` de PostgreSQL) manteniendo el sondeo como red de seguridad.

## Enlaces

[RFC-0013](../rfcs/RFC-0013-domain-and-integration-events.md) · [ADR-0007](ADR-0007-redis-bullmq.md) ·
[`skills/events-messaging.md`](../skills/events-messaging.md)
