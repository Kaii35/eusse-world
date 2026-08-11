# Skill — Pagos

## Objetivo

Cobrar sin perder dinero, sin cobrar dos veces y sin dejar órdenes en estado indeterminado.
En B2B el cobro rara vez es "tarjeta ahora": es crédito, plazos y transferencia.

## Buenas prácticas

- **El importe se toma siempre del servidor.** Jamás del cliente.
- **Nunca almacenes datos de tarjeta.** Ni cifrados. La pasarela tokeniza; tú guardas
  referencias.
- **Webhooks verificados por firma** y **idempotentes** por ID del proveedor.
- **La orden se crea antes de llamar a la pasarela.** Un fallo deja una orden recuperable,
  no un cobro huérfano.
- **Nada se confirma sin confirmación del proveedor.** Sin optimismo.
- **El pago y la orden se sincronizan por evento**, nunca por escritura cruzada.
- **Todo movimiento de dinero se registra de forma inmutable y auditable.**
- **Diseña para el webhook que llega antes que el usuario.** Ocurre constantemente.

## Errores comunes

| Error                                          | Consecuencia                                     |
| ---------------------------------------------- | ------------------------------------------------ |
| Importe del cliente                            | Manipulación de precio                           |
| Confirmar por el retorno del usuario           | El usuario cierra la pestaña y el pago se pierde |
| Webhook sin verificar la firma                 | Cualquiera marca órdenes como pagadas            |
| Webhook no idempotente                         | Doble abono, doble envío                         |
| Asumir orden de llegada de los webhooks        | Estado incorrecto                                |
| Guardar el PAN de la tarjeta                   | Incumplimiento PCI grave                         |
| Llamar a la pasarela antes de crear la orden   | Cobro sin orden asociada                         |
| Sin conciliación                               | Descuadres que se descubren meses después        |
| Crédito verificado sólo al iniciar el checkout | Cambió mientras el usuario rellenaba             |
| Secreto de la pasarela en el cliente           | Compromiso inmediato                             |

## Patrones

**Puerto con adaptador mínimo en Fase 1**

```
interface PaymentPort {
  authorize(order: OrderSnapshot, method: PaymentMethod): Promise<PaymentIntent>
  capture(intentId: PaymentIntentId): Promise<PaymentResult>
  refund(intentId: PaymentIntentId, amount: Money): Promise<RefundResult>
}
// Fase 1: OfflinePaymentAdapter → transferencia o crédito de la cuenta
// Fase 2: adaptador de pasarela real, sin tocar el dominio
```

**Webhook idempotente y verificado**

```
1. Verificar firma con el secreto del proveedor        → si falla: 401, y alerta
2. INSERT processed_events(provider_event_id) ON CONFLICT DO NOTHING
3. Si ya existía: 200 OK sin efectos
4. Procesar y emitir el evento de dominio
5. 200 OK  (siempre que se haya procesado, para que el proveedor no reintente)
```

**Crédito como reserva**

```
Confirmar orden a crédito → reservar creditAvailable
Cancelar la orden         → liberar la reserva
Facturar                  → consumir la reserva, aumentar el saldo pendiente
Recibir el pago           → reducir el saldo pendiente
```

La reserva evita que dos pedidos simultáneos superen el cupo.

**Estados de pago** — `INITIATED → AUTHORIZED → CAPTURED → SETTLED`; `* → FAILED`;
`CAPTURED → REFUNDED`. Toda transición pasa por el agregado.

**Conciliación programada** — un job compara los movimientos del proveedor con los propios y
reporta discrepancias. Sin conciliación, los descuadres se descubren en la auditoría anual.

## Antipatrones

- **Confiar en la redirección de retorno** como confirmación de pago.
- **Guardar cualquier dato de tarjeta**, aunque sea "sólo los últimos cuatro y la fecha".
- **Reintentar un cobro automáticamente** sin política escrita.
- **Estado del pago derivado del estado de la orden** (o al revés): son dos agregados.
- **Compensar borrando la orden**: se destruye la evidencia.
- **Probar sólo el camino feliz**: los pagos fallan de veinte maneras distintas.

## Convenciones

- `PaymentPort` en `checkout/domain/ports/`.
- Adaptadores en `payments/infrastructure/external/`.
- Webhooks en `/api/v1/webhooks/payments/<proveedor>`, sin autenticación de sesión y con
  verificación de firma.
- Registro financiero inmutable: sin `UPDATE`, sólo asientos nuevos.
- Importes con `Money`, nunca `number` suelto.

## Checklist

- [ ] Importe tomado del servidor y verificado contra la orden
- [ ] Sin datos de tarjeta en base de datos, logs ni trazas
- [ ] Firma de webhook verificada
- [ ] Webhook idempotente por ID del proveedor
- [ ] Webhook fuera de orden manejado correctamente
- [ ] Orden creada antes de llamar al proveedor
- [ ] Estados de pago y de orden coherentes, sincronizados por evento
- [ ] Crédito reservado, liberado y consumido correctamente
- [ ] Reembolso parcial y total contemplados
- [ ] Fallo del proveedor deja estado consistente
- [ ] Conciliación automatizada con alerta de discrepancias
- [ ] Toda transacción auditada de forma inmutable
- [ ] Probado en sandbox con casos de fallo
- [ ] Runbook de incidentes de pago escrito

## Plantillas

[`rfcs/RFC-0007-checkout-and-orders.md`](../rfcs/RFC-0007-checkout-and-orders.md) ·
[`adrs/ADR-0018-payments-port.md`](../adrs/ADR-0018-payments-port.md)
