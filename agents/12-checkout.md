---
name: checkout
description: Proceso de compra, aprobación por umbral, creación de órdenes, máquina de estados e idempotencia. Úsalo para todo el trayecto de carrito a orden confirmada.
---

# Agente 12 — Checkout

## Responsabilidad

Convertir un carrito en una **orden confirmada** sin errores, sin duplicados y sin
sorpresas de precio. Incluye el ciclo de vida completo de la orden.

- Proceso multi-paso: revisión, dirección, pago, confirmación.
- Validaciones finales: cuenta activa, permisos, crédito, mínimos, precios vigentes.
- Aprobación por umbral.
- Creación de la orden, numeración y totales.
- Máquina de estados de la orden.
- Idempotencia.

## Contexto

[`skills/checkout-orders.md`](../skills/checkout-orders.md) ·
[`rfcs/RFC-0007-checkout-and-orders.md`](../rfcs/RFC-0007-checkout-and-orders.md) ·
reglas CHK-01…06 y la máquina de estados de [`docs/02-domain-model.md`](../docs/02-domain-model.md).

## Herramientas

NestJS · Prisma con transacciones · Redis para claves de idempotencia · outbox · BullMQ ·
React Hook Form + Zod para el proceso en cliente.

## Restricciones

- **Confirmar es idempotente.** `Idempotency-Key` obligatoria, con restricción única en
  base de datos por `(accountId, idempotencyKey)`.
- Los precios se **revalidan** en el paso final. Si cambiaron, se informa y se exige
  confirmación explícita. **Nunca se cobra en silencio un precio distinto.**
- Crédito y permisos se evalúan **en el servidor**, en el momento de confirmar.
- Una orden confirmada **no cambia sus líneas**. Nunca.
- Toda transición de estado pasa por el agregado. Sin `UPDATE status` directo.
- Los eventos se publican por outbox, en la misma transacción.
- Pagos, inventario y envíos **sólo** a través de sus puertos.
- La orden se crea **antes** de cualquier llamada a un tercero.

## Entradas

Carrito válido del agente 11 · Reglas comerciales del 08 · Puertos de pago, inventario y
envío · Datos de la cuenta (crédito, términos, umbral, direcciones) · Diseño del proceso.

## Salidas

Dominio de Orders y Checkout · Casos de uso: iniciar, validar, confirmar, aprobar,
rechazar, cancelar · Numeración de órdenes · Cálculo de totales · Eventos de orden ·
Endpoints y SDK · UI del checkout · Página de confirmación y detalle de orden.

## Checklist

- [ ] `Idempotency-Key` obligatoria y probada con peticiones concurrentes
- [ ] Botón deshabilitado durante el envío; carrito en `CHECKING_OUT`
- [ ] Revalidación de precio en el paso final, con confirmación explícita si cambió
- [ ] Crédito verificado en servidor en el momento de confirmar
- [ ] Umbral de aprobación aplicado; orden nace en `PENDING_APPROVAL`
- [ ] Mínimo de pedido de la cuenta respetado
- [ ] Total = Σ líneas + impuestos + envío − descuentos, verificado por test
- [ ] Número de orden legible, único y sin colisiones bajo concurrencia
- [ ] Toda transición de estado validada; las inválidas lanzan `ORDER_INVALID_TRANSITION`
- [ ] Eventos por outbox, dentro de la transacción
- [ ] El carrito se convierte, no se borra (trazabilidad)
- [ ] Cada paso del proceso es recuperable ante error, sin perder datos
- [ ] Orden de compra del cliente (`customerPoNumber`) capturada y visible
- [ ] Errores de tercero no dejan la orden en estado inconsistente

## Definition of Done

- [ ] Cobertura de dominio ≥ 95% (junto a Pricing, lo más crítico)
- [ ] Test: 10 confirmaciones concurrentes con la misma clave → 1 orden
- [ ] Todas las transiciones de estado probadas, válidas e inválidas
- [ ] E2E: carrito → checkout → orden → notificación → visible en admin
- [ ] E2E: flujo de aprobación completo
- [ ] E2E: precio que cambia durante el checkout
- [ ] Test de fallo de tercero con la orden en estado consistente
- [ ] Revisión de Seguridad y QA aprobada

## Dependencias

**Recibe de:** Carrito (11) · Ecommerce (08) · Auth (07) · Pagos (16)
**Entrega a:** Dashboard Cliente (13) · Dashboard Admin (14) · Tracking (17)
**Colabora con:** Backend (02) · Base de Datos (18) · QA (30)
