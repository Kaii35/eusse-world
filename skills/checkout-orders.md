# Skill — Checkout y órdenes

## Objetivo

Convertir carritos en órdenes sin duplicados, sin sorpresas de precio y sin dejar el
sistema en estado inconsistente cuando un tercero falla.

## Buenas prácticas

- **Idempotencia obligatoria.** `Idempotency-Key` + restricción única en base de datos por
  `(accountId, idempotencyKey)`. La clave se genera al montar el formulario, no al pulsar.
- **Revalidar precios en el paso final.** Si cambiaron, mostrar exactamente qué y pedir
  confirmación explícita. **Nunca cobrar en silencio un precio distinto.**
- **Crédito y permisos se evalúan en el servidor**, en el momento de confirmar, no antes.
- **La orden es inmutable** en sus líneas. Corregir = nota de crédito o nueva orden.
- **La orden se crea antes de llamar a cualquier tercero.** Así un fallo de pasarela deja
  una orden recuperable, no un vacío.
- **Toda transición de estado pasa por el agregado.** Sin `UPDATE status` directo.
- **Eventos por outbox**, dentro de la transacción que crea la orden.
- **Número de orden legible** (`EW-2026-000123`), único bajo concurrencia.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Sin idempotencia | Doble clic = dos órdenes (riesgo R-04) |
| Clave de idempotencia generada al pulsar enviar | Cada clic genera una clave nueva: inútil |
| No revalidar precios | Se cobra distinto de lo mostrado |
| Verificar crédito sólo al iniciar el checkout | Cambió mientras el usuario rellenaba |
| Llamar a la pasarela antes de crear la orden | Cobro sin orden asociada |
| `UPDATE status` directo | Transiciones inválidas; máquina de estados inútil |
| Publicar el evento fuera de la transacción | Orden sin notificar, o notificación sin orden |
| Borrar el carrito al confirmar | Se pierde la trazabilidad |
| Número de orden por `COUNT(*) + 1` | Colisiones bajo concurrencia |
| Mostrar el coste de envío sólo al final | Abandono |

## Patrones

**Confirmación idempotente**

```
async execute(cmd: ConfirmCheckoutCommand) {
  const existing = await this.orders.findByIdempotencyKey(cmd.accountId, cmd.idempotencyKey)
  if (existing) return Result.ok(existing)          // misma respuesta, sin efectos

  return this.uow.run(async () => {
    const cart = await this.carts.findActive(cmd.accountId)
    const revalidation = await this.pricing.revalidate(cart)
    if (revalidation.hasChanges && !cmd.acceptPriceChanges)
      return Result.err(new PriceChangedError(revalidation.changes))

    const order = Order.placeFrom(cart, account, revalidation.prices, cmd)
    await this.orders.save(order)                    // incluye idempotencyKey
    await this.outbox.publish(order.pullEvents())    // misma transacción
    cart.markConverted()
    await this.carts.save(cart)
    return Result.ok(order)
  })
}
```

**Máquina de estados en el agregado**

```
approve(approver: Membership): void {
  if (this.status !== 'PENDING_APPROVAL') throw new InvalidStateTransitionError(...)
  if (!approver.can('order:approve'))      throw new ForbiddenError(...)
  this.status = 'PENDING_PAYMENT'
  this.record(new OrderApproved(this.id, approver.userId))
}
```

**Numeración segura** — secuencia de PostgreSQL por año, no `COUNT(*)`.

**Puertos con adaptador mínimo en Fase 1** — `PaymentPort` (offline), `InventoryPort`
(siempre disponible), `ShippingPort` (tarifa plana). El checkout está completo desde el
día 1 y los adaptadores reales llegan en Fase 2 sin tocar el dominio.

**Aprobación por umbral**

```
if (total.isGreaterThan(buyer.approvalThreshold)) → PENDING_APPROVAL   // Regla CHK-02
```

## Antipatrones

- **Checkout de un paso en B2B**: falta orden de compra, aprobador, dirección, término de
  pago.
- **Confiar en `disabled` del botón como única protección** contra el doble envío.
- **Orden mutable**: cambiar líneas tras confirmar destruye la trazabilidad contable.
- **Saga con orquestador central** en Fase 1: complejidad innecesaria.
- **Estado de la orden en varias tablas**: se desincroniza.
- **Compensar un fallo de tercero borrando la orden**: se pierde la evidencia.

## Ejemplos

**Bien — cambio de precio durante el checkout**

```json
{
  "code": "PRICING_PRICE_CHANGED",
  "detail": "El precio de 2 productos cambió desde que los añadiste",
  "meta": { "changes": [
    { "sku": "TAL-500", "oldUnitPrice": {"amount":104166,"currency":"COP"},
                        "newUnitPrice": {"amount":109000,"currency":"COP"} }
  ]}
}
```

La UI muestra el cambio y el usuario confirma con `acceptPriceChanges: true`.

**Mal**

```
const order = await prisma.order.create({ data: { total: body.total } })  // total del cliente
```

## Convenciones

- Estados: `DRAFT` `PENDING_APPROVAL` `PENDING_PAYMENT` `CONFIRMED` `PROCESSING`
  `PARTIALLY_SHIPPED` `SHIPPED` `DELIVERED` `COMPLETED` `CANCELLED` `REJECTED`.
- Número: `EW-{año}-{secuencia:6}`.
- Reglas `CHK-01`…`CHK-06` referenciadas en código y tests.
- Eventos: `orders.OrderPlaced.v1`, `orders.OrderApproved.v1`, `orders.OrderCancelled.v1`,
  `orders.OrderShipped.v1`.

## Checklist

- [ ] `Idempotency-Key` obligatoria, generada al montar el formulario
- [ ] Restricción única en base de datos por `(accountId, idempotencyKey)`
- [ ] Test: 10 confirmaciones concurrentes, misma clave → 1 orden
- [ ] Revalidación de precios con confirmación explícita
- [ ] Crédito y permisos verificados en servidor al confirmar
- [ ] Mínimo de pedido de la cuenta respetado
- [ ] Umbral de aprobación aplicado
- [ ] Total verificado por test: Σ líneas + impuestos + envío − descuentos
- [ ] Número de orden único bajo concurrencia
- [ ] Todas las transiciones válidas e inválidas probadas
- [ ] Eventos por outbox
- [ ] Carrito convertido, no borrado
- [ ] Fallo de tercero deja estado consistente
- [ ] Coste de envío visible antes del último paso
- [ ] Cobertura de dominio ≥ 95%

## Plantillas

[`rfcs/RFC-0007-checkout-and-orders.md`](../rfcs/RFC-0007-checkout-and-orders.md) ·
[`templates/use-case.md`](../templates/use-case.md)
