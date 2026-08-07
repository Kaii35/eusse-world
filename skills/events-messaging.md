# Skill — Eventos y mensajería

## Objetivo

Comunicar módulos sin acoplarlos, sin perder mensajes y sin duplicar efectos cuando la
infraestructura reintenta — porque va a reintentar.

## Buenas prácticas

- **Outbox transaccional, siempre.** El evento se escribe en la misma transacción que el
  cambio de estado. Un relay lo publica después.
- **Asume entrega *at-least-once*.** El mensaje llegará dos veces. Diseña para ello desde
  el primer handler.
- **Todo consumidor es idempotente** por `eventId`, con tabla `processed_events`.
- **Eventos en pasado y con hecho consumado**: `OrderPlaced`, nunca `PlaceOrder`.
- **Payload autocontenido y estable.** El consumidor no debería tener que consultar al
  emisor para entender el evento.
- **Versiona desde el día 1**: `orders.OrderPlaced.v1`. Añadir `v2` es barato; cambiar `v1`
  rompe consumidores.
- **Una cola por dominio de trabajo**, no una cola gigante. Permite escalar y priorizar.
- **DLQ y runbook de reproceso** antes de publicar el primer evento en producción.
- **Reintento exponencial con tope y jitter.** Sin jitter, todos los reintentos coinciden.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Publicar antes del commit | El evento existe y el cambio no |
| Publicar después del commit, fuera de transacción | El cambio existe y el evento se pierde si el proceso muere |
| Handler no idempotente | Stock descontado dos veces; dos correos; doble cargo |
| Payload con sólo un ID | El consumidor consulta al emisor: acoplamiento reintroducido |
| Evento sin versión | Cualquier cambio rompe a todos los consumidores |
| Reintento infinito | Un mensaje envenenado bloquea la cola para siempre |
| Orden garantizado asumido | Casi ningún sistema lo garantiza; el handler debe tolerarlo |
| Eventos como llamada a procedimiento (`SendEmail`) | Es un comando disfrazado; acopla emisor y consumidor |

## Patrones

**Outbox transaccional**

```
BEGIN
  INSERT INTO orders.orders (...)
  INSERT INTO shared.outbox (id, type, payload, occurred_at, status='PENDING')
COMMIT
-- relay: SELECT ... WHERE status='PENDING' FOR UPDATE SKIP LOCKED → publish → mark SENT
```

**Deduplicación en el consumidor**

```
INSERT INTO processed_events (event_id, handler) VALUES ($1, $2)
ON CONFLICT DO NOTHING RETURNING 1
-- si no devuelve fila, ya se procesó: salir sin efecto
```

**Evento de dominio vs. de integración** — el de dominio es interno al módulo y puede
llevar objetos ricos; el de integración cruza fronteras y es un contrato público, plano y
versionado.

**Saga por coreografía** — cada módulo reacciona a eventos y emite los suyos. Sin
orquestador central en Fase 1.

**Dead letter queue** — tras N reintentos, a DLQ con el error completo. Alerta y runbook de
reproceso.

## Antipatrones

- **Event sourcing sin necesidad**: complejidad enorme; el negocio no lo pidió.
- **Eventos como comandos** (`SendWelcomeEmail`): acopla emisor a consumidor.
- **Payload gigante**: el evento se convierte en un volcado de base de datos.
- **Cadenas de eventos profundas**: A→B→C→D→E. Imposible de razonar y de depurar.
- **Consumidor que escribe en tablas de otro módulo**: rompe la frontera por la puerta de
  atrás.
- **Publicar en un `afterCommit` de ORM**: sigue sin ser atómico.

## Ejemplos

**Bien**

```
{
  "eventId": "01924f...",              // UUID v7, clave de deduplicación
  "type": "orders.OrderPlaced.v1",
  "occurredAt": "2026-08-06T14:30:00.000Z",
  "correlationId": "req-abc123",
  "tenantId": "eusse",
  "payload": {
    "orderId": "...", "orderNumber": "EW-2026-000123", "accountId": "...",
    "total": { "amount": 1250000, "currency": "COP" },
    "lines": [{ "sku": "TAL-500", "quantity": 12,
                "unitPrice": { "amount": 104166, "currency": "COP" } }]
  }
}
```

Autocontenido: Notifications puede componer el correo e Inventory puede reservar, sin
consultar a Orders.

**Mal**

```
{ "type": "OrderPlaced", "orderId": "..." }
```

Sin versión, sin `eventId` (imposible deduplicar), sin datos (todos los consumidores
consultan a Orders y lo saturan).

## Convenciones

- Nombre: `<contexto>.<Agregado><VerboPasado>.v<N>` en minúscula el contexto.
- Campos obligatorios: `eventId` (UUID v7), `type`, `occurredAt` (UTC ISO), `correlationId`,
  `tenantId`, `payload`.
- Esquema del payload en `@eusse/contracts`, validado al publicar y al consumir.
- Colas: `notifications`, `search-index`, `outbox-relay`, `reports`, `cleanup`.
- Handler: `<evento>.handler.ts` en `application/handlers/`.
- Cambio compatible → mismo `v`. Cambio rompedor → `v+1`, ambos publicados durante la
  migración.

## Checklist

- [ ] Evento escrito en la misma transacción que el cambio (outbox)
- [ ] `eventId` único; consumidor deduplica
- [ ] Payload autocontenido y versionado
- [ ] Esquema validado al publicar y al consumir
- [ ] Handler idempotente, probado con entrega doble
- [ ] Handler tolera desorden
- [ ] Reintento exponencial con tope y jitter
- [ ] DLQ configurada con alerta
- [ ] Runbook de reproceso escrito
- [ ] Sin escritura en tablas de otro módulo
- [ ] `correlationId` propagado
- [ ] Métrica de profundidad y antigüedad de cola

## Plantillas

[`templates/event.md`](../templates/event.md) ·
[`templates/module.md`](../templates/module.md)
