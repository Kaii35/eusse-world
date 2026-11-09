# ADR-0023 — Liquidación manual y periódica a proveedores en Fase 1

| Estado | Propuesto · **Fecha** 2026-11-09 · **Decisor** Product Owner + Arquitecto · **RFC** RFC-0016 |
| ------ | -------------------------------------------------------------------------------------------- |

## Contexto

Eusse cobra al comerciante y paga a cada proveedor por sus artículos vendidos. Hay dos formas
de pagar a los proveedores:

- **Pagos divididos** desde la pasarela, que envían a cada proveedor su parte al cobrar.
- **Liquidación manual:** Eusse acumula lo que le corresponde a cada proveedor y lo
  transfiere por periodo.

Los pagos divididos dependen de que la pasarela elegida soporte cuentas de proveedor para
B2B, con contrato y verificación por proveedor. Esa pasarela aún no está elegida (RFC-0016,
P-01). Esperar a elegirla bloquea todo el marketplace.

## Decisión

En Fase 1 Eusse paga a proveedores **manualmente y por periodo**:

1. Al final de cada periodo (propuesta: semanal, a confirmar en RFC-0016, P-11), el sistema
   genera una `Payout` por proveedor con sus `PayoutLine` de subpedidos **entregados**.
2. Operaciones revisa la liquidación y registra la transferencia bancaria.
3. Quien prepara la liquidación **no** es quien la marca como pagada.
4. Una liquidación pagada es inmutable. Las correcciones son ajustes nuevos.
5. Los cambios de cuenta bancaria del proveedor quedan pendientes de verificación antes de
   liquidar.

La liquidación se modela en su propio contexto (`payouts`), sin llaves foráneas hacia otros
contextos. Hereda los identificadores de los subpedidos.

**Qué no cambia:** el importe se calcula en el servidor. Ningún importe lo envía el cliente.

## Alternativas consideradas

| Alternativa                               | Ventajas                                       | Inconvenientes                                                               | Por qué se descarta                     |
| ----------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| Pagos divididos desde la pasarela         | Sin trabajo operativo; el dinero llega directo | Depende de pasarela no elegida; verificación de cada proveedor; más contrato | Diferida a Fase 2, cuando haya pasarela |
| Liquidación manual por periodo (elegida)  | Independiente de la pasarela; auditable        | Trabajo operativo; riesgo de error humano                                    | **Elegida**                             |
| Pagar a cada proveedor por pedido, a mano | Sin acumulación                                | Muchas transferencias pequeñas; más errores                                  | Costo operativo mayor sin beneficio     |

## Consecuencias

**Negativas (declaradas):**

- Trabajo operativo recurrente. Cada periodo requiere una persona de Operaciones.
- Riesgo de pago duplicado o incorrecto. Se mitiga con la restricción `UNIQUE(supplier_id,
period_start, period_end)`, la regla de doble control y la inmutabilidad.
- Los proveedores dependen de la puntualidad de Eusse. Hay que comunicar fechas de pago.
- La reconciliación bancaria es manual en Fase 1.

**Positivas:**

- Eusse no depende de una pasarela específica para liquidar.
- Hay un registro completo de cada transferencia, con actor, fecha y motivo.

## Criterio de revisión

Esta decisión se revisa si se cumple cualquiera de estas condiciones:

- El volumen de liquidaciones supera lo que Operaciones puede revisar en el periodo
  (medido como tiempo de revisión por periodo).
- La pasarela elegida en Fase 2 soporta pagos divididos con costo y contrato razonables.
- Más de una liquidación por periodo y proveedor se corrige por ajuste en un trimestre.

Cuando se cumpla una de ellas, se escribe un ADR nuevo que supersede este.
