# 13 — Glosario

**Dueño:** Analista Funcional · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Lenguaje ubicuo del proyecto. **La columna "Código" es normativa**: es el identificador
exacto que se usa en TypeScript, en la base de datos y en la API. Usar otro nombre para el
mismo concepto es un defecto que se corrige en revisión.

---

## Dominio comercial

| Español                     | Código              | Definición                                                                               |
| --------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| Cuenta                      | `Account`           | La empresa cliente. Compra, tiene precios, crédito y usuarios. La unidad de todo en B2B. |
| Usuario                     | `User`              | Persona con credenciales. Puede pertenecer a varias cuentas.                             |
| Membresía                   | `Membership`        | Vínculo usuario↔cuenta con rol y límites.                                                |
| Rol                         | `Role`              | `OWNER` `ADMIN` `BUYER` `APPROVER` `VIEWER` dentro de una cuenta.                        |
| Cuenta activa               | `activeAccountId`   | La cuenta en cuyo nombre opera el usuario ahora.                                         |
| NIT / Identificación fiscal | `taxId`             | Identificador fiscal de la empresa.                                                      |
| Comprador                   | `Buyer`             | Usuario con permiso de crear pedidos.                                                    |
| Aprobador                   | `Approver`          | Usuario que autoriza pedidos sobre el umbral.                                            |
| Umbral de aprobación        | `approvalThreshold` | Monto por encima del cual un pedido requiere autorización.                               |
| Cupo de crédito             | `creditLimit`       | Máximo que la cuenta puede deber.                                                        |
| Crédito disponible          | `creditAvailable`   | `creditLimit` − saldo pendiente.                                                         |
| Términos de pago            | `paymentTerms`      | Condiciones (contado, 30, 60, 90 días).                                                  |
| Pedido mínimo               | `minOrderAmount`    | Monto mínimo por pedido de la cuenta.                                                    |

## Catálogo

| Español                | Código          | Definición                                                    |
| ---------------------- | --------------- | ------------------------------------------------------------- |
| Producto               | `Product`       | Concepto comercial. **No se vende directamente.**             |
| Variante               | `Variant`       | Unidad vendible concreta. Sinónimo operativo de SKU.          |
| SKU                    | `sku`           | Código único de la variante. El comprador B2B busca por aquí. |
| Categoría              | `Category`      | Clasificación jerárquica del catálogo.                        |
| Atributo               | `Attribute`     | Propiedad tipada (color, tamaño, voltaje). Filtrable.         |
| Faceta                 | `Facet`         | Atributo usado como filtro, con conteo de resultados.         |
| Medio                  | `Media`         | Imagen, vídeo o documento asociado.                           |
| Ficha técnica          | `Specification` | Datos técnicos estructurados de la variante.                  |
| Cantidad mínima        | `minOrderQty`   | Mínimo vendible de ese SKU.                                   |
| Incremento de cantidad | `qtyIncrement`  | Múltiplo obligatorio (cajas de 6 → incremento 6).             |
| Unidad de medida       | `unitOfMeasure` | `UNIT` `BOX` `PALLET` `KG` `M`                                |
| Visibilidad            | `visibility`    | `PUBLIC` `AUTHENTICATED` `ACCOUNT_RESTRICTED`                 |

## Precios

| Español           | Código          | Definición                                                 |
| ----------------- | --------------- | ---------------------------------------------------------- |
| Lista de precios  | `PriceList`     | Conjunto de precios aplicable a una o más cuentas.         |
| Entrada de precio | `PriceEntry`    | Precio de un SKU dentro de una lista.                      |
| Escala            | `PriceTier`     | Precio por rango de cantidad (1–9, 10–49, 50+).            |
| Precio resuelto   | `ResolvedPrice` | Precio final para una cuenta, un SKU y una cantidad.       |
| Precio congelado  | `frozenPrice`   | Precio fijado en una línea de carrito con su `pricedAt`.   |
| Importe           | `Money`         | `{ amount, currency }`. `amount` = entero en menor unidad. |
| Impuesto          | `Tax`           | Impuesto aplicable, calculado en el servidor.              |

## Compra

| Español                       | Código             | Definición                                                             |
| ----------------------------- | ------------------ | ---------------------------------------------------------------------- |
| Carrito                       | `Cart`             | Carrito **de la cuenta**, persistente en servidor.                     |
| Línea de carrito              | `CartLine`         | SKU + cantidad + precio congelado.                                     |
| Intención de compra           | `PurchaseIntent`   | Acción de añadir al carrito guardada durante el login de un visitante. |
| Checkout                      | `Checkout`         | Proceso de convertir un carrito en orden.                              |
| Orden / Pedido                | `Order`            | Compromiso de compra confirmado. Líneas inmutables.                    |
| Línea de orden                | `OrderLine`        | Copia inmutable de una línea de carrito.                               |
| Número de orden               | `orderNumber`      | Identificador legible: `EW-2026-000123`.                               |
| Orden de compra (del cliente) | `customerPoNumber` | Referencia del cliente para su contabilidad.                           |
| Cotización                    | `Quote`            | Oferta con vigencia, convertible en orden.                             |
| Despacho                      | `Fulfillment`      | Envío físico de parte o toda una orden.                                |
| Guía                          | `trackingNumber`   | Número de rastreo de la transportadora.                                |
| Recompra                      | `Reorder`          | Crear un carrito desde una orden anterior.                             |

## Técnico

| Español               | Código            | Definición                                                               |
| --------------------- | ----------------- | ------------------------------------------------------------------------ |
| Contexto acotado      | Bounded Context   | Frontera donde un término tiene un único significado.                    |
| Agregado              | Aggregate         | Grupo de objetos con una raíz y una frontera transaccional.              |
| Raíz de agregado      | Aggregate Root    | Única entrada al agregado desde fuera.                                   |
| Entidad               | Entity            | Objeto con identidad que persiste en el tiempo.                          |
| Objeto de valor       | Value Object      | Objeto definido por sus atributos, inmutable (`Money`, `Address`).       |
| Invariante            | Invariant         | Regla que siempre debe ser cierta dentro del agregado.                   |
| Caso de uso           | Use Case          | Una operación de negocio. Una clase, un método público.                  |
| Puerto                | Port              | Interfaz que el dominio necesita del exterior.                           |
| Adaptador             | Adapter           | Implementación concreta de un puerto.                                    |
| Evento de dominio     | Domain Event      | Hecho ocurrido, en pasado, dentro de un contexto.                        |
| Evento de integración | Integration Event | Evento publicado para otros contextos.                                   |
| Outbox                | Outbox            | Tabla donde se escriben eventos en la misma transacción que el cambio.   |
| Idempotencia          | Idempotency       | Repetir la operación produce el mismo resultado.                         |
| Proyección            | Projection        | Vista de lectura construida a partir de eventos.                         |
| BFF                   | BFF               | _Backend for Frontend_: capa de Next que gestiona sesión y adapta datos. |
| Contrato              | Contract          | Esquema Zod que define entrada y salida de un endpoint.                  |

## Proceso

| Español | Código              | Definición                                                  |
| ------- | ------------------- | ----------------------------------------------------------- |
| RFC     | RFC                 | Propuesta de diseño previa a implementar.                   |
| ADR     | ADR                 | Registro inmutable de una decisión de arquitectura.         |
| Agente  | Agent               | Rol especializado con responsabilidad y límites definidos.  |
| Skill   | Skill               | Guía de cómo se hace bien un dominio en este repo.          |
| Puerta  | Gate                | Criterio verificable que debe cumplirse para avanzar.       |
| DoR     | Definition of Ready | Requisitos para que una tarea entre a un sprint.            |
| DoD     | Definition of Done  | Requisitos para considerar una tarea terminada.             |
| Bloqueo | Blocker             | Ambigüedad que impide continuar; se escribe, no se adivina. |

---

## Términos prohibidos

| No usar                                | Usar                                   | Motivo                                |
| -------------------------------------- | -------------------------------------- | ------------------------------------- |
| `Client` (para la empresa)             | `Account`                              | `Client` se confunde con cliente HTTP |
| `Item` (suelto)                        | `CartLine`, `OrderLine`, `Variant`     | Ambiguo                               |
| `Price` (suelto)                       | `PriceEntry`, `ResolvedPrice`, `Money` | Tres cosas distintas                  |
| `Manager`, `Helper`, `Util`, `Service` | El nombre de lo que hace               | No dicen nada                         |
| `Data`, `Info`, `Object`               | El concepto real                       | No dicen nada                         |
| `Customer`                             | `Account` o `User`, según el caso      | Ambiguo en B2B                        |
| `Stock` (en Fase 1)                    | `availability`                         | El inventario real llega en Fase 2    |
