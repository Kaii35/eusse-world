# Skill — Envíos y trazabilidad

## Objetivo

Que el cliente sepa dónde está su pedido sin llamar a nadie. Meta de Fase 1: reducir un
60% los tickets de "¿dónde está mi pedido?".

## Buenas prácticas

- **Todo estado logístico viene de un evento**, con actor y momento. Nunca un `UPDATE`
  manual sin rastro.
- **Los eventos llegan desordenados y duplicados.** Diseña el handler para tolerarlo.
- **No prometas una fecha que el sistema no pueda sostener.** Muestra un rango y su origen.
- **Envío parcial no cierra la orden.** El modelo debe soportar varios despachos por orden.
- **El número de guía es dato del cliente**: visible en el portal y en las notificaciones.
- **El coste de envío se calcula en el servidor** e se incluye en el total **antes** de
  confirmar.
- **Sondeo con límite de frecuencia** y respeto a la cuota del proveedor.
- **Un fallo de la transportadora no bloquea la orden.**

## Errores comunes

| Error                                       | Consecuencia                                        |
| ------------------------------------------- | --------------------------------------------------- |
| Estado logístico sin evento                 | Imposible reconstruir qué pasó                      |
| Handler que asume orden de llegada          | Un pedido "entregado" vuelve a "en tránsito"        |
| Evento duplicado no deduplicado             | Notificaciones repetidas al cliente                 |
| Prometer fecha exacta                       | Incumplimiento y ticket asegurado                   |
| Un solo despacho por orden                  | No se puede enviar lo disponible y el resto después |
| Coste de envío revelado en el último paso   | Abandono                                            |
| Sondeo sin límite                           | Bloqueo por exceso de peticiones del proveedor      |
| Fallo del proveedor que bloquea el checkout | Se pierden ventas por un problema ajeno             |
| Cambio manual de estado sin auditar         | Imposible investigar                                |
| Notificar cada micro-evento                 | El cliente silencia las notificaciones              |

## Patrones

**Puerto con adaptador mínimo en Fase 1**

```
interface ShippingPort {
  quote(destination: Address, lines: OrderLineSnapshot[]): Promise<ShippingQuote>
  createShipment(order: OrderSnapshot): Promise<Shipment>
  track(trackingNumber: string): Promise<TrackingStatus>
}
// Fase 1: FlatRateShippingAdapter
// Fase 2: adaptador real de transportadora
```

**Línea de tiempo de estados** — visible en el portal:

```
✅ Pedido confirmado          6 ago, 14:30
✅ En preparación             6 ago, 16:10
✅ Despachado — guía 123456   7 ago, 09:00
◻ En tránsito
◻ Entregado                   estimado: 9–11 ago
```

**Handler tolerante a desorden**

```
if (event.occurredAt <= shipment.lastEventAt) return   // evento obsoleto: ignorar
if (!shipment.canTransitionTo(event.status)) {
  logger.warn({ event: 'shipping.anomalousTransition', ... })
  return                                                // se marca, no se aplica
}
```

**Envío parcial**

```
Order EW-2026-000123
  Fulfillment #1  guía 123456  → líneas 1, 2, 3   SHIPPED
  Fulfillment #2  pendiente    → línea 4          PROCESSING
Estado de la orden: PARTIALLY_SHIPPED
```

**Notificaciones con criterio** — sólo hitos que le importan al cliente: confirmado,
despachado, en reparto, entregado, incidencia. No cada escaneo intermedio.

## Antipatrones

- **Estado de envío como columna de texto libre** en la orden.
- **Consultar a la transportadora en cada carga de página**: latencia y cuota.
- **Fecha de entrega prometida** sin margen ni origen.
- **Cerrar la orden al primer despacho** cuando quedan líneas pendientes.
- **Reintento infinito** de la creación de guía.
- **Notificar por cada evento del proveedor**: el cliente deja de leerlos.

## Convenciones

- `ShippingPort` en `checkout/domain/ports/`.
- Estados de orden: `PROCESSING` → `PARTIALLY_SHIPPED` → `SHIPPED` → `DELIVERED`.
- `Fulfillment` como entidad propia, con sus líneas y su guía.
- Eventos: `orders.OrderShipped.v1`, `orders.ShipmentDelivered.v1`.
- Sondeo cada 4 h para envíos activos; webhook cuando el proveedor lo soporte.
- Todo cambio manual de estado se audita con actor y motivo.

## Checklist

- [ ] Cada cambio de estado emite evento y notificación
- [ ] Línea de tiempo visible con fecha y hora
- [ ] Eventos desordenados y duplicados manejados de forma idempotente
- [ ] Envío parcial soportado en el modelo y en la UI
- [ ] Número de guía visible y enlazado
- [ ] Coste de envío calculado en servidor, visible antes de confirmar
- [ ] Rango de entrega con origen explícito, sin promesas exactas
- [ ] Sondeo con límite de frecuencia y reintento exponencial
- [ ] Fallo del proveedor no bloquea la orden
- [ ] Cambio manual auditado con actor y motivo
- [ ] Notificaciones sólo en hitos relevantes
- [ ] Preferencias de notificación respetadas
- [ ] Probado con fallo de la transportadora

## Plantillas

[`rfcs/RFC-0007-checkout-and-orders.md`](../rfcs/RFC-0007-checkout-and-orders.md) ·
[`skills/events-messaging.md`](events-messaging.md)
