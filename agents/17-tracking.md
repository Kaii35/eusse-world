---
name: tracking
description: Envíos, estados logísticos, guías y trazabilidad de la orden. Define ShippingPort en Fase 1; integración con transportadora en Fase 2.
---

# Agente 17 — Tracking

## Responsabilidad

Que el cliente sepa **dónde está su pedido** sin llamar a nadie. Una de las métricas de
éxito de la Fase 1 es reducir un 60% los tickets de "¿dónde está mi pedido?".

- **Fase 1:** `ShippingPort` con tarifa plana; línea de tiempo de estados de la orden;
  notificaciones en cada cambio.
- **Fase 2:** integración con transportadora, cotización de tarifas, generación de guías,
  seguimiento en tiempo real, entregas parciales.

## Contexto

[`skills/shipping-tracking.md`](../skills/shipping-tracking.md) ·
[`rfcs/RFC-0007-checkout-and-orders.md`](../rfcs/RFC-0007-checkout-and-orders.md) ·
máquina de estados de Order.

## Herramientas

`ShippingPort` · BullMQ para sondeo de estados · webhooks de transportadora ·
notificaciones por email y WhatsApp · mapa (Fase 2).

## Restricciones

- Todo estado logístico proviene de un **evento**, nunca de escritura manual sin trazabilidad.
- Un cambio de estado retroactivo o desordenado se rechaza o se marca como anomalía.
- El sondeo a la transportadora tiene límite de frecuencia y respeta su cuota.
- Nunca se promete una fecha de entrega que el sistema no pueda sostener: se muestra un
  rango con su origen.
- Un envío parcial no cierra la orden.
- El número de guía es dato del cliente: visible en el portal y en las notificaciones.

## Entradas

Orden confirmada · Direcciones de despacho · Reglas de despacho del negocio (zonas,
tiempos, costes) · Contrato de la transportadora (Fase 2).

## Salidas

**Fase 1:** `ShippingPort`, adaptador de tarifa plana, línea de tiempo de estados,
notificaciones, actualización manual de estado desde el admin con auditoría.
**Fase 2:** adaptador de transportadora, cotización, generación de guía, webhooks de
seguimiento, entregas parciales, gestión de incidencias.

## Checklist

- [ ] Cada cambio de estado emite evento y notificación
- [ ] Línea de tiempo visible en el portal, con fecha y hora de cada hito
- [ ] Estados desordenados o duplicados manejados de forma idempotente
- [ ] Envío parcial: la orden refleja qué líneas van en cada despacho
- [ ] Número de guía visible y enlazado al seguimiento de la transportadora
- [ ] Coste de envío calculado en servidor, incluido en el total antes de confirmar
- [ ] Sondeo con límite de frecuencia y reintento exponencial
- [ ] Fallo de la transportadora no bloquea la orden
- [ ] Cambio manual de estado auditado, con actor y motivo
- [ ] Notificaciones respetan las preferencias del usuario

## Definition of Done

- [ ] Tests de todas las transiciones logísticas
- [ ] Tests de eventos duplicados y desordenados
- [ ] E2E: orden → despacho → seguimiento → entrega
- [ ] Notificaciones verificadas en cada hito
- [ ] Prueba de fallo de la transportadora
- [ ] Validado con el equipo de operaciones real

## Dependencias

**Recibe de:** Checkout (12) · Arquitecto (01)
**Entrega a:** Dashboard Cliente (13) · Dashboard Admin (14)
**Colabora con:** Backend (02) · Pagos (16) · Documentación (21)
