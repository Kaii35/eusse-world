# RFC-0006 — Carrito y precios B2B

| Campo             | Valor                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Estado**        | Borrador · **Autor** Arquitecto + Ecommerce · **Creado** 2026-08-06    |
| **Revisores**     | Carrito · Backend · Frontend · Seguridad · Performance · Product Owner |
| **ADR generados** | ADR-0012                                                               |
| **Bloque**        | E · Sprints 6–7                                                        |

---

## 1. Problema

El precio en B2B depende de la cuenta, de la cantidad y del momento. Eso choca frontalmente
con dos cosas que queremos: **páginas de producto cacheadas e indexables**, y **listados
rápidos con 60 productos en pantalla**.

Además, un carrito B2B tiene 40 líneas, se comparte entre compañeros de la misma empresa y
debe respetar mínimos y múltiplos de venta.

Un error aquí es el riesgo **R-01**, el más crítico del proyecto: mostrar a un cliente el
precio de otro.

## 2. Objetivos y no-objetivos

**Objetivos:** listas de precios por cuenta con escalas por volumen · resolución en lote ·
carrito de cuenta persistente · mínimos y múltiplos en dominio · congelado y revalidación
de precio · páginas de producto cacheables sin filtrar precios.

**No-objetivos:** promociones, cupones ni descuentos en cascada · multi-moneda activa
(modelo preparado) · cotizaciones (F3) · reserva de stock.

## 3. Alternativas consideradas

**Dónde se resuelve el precio de una página de producto**

| Alternativa                                                                       | Descarte                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A. Renderizar la página completa por cuenta (SSR sin caché)                       | Se pierde ISR y SEO; LCP se dispara                                             |
| B. Incluir el precio en el HTML y cachear con `Vary: Cookie`                      | Riesgo R-01: un fallo de configuración de CDN filtra precios                    |
| **C. Página cacheada sin precio; el precio se pide autenticado desde el cliente** | **Elegida.** SEO y velocidad intactos; el precio nunca entra en HTML compartido |

**Estructura de precios**

| Alternativa                                                          | Descarte                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| A. Precio base + porcentaje de descuento por cuenta                  | Descuentos en cascada, ambiguos e irreproducibles                    |
| **B. Listas de precios con entradas por SKU y escalas por cantidad** | **Elegida.** Es como el negocio ya piensa; auditable; sin ambigüedad |

## 4. Diseño

### 4.1 Modelo de precios

```
PriceList  { id, name, currency, validFrom, validTo, priority, status }
PriceEntry { id, priceListId, sku, tiers: PriceTier[] }
PriceTier  { minQty, unitPrice }
AccountPriceList { accountId, priceListId }
```

**Invariantes:** escalas ordenadas, sin solape ni hueco · primera escala con `minQty = 1` ·
moneda única por lista · `validFrom < validTo`.

### 4.2 Resolución de precio

```
resolve(accountId, sku, quantity) →
  1. listas vigentes asignadas a la cuenta
  2. si hay varias, gana la de mayor `priority`
     empate → error de configuración PRICING_AMBIGUOUS_PRICE_LIST (no se adivina)
  3. entrada del SKU en esa lista → si no existe: PRICING_NO_PRICE_FOR_ACCOUNT
  4. escala con mayor minQty ≤ quantity
  5. Money(unitPrice, lista.currency)
```

**Nunca hay precio por defecto.** Sin lista aplicable, no hay precio.

### 4.3 Resolución en lote

```
POST /api/v1/pricing/resolve
{ "items": [ { "sku": "TAL-500", "quantity": 12 }, ... ] }   // máx. 100
→ { "prices": [ { "sku", "unitPrice": Money, "tiers": [...], "minOrderQty", "qtyIncrement" } ] }
Cache-Control: private, no-store
Vary: Cookie
```

60 tarjetas en pantalla = **una** petición. Es lo que evita el N+1 del riesgo R-07.

### 4.4 Zona de precio en la UI

| Estado                    | Qué muestra                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| Sin sesión                | "Inicia sesión para ver tu precio" — **sin número, nunca**        |
| Cargando                  | Skeleton del tamaño exacto del precio (CLS = 0)                   |
| Con precio                | Precio unitario · moneda · escalas aplicables · mínimo y múltiplo |
| Sin precio para la cuenta | "Consulta con tu asesor" + acción de contacto                     |
| No visible                | El producto no aparece en el listado                              |

### 4.5 Modelo del carrito

```
Cart     { id, accountId, status, version, createdAt, updatedAt }
CartLine { id, cartId, sku, quantity, unitPrice: Money, pricedAt, availability }
```

**Invariantes (CRT-01…05):** un carrito `ACTIVE` por cuenta (restricción única) · cantidad
≥ `minOrderQty` y múltiplo de `qtyIncrement` · sin líneas duplicadas por SKU · el carrito
no reserva stock.

### 4.6 Congelado y revalidación de precio

El precio se congela en la línea con `pricedAt`. Se revalida:

- Al entrar al checkout, si `pricedAt` tiene más de 24 h (regla PRC-04).
- Siempre en el paso final de confirmación.

Si cambió → `PRICING_PRICE_CHANGED` con `meta.changes`, y el usuario debe confirmar
explícitamente. **Nunca se cobra en silencio un precio distinto.**

### 4.7 Concurrencia

Dos compradores de la misma cuenta editan el mismo carrito. Bloqueo optimista por `version`:
si la versión cambió, se recarga y se reintenta la operación de dominio (no la petición
entera). Las cantidades se **suman**; no se pierde ninguna actualización.

### 4.8 Endpoints

```
GET    /api/v1/cart                     → carrito de la cuenta activa
POST   /api/v1/cart/items               → { sku, quantity }
PATCH  /api/v1/cart/items/:lineId       → { quantity }
DELETE /api/v1/cart/items/:lineId
POST   /api/v1/cart/clear
POST   /api/v1/cart/revalidate          → precios y disponibilidad actuales
POST   /api/v1/cart/bulk-add            → [{ sku, quantity }] — pegar lista de SKUs
POST   /api/v1/cart/apply-intent        → aplica la intención de RFC-0004
```

El `cartId` **nunca** viaja en la petición: se deriva de la sesión.

### 4.9 Errores

`PRICING_NO_PRICE_FOR_ACCOUNT` (422) · `PRICING_AMBIGUOUS_PRICE_LIST` (500, error de
configuración) · `PRICING_PRICE_CHANGED` (409) · `CART_QTY_BELOW_MINIMUM` (422) ·
`CART_QTY_NOT_MULTIPLE` (422) · `CATALOG_VARIANT_NOT_VISIBLE` (403) · `CART_EMPTY` (422).

Todos con `meta` accionable para que la UI ofrezca la corrección.

## 5. Impacto

| Área          | Impacto                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Contextos     | Pricing (nuevo) · Cart (nuevo) · Catalog (visibilidad)                      |
| Rendimiento   | Resolución en lote obligatoria; p95 < 100 ms para 100 SKUs                  |
| **Seguridad** | **Crítico.** R-01 (fuga de precios) y IDOR de carrito. Revisión obligatoria |
| SEO           | Ninguno: la ficha sigue estática e indexable, sin precio                    |

## 6. Riesgos

| Riesgo                                 | Prob. | Impacto     | Mitigación verificable                                                                                                                |
| -------------------------------------- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Precio de una cuenta visible para otra | Media | **Crítico** | `private, no-store` + `Vary: Cookie` + test de aislamiento en CI + test de que ningún endpoint con precio devuelve cabecera cacheable |
| N+1 al resolver precios                | Alta  | Alto        | Endpoint en lote; test que falla si se emiten más de 2 peticiones por listado                                                         |
| Redondeo divergente entre front y back | Media | Medio       | Un único helper compartido; el front nunca calcula, sólo formatea                                                                     |
| Escalas mal configuradas               | Media | Alto        | Invariante en el agregado + validación en el admin antes de guardar                                                                   |
| Carrito corrupto por concurrencia      | Media | Medio       | Bloqueo optimista + test de concurrencia                                                                                              |

## 7. Criterios de aceptación

```gherkin
Escenario: Precios distintos por cuenta
  Dadas las cuentas A y B con listas de precios distintas
  Cuando ambas consultan TAL-500 con cantidad 12
  Entonces reciben precios unitarios distintos
  Y ninguna respuesta es cacheable en capa compartida

Escenario: La ficha de producto no filtra precios
  Dado el HTML cacheado de /es/p/taladro-percutor-x
  Entonces no contiene ningún importe de cuenta

Escenario: Escala por volumen
  Dada una lista con escalas 1→104166, 50→98500, 100→94200
  Cuando se consulta con cantidad 49  Entonces el precio unitario es 104166
  Cuando se consulta con cantidad 50  Entonces el precio unitario es 98500
  Cuando se consulta con cantidad 150 Entonces el precio unitario es 94200

Escenario: Múltiplo de venta
  Dado TAL-500 con qtyIncrement 6 y minOrderQty 12
  Cuando se intenta añadir 7 unidades
  Entonces se rechaza con CART_QTY_NOT_MULTIPLE
  Y la respuesta incluye suggested=12

Escenario: Carrito compartido en la cuenta
  Dado que Ana añade TAL-500 al carrito de la cuenta Acme
  Cuando Luis, de la misma cuenta, abre su carrito
  Entonces ve TAL-500

Escenario: Cambio de precio en el checkout
  Dado un carrito con un precio congelado hace 48 horas
  Y que el precio de lista cambió
  Cuando el usuario entra al checkout
  Entonces se le muestra el cambio y debe confirmarlo explícitamente
```

## 8. Plan de implementación

Pasos E1–E11 de [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).
El paso E7 (intención de invitado) se especifica en [RFC-0004](RFC-0004-guest-intent-auth-return.md).

## 9. Preparación para fases futuras

**Hueco:** `PriceList.currency` permite multi-moneda sin migración · `PriceEntry` admite
más dimensiones (canal, región) por composición · el carrito admite metadatos por línea
(para cotizaciones en F3).
**No se construye:** promociones, cupones, cotizaciones, multi-moneda activa.

## 10. Preguntas abiertas

| #   | Pregunta                                                                       | Bloquea | Resuelta                                                                                                             |
| --- | ------------------------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | ¿Qué ocurre si dos listas vigentes con la misma prioridad cubren el mismo SKU? | E2      | **Sí** — es un error de configuración: `PRICING_AMBIGUOUS_PRICE_LIST` y alerta al admin. El sistema no adivina       |
| 2   | ¿Se muestra precio público a visitantes para SKUs `PUBLIC`?                    | E8      | **No** en Fase 1. Coherencia: un solo mensaje, "inicia sesión para ver tu precio". Revisable con datos de conversión |

## 11. Enlaces

[RFC-0004](RFC-0004-guest-intent-auth-return.md) · [RFC-0005](RFC-0005-catalog-and-search.md) ·
[RFC-0007](RFC-0007-checkout-and-orders.md) · [`skills/pricing.md`](../skills/pricing.md) ·
[`skills/cart.md`](../skills/cart.md) ·
[`docs/08-technical-risks.md`](../docs/08-technical-risks.md) R-01, R-07
