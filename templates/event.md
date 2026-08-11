# Evento — `<contexto>.<Agregado><VerboPasado>.v<N>`

| Campo       | Valor                                  |
| ----------- | -------------------------------------- |
| **Emisor**  | módulo                                 |
| **RFC**     | RFC-XXXX                               |
| **Versión** | v1                                     |
| **Estado**  | Vigente · Obsoleto (sustituido por v2) |

## Cuándo se emite

Qué hecho de negocio representa. **En pasado**: algo que ya ocurrió, no una orden de hacer
algo. Si el nombre suena a comando (`SendEmail`), el diseño está mal.

## Transaccionalidad

- [ ] Se escribe en `shared.outbox` **dentro de la transacción** que produjo el cambio
- [ ] Se publica por el relay, con reintento

## Esquema

```ts
export const <agregado><verbo>V1 = z.object({
  eventId: z.string().uuid(),
  type: z.literal('<contexto>.<Agregado><Verbo>.v1'),
  occurredAt: z.string().datetime(),
  correlationId: z.string(),
  tenantId: z.string(),
  payload: z.object({
    // autocontenido: el consumidor no debe consultar al emisor
  }),
})
```

| Campo del payload | Tipo | Por qué está aquí |
| ----------------- | ---- | ----------------- |
|                   |      |                   |

> **Regla:** el payload es autocontenido. Si un consumidor tiene que llamar al emisor para
> entender el evento, el acoplamiento ha vuelto por la puerta de atrás.

## Ejemplo

```json
{
  "eventId": "01924f8a-...",
  "type": "orders.OrderPlaced.v1",
  "occurredAt": "2026-08-06T14:30:00.000Z",
  "correlationId": "req-abc123",
  "tenantId": "eusse",
  "payload": {}
}
```

## Consumidores

| Consumidor | Fase | Efecto | Idempotente por |
| ---------- | ---- | ------ | --------------- |
|            |      |        | `eventId`       |

## Garantías

- **Entrega:** at-least-once. El consumidor **debe** deduplicar por `eventId`.
- **Orden:** no garantizado. El consumidor debe tolerar desorden.
- **Cola:** `<nombre>`
- **Reintento:** exponencial con jitter, 5 intentos, luego DLQ.

## Compatibilidad

| Cambio                   | ¿Compatible? | Acción                                      |
| ------------------------ | ------------ | ------------------------------------------- |
| Añadir campo opcional    | Sí           | Mismo `v1`                                  |
| Quitar o renombrar campo | No           | `v2`, publicando ambos durante la migración |
| Cambiar tipo o semántica | No           | `v2`                                        |

## Tests

- [ ] El evento se escribe en la misma transacción que el cambio
- [ ] El esquema se valida al publicar y al consumir
- [ ] Cada consumidor probado con **entrega doble** (idempotencia)
- [ ] Cada consumidor probado con **eventos desordenados**
- [ ] Comportamiento verificado ante fallo → DLQ
