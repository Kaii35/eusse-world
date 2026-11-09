# Marketplace mayorista de prendas — Análisis funcional

**Dueño:** Product Owner · **Estado:** Borrador v2 (P1, P3 y P4 aceptadas) · **Última revisión:** 2026-11-09
**Audiencia:** Arquitecto, Productos, Ecommerce y Checkout (equipo de Eusse World).
**Referencia de UX:** `docs/design/prototypes/eusse-world-react/plataforma/` (prototipo; no es fuente de reglas).

> **Aviso de cambio de visión.** [`docs/00-vision.md`](../../00-vision.md) descarta el
> "Marketplace de terceros". Este documento describe uno. Hasta que el Product Owner
> actualice la visión, este análisis es la propuesta de cambio, no un hecho cerrado.

---

## 0. Decisiones

**Aceptadas el 2026-11-09:**

| Id  | Decisión                                                           | Consecuencia                                                                                       |
| --- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| P1  | Liquidación manual y periódica a proveedores en Fase 1 (opción B). | No se integran pagos divididos. Se necesita un registro de liquidaciones auditable (§9).           |
| P3  | Operaciones aprueba cada proveedor antes de que publique.          | El proveedor pasa por `EN_REVISION` antes de `ACTIVO`.                                             |
| P4  | Carga manual de artículos desde el PDF en Fase 1 (opción A).       | Sin OCR ni parser en Fase 1. El PDF se guarda como respaldo y la fuente de datos es el formulario. |

**Abiertas:** P2 (envío), P5 (stock), P6 (estampado), P7 (margen), P8 (reventa del
comerciante) y P9 (monedas e impuestos). Ver §7.

---

## 1. Modelo de negocio

- **Eusse** es el único cobrador. El comerciante paga a Eusse por pasarela de pago.
- **Eusse** paga a cada **proveedor** lo que le corresponde por sus artículos vendidos.
- **Proveedores** crean su cuenta, suben su catálogo y fijan sus precios mayoristas.
- **Comerciantes** compran al por mayor a los proveedores según sus necesidades de marca,
  tela, estampado y tallas, para revender en su propia tienda.
- La compra mínima es de **6 artículos por proveedor** en cada pedido.

## 2. Actores

| Actor                 | Qué hace                                                                                    | Qué no ve                                                          |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Comerciante**       | Explora proveedores y catálogos, configura productos, arma carrito, paga y sigue su pedido. | Precios ni datos internos de Eusse ni de otros comerciantes.       |
| **Proveedor**         | Crea cuenta, sube catálogo en PDF, configura estampados, recibe y gestiona sus órdenes.     | Datos de pago de los comerciantes ni órdenes de otros proveedores. |
| **Operaciones Eusse** | Revisa cuentas y catálogos (ver P3), monitorea pedidos y liquidaciones.                     | Nada fuera de su rol de backoffice (RFC-0011).                     |

## 3. Reglas de negocio

Cada regla tiene un ejemplo que la cumple y un contraejemplo que la rompe.

**R-01 · Mínimo de 6 por proveedor.** Un pedido solo puede pagarse si, para cada proveedor
presente en el carrito, la suma de unidades de ese proveedor es **≥ 6**.

- Cumple: 4 camisetas + 2 sudaderas, ambas del proveedor A → 6 de A.
- No cumple: 3 camisetas del proveedor A + 3 del proveedor B → 3 de A y 3 de B.
- Cada proveedor se valida por separado: que el total global supere 6 no basta.

**R-02 · Mismo artículo o surtido.** El mínimo se cuenta en unidades de cualquier
combinación de productos y tallas del mismo proveedor.

**R-03 · Un pago, varios subpedidos.** Un pedido del comerciante se cobra una sola vez a
Eusse. Internamente se divide en **un subpedido por proveedor**. Cada proveedor ve solo su
subpedido.

**R-04 · Precios fijados por el proveedor.** El precio unitario de un artículo lo define el
proveedor. El precio por unidad es el precio base más el costo de estampado elegido, si
aplica. **Todo precio, subtotal, impuesto y total se calcula en el servidor** (regla de
CLAUDE.md). El prototipo calcula en cliente: eso no pasa a producción.

**R-05 · Estampado solo como lo ofrece el proveedor.** Un comerciante solo puede elegir:

- una técnica que el proveedor tenga activa para ese producto (p. ej. DTF, serigrafía,
  bordado, sublimación),
- un tamaño y una ubicación de la lista del proveedor,
- una imagen de diseño, si el comerciante la sube.
  Si el proveedor no ofrece estampado para un producto, la opción no aparece.

**R-06 · Colores y tallas declarados.** Solo se venden colores y tallas que el proveedor
declara para el producto.

**R-07 · Catálogo solo en PDF.** El proveedor sube su catálogo como PDF. Ningún otro
formato se acepta.

**R-08 · Pago solo por pasarela.** No hay crédito, transferencia manual ni pago contra
entrega. El pedido queda pendiente hasta que la pasarela confirma el pago.

**R-09 · Dirección de envío por pedido.** Cada pedido necesita una dirección de entrega
válida antes del pago.

**R-10 · Visibilidad.** Un comerciante ve el nombre y catálogo de cualquier proveedor
publicado. Un proveedor ve únicamente los subpedidos que le corresponden.

**R-11 · Mínimo revalidado al pagar.** El mínimo se vuelve a comprobar al confirmar el
pago, no solo al armar el carrito. Si cambió (p. ej. un artículo se retiró), el pago no
se inicia y el carrito muestra qué falta.

## 4. Flujos principales

**F1 · Alta de proveedor.** Registro con datos de la empresa y documento tributario →
estado `EN_REVISION` → Operaciones aprueba o rechaza (P3) → `ACTIVO`. Sin `ACTIVO`, el
proveedor no publica ni recibe pedidos.

**F2 · Publicar catálogo.** El proveedor sube el PDF (P4) → digita cada artículo en un
formulario (nombre, categoría, precio, colores, tallas, estampados disponibles) → revisión
de Operaciones → publicar. Solo los artículos completos se pueden vender. El PDF queda
guardado como respaldo consultable por Operaciones, no como fuente de datos.

**F3 · Explorar.** Lista de proveedores con su categoría principal → ficha del proveedor
con su catálogo → ficha del producto.

**F4 · Configurar producto.** Color → cantidades por talla → estampado (opcional: técnica,
tamaño, ubicación, imagen). El precio por unidad se muestra desde el servidor y se
actualiza al cambiar opciones.

**F5 · Carrito.** Líneas agrupadas por proveedor. Cada grupo muestra unidades, subtotal y
si ya cumple el mínimo de 6. Un proveedor sin mínimo cumplido bloquea el pago de ese
grupo y muestra cuántas unidades faltan.

**F6 · Checkout.** Dirección → resumen por proveedor → pasarela → confirmación. Al
confirmar, se revalidan mínimos, disponibilidad y precios congelados (ver §6).

**F7 · Pago confirmado.** Se crea el pedido del comerciante y un subpedido por proveedor.
Cada proveedor recibe su subpedido en su panel.

**F8 · Gestión por el proveedor.** Ver órdenes → confirmar → producir → marcar como enviado
(con guía, ver P2). Cada cambio de estado es visible para el comerciante.

**F9 · Liquidación manual (P1).** Cada periodo (propuesta: semanal, a confirmar),
el sistema genera para cada proveedor una liquidación con sus subpedidos entregados y el
monto neto. Operaciones revisa la liquidación y registra la transferencia. Una
liquidación pagada no se edita: se corrige con un ajuste nuevo.

## 5. Estados

**Pedido (comerciante):** `PENDIENTE_PAGO` → `PAGADO` → `CANCELADO`.

**Subpedido (proveedor):** `NUEVO` → `CONFIRMADO` → `EN_PRODUCCION` → `ENVIADO` →
`ENTREGADO`. Desde `NUEVO` también puede pasar a `CANCELADO` (con reembolso, ver P1).

**Liquidación:** `PENDIENTE` → `PAGADA`.

**Proveedor:** `EN_REVISION` → `ACTIVO` (aprobado) o `RECHAZADO`. `ACTIVO` → `SUSPENDIDO`
(solo Operaciones; no acepta pedidos nuevos, los abiertos siguen).

> Estos estados son propuesta. Cada máquina de estados la define RFC-0007 con su ADR
> correspondiente.

## 6. Casos límite

| Caso                                                         | Comportamiento esperado                                                                                                      |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Pasarela rechaza el pago                                     | El pedido queda `PENDIENTE_PAGO`; el carrito se conserva.                                                                    |
| Pasarela confirma, pero el sistema falla al crear subpedidos | El pago no se pierde: el pedido se completa al reintentar. Nunca queda cobrado sin pedido (RFC-0007).                        |
| El proveedor se queda sin stock de un artículo               | Se marca en el carrito antes de pagar. Si ocurre después del pago, pasa a gestión manual (P5).                               |
| El precio cambia entre el carrito y el pago                  | Se usa el precio congelado al momento de agregar; si el proveedor lo cambió, el comerciante lo ve antes de pagar (RFC-0006). |
| Un proveedor se desactiva con pedidos abiertos               | Sus subpedidos abiertos siguen; no se aceptan nuevos pedidos de ese proveedor.                                               |
| PDF sin precio o talla detectada                             | El artículo queda en borrador hasta que el proveedor lo completa. No se vende.                                               |
| Imagen de estampado no válida                                | Se rechaza al subirla, con el motivo. No se permite pagar sin diseño cuando la técnica lo requiere.                          |

## 7. Decisiones pendientes

Estas preguntas no las decido yo. Cada una bloquea una parte del diseño técnico.

**P1 · Liquidación a proveedores — aceptada (§0).** Pago manual periódico. Pendiente
solo la periodicidad. Bloquea el diseño de liquidaciones (ADR de liquidación) y el
reembolso de subpedidos cancelados.

**P2 · Envío y guía (BLOQUEO, abierta).** ¿El proveedor envía directo al comerciante, o
Eusse recibe y redistribuye? Afecta el seguimiento de pedidos (ADR de tracking) y la
responsabilidad por pérdidas. Bloquea F8. No hay recomendación todavía: depende de la
logística que Eusse quiera operar.

**P3 · Aprobación de proveedores — aceptada (§0).** Aprobación previa por Operaciones.

**P4 · Extracción desde PDF — aceptada (§0).** Carga manual en Fase 1.

**P5 · Stock.** ¿El proveedor declara stock por talla y color, o no se controla y se
resuelve manualmente? Bloquea la validación de disponibilidad en F5 y F6.

**P6 · Estampado.** Formatos de imagen aceptados, tamaño máximo y si el proveedor revisa
el diseño antes de producir. La imagen pasa por ADR-0017 y por revisión de seguridad
(archivos subidos por terceros).

**P7 · Margen de Eusse.** ¿Eusse cobra comisión sobre el precio del proveedor, o su
ganancia es otra? Afecta R-04 y la liquidación de P1.

**P8 · Reventa del comerciante.** El nombre "dropshipping" del brief sugiere que el
comerciante revende a su cliente final. ¿Eusse muestra un precio de venta sugerido, el
comerciante fija el suyo, o Eusse no interviene? Afecta el alcance de F3 y F4.

**P9 · Moneda e impuestos.** ¿Qué monedas y reglas fiscales aplican en cada país
(Colombia, Costa Rica, Nicaragua, Estados Unidos)? Ver RFC-0014.

## 8. Impacto en el repositorio

- **`docs/00-vision.md`:** el Product Owner debe actualizar la exclusión de "Marketplace de
  terceros" si este modelo se aprueba.
- **RFC nuevos:** el catálogo multi-proveedor amplía RFC-0005; los subpedidos y la
  liquidación amplían RFC-0007. Ninguno se implementa antes de estar aprobado.
- **ADR nuevos:** liquidación manual a proveedores (P1) y, cuando se decida, envío (P2).
  La extracción desde PDF no necesita ADR en Fase 1 (P4 manual).
- **Prototipo:** referencia de UX. Sus cálculos en cliente, sus datos de ejemplo y sus
  alertas (`say(...)`) no pasan a producción.

## 9. Seguridad

Este flujo mueve dinero, guarda documentos de empresas y recibe archivos de terceros. Los
controles siguen `skills/security.md` y ADR-0008 (autenticación). Cada control se verifica
en un test o en la revisión de seguridad antes de cerrar la feature.

**Aislamiento entre cuentas (IDOR).**

- `accountId` y `providerId` salen de la sesión, nunca del cuerpo ni de la URL.
- Un recurso ajeno responde `404`, no `403`, para no confirmar que existe.
- Test: un comerciante pide el subpedido de otro comerciante → `404`. Un proveedor pide el
  subpedido de otro proveedor → `404`.

**Precios e importes.**

- El servidor calcula precios, subtotales, impuestos y total. Los importes que llegan en el
  cuerpo de la petición se ignoran.
- El importe cobrado por la pasarela se compara con el total del servidor antes de marcar
  el pedido como `PAGADO`. Diferencia → no se marca y se registra para revisión.

**Pasarela de pago.**

- Sin datos de tarjeta en los sistemas de Eusse: el pago ocurre en la página alojada por la
  pasarela (alcance de cumplimiento mínimo).
- Webhooks con firma verificada y deduplicados por `eventId`. Un webhook sin firma válida
  se rechaza y se registra.
- Reembolsos solo los ejecuta Operaciones, con motivo registrado.

**Liquidaciones manuales (P1).**

- Dos personas distintas: quien prepara la liquidación no es quien registra la
  transferencia.
- Registro inmutable: una liquidación pagada no se edita (§4, F9).
- Cuenta bancaria del proveedor cambiada → queda pendiente hasta verificación fuera de la
  plataforma, para evitar desvío de pagos.

**Archivos subidos (PDF y estampados).**

- Tipo real verificado por contenido (firma del archivo), no por extensión ni por el
  encabezado `Content-Type`.
- Límite de tamaño y de páginas. El PDF se rechaza si no se puede abrir.
- Antivirus antes de guardar. Almacenamiento privado (ADR-0017). Descarga solo con URL
  firmada de vida corta (`SIGNED_URL_TTL`).
- Imágenes de estampado: se re-codifican en el servidor para eliminar metadatos (EXIF,
  ubicación), con dimensiones máximas.
- Ningún archivo se sirve desde el mismo origen que la aplicación.

**Datos personales.**

- El proveedor ve del comerciante solo lo necesario para despachar su subpedido: nombre
  de la tienda, dirección de entrega y teléfono de contacto. Nada de otros pedidos ni del
  historial.
- Los logs no incluyen direcciones, teléfonos ni correos (`skills/observability`).

**Abuso y fraude.**

- Registro y login con límite de intentos (RFC-0003).
- Un documento tributario solo puede estar asociado a una cuenta de proveedor.
- Un proveedor no puede publicar sin aprobación (P3), y un artículo sin datos completos no
  se vende (F2).
- Un pedido no se despacha hasta `PAGADO`: ningún subpedido se crea sin pago confirmado.

**Auditoría.** Quedan registrados con actor, fecha y motivo: aprobación o rechazo de
proveedores, cambios de precio, cancelaciones, reembolsos y liquidaciones.

## 10. Próximos pasos

1. El Product Owner confirma las recomendaciones aceptadas y responde P2, P5 a P9.
2. Actualizar `docs/00-vision.md` para reconocer el marketplace multi-proveedor (es decisión
   del Product Owner, no del equipo técnico).
3. RFC del catálogo multi-proveedor (amplía RFC-0005).
4. RFC de subpedidos, pagos y liquidación (amplía RFC-0007 y ADR-0018), con ADR de
   liquidación manual.
5. Revisión de seguridad (`security`) sobre §9 antes de cerrar la implementación.
