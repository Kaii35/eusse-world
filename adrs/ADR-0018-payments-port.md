# ADR-0018 — `PaymentPort` con adaptador offline en Fase 1

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto + Product Owner · **RFC** RFC-0007 |
| ------ | --- |

## Contexto

El checkout no puede lanzarse sin una forma de pagar. Pero elegir pasarela exige negociar
comisiones, tiempos de liquidación y condiciones — una decisión comercial que aún no está
tomada y que **no debe bloquear la Fase 1**.

Además, en B2B la mayoría de las ventas son **a crédito o por transferencia**, no con
tarjeta. La pasarela es menos urgente de lo que parece desde una perspectiva B2C.

## Decisión

Definir **`PaymentPort`** en la Fase 1 con un adaptador **offline**:

- Pago a **crédito** de la cuenta, con reserva de cupo al confirmar.
- Pago por **transferencia bancaria**, con instrucciones y registro manual del pago desde
  el back-office.

La pasarela real es un **adaptador nuevo en Fase 2**, sin tocar dominio, casos de uso ni UI.
La elección de proveedor se decidirá por ADR propio con criterios escritos: comisión,
tiempo de liquidación, calidad de los webhooks, soporte de pagos B2B y cobertura local.

Reglas permanentes: el importe se toma **siempre del servidor** · **nunca** se almacenan
datos de tarjeta · los webhooks se verifican por firma y son idempotentes · la orden se crea
**antes** de llamar a cualquier proveedor.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| Integrar una pasarela ya, sin decisión comercial | Se elegiría mal y habría que rehacerlo |
| Retrasar el checkout hasta tener pasarela | Bloquea la funcionalidad central del proyecto por una decisión comercial |
| Acoplarse al SDK de un proveedor sin puerto | Cambiar de proveedor obligaría a tocar dominio y UI |
| Sólo transferencia, sin crédito | El crédito es el mecanismo de venta habitual del negocio |

## Consecuencias

**Positivas** — la Fase 1 se lanza y **se vende** sin pasarela · la decisión comercial se
toma con calma y con datos reales de operación · añadir la pasarela después es un adaptador
nuevo, no un rediseño · el modelo de crédito, que es lo que el negocio realmente usa, se
construye desde el principio.

**Negativas** — sin cobro automático en Fase 1: hay conciliación manual de transferencias
(coste operativo real, aceptado por el Product Owner) · el adaptador offline es código que
se mantendrá aunque llegue la pasarela, porque la transferencia seguirá existiendo.

**Neutras** — obliga a diseñar bien el puerto desde el principio, sin poder "copiar la API
del proveedor".

## Criterio de revisión

Se integra pasarela cuando: haya decisión comercial cerrada, **o** el volumen de
conciliación manual supere unas 50 transferencias semanales, lo que ocurra antes.

## Enlaces

[RFC-0007](../rfcs/RFC-0007-checkout-and-orders.md) · [`skills/payments.md`](../skills/payments.md) ·
[`agents/16-payments.md`](../agents/16-payments.md)
