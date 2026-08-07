# Skill — Carrito

## Objetivo

Un carrito de cuenta que soporta 100 líneas, respeta las reglas de venta mayorista y no
pierde nunca la intención del usuario, ni siquiera a través del login.

## Buenas prácticas

- **El carrito es de la cuenta, no del usuario.** Dos compradores de la misma empresa
  colaboran sobre el mismo carrito.
- **El carrito vive en el servidor.** El navegador sólo puede guardar la *intención* de un
  visitante.
- **Precio congelado con `pricedAt`.** El cliente nunca lo recalcula.
- **Añadir un SKU existente suma cantidad**, no crea una línea duplicada.
- **Validar mínimos y múltiplos en el dominio**, con mensajes que digan el número correcto.
- **Marcar, no borrar.** Un SKU que deja de estar disponible se marca; borrarlo en silencio
  confunde y enfada.
- **Optimistic updates con reversión** y aviso claro cuando el servidor rechaza.
- **`cartId` derivado de la sesión**, nunca aceptado del cliente.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Carrito por usuario | Dos compradores de la misma empresa se pisan |
| Carrito en `localStorage` | Se pierde al cambiar de dispositivo; sin precios reales |
| Precio recalculado en el cliente | Riesgo R-01 |
| Duplicar línea al añadir el mismo SKU | Carrito confuso; totales incorrectos |
| Ignorar `qtyIncrement` | Pedidos imposibles de despachar |
| Borrar líneas no disponibles en silencio | El usuario no entiende qué pasó |
| Reservar stock en el carrito | Bloqueo de inventario por carritos abandonados |
| Optimistic update sin reversión | La UI miente |
| Aceptar `cartId` del cliente | IDOR |
| Perder la intención del visitante en el login | Abandono; requisito de producto incumplido |

## Patrones

**Intención de compra del visitante** — el flujo central del producto:

```
Visitante pulsa "Añadir al carrito"
  → sin sesión
  → servidor firma { sku, quantity, returnTo } en cookie httpOnly (TTL 30 min, un solo uso)
  → 302 /login?next=/p/producto-x
  → login correcto
  → servidor verifica la firma
  → REVALIDA con la cuenta real: visibilidad, precio, mínimo, múltiplo
  → añade al carrito · consume la intención
  → 302 /p/producto-x + "Añadido: 10 × Producto X"
```

Si la revalidación falla (producto no visible, sin precio, cantidad inválida), se informa
con precisión y **no se agrega**.

**Suma en vez de duplicado**

```
addItem(sku, quantity, rules) {
  const existing = this.lines.find((l) => l.sku.equals(sku))
  return existing
    ? this.replaceLine(existing.increaseBy(quantity, rules))   // Regla CRT-03
    : this.appendLine(CartLine.create(sku, quantity, ...))
}
```

**Revalidación por antigüedad** — líneas con `pricedAt` de más de 24 h se revalidan al
entrar al checkout; los cambios se muestran uno a uno.

**Fusión al cambiar de cuenta** — no se fusiona: cada cuenta tiene su carrito. Cambiar de
cuenta carga el carrito de la nueva. Fusionar mezclaría precios de acuerdos distintos.

**Añadir por lista de SKUs** — el comprador pega códigos y cantidades; el sistema valida
todo y reporta línea por línea qué se añadió y qué no.

## Antipatrones

- **Carrito en Zustand sincronizado con la API**: dos fuentes de verdad.
- **Recalcular el total en el cliente para "que se vea instantáneo"**: puede mentir.
- **Reservar inventario al añadir**: carritos abandonados bloquean stock real.
- **Vaciar el carrito al expirar la sesión**: se pierde media hora de trabajo del comprador.
- **Un carrito por pestaña**: incoherencia entre pestañas.
- **Validar mínimos sólo en el frontend**: se salta trivialmente.

## Ejemplos

**Bien — error de cantidad**

```json
{
  "code": "CART_QTY_NOT_MULTIPLE",
  "detail": "El taladro TAL-500 se vende en cajas de 6 unidades",
  "meta": { "sku": "TAL-500", "requested": 7, "qtyIncrement": 6, "suggested": 12 }
}
```

La UI puede ofrecer "Ajustar a 12" sin analizar prosa.

**Mal**

```json
{ "error": "Invalid quantity" }
```

## Convenciones

- Un carrito `ACTIVE` por cuenta (restricción única en base de datos).
- Estados: `ACTIVE` → `CHECKING_OUT` → `CONVERTED`; `ACTIVE` → `ABANDONED`.
- Línea: `{ sku, quantity, unitPrice: Money, pricedAt, availability }`.
- Cookie de intención: `__Host-eusse_intent`, firmada, TTL 30 min, un solo uso.
- Reglas `CRT-01`…`CRT-05` referenciadas en código y tests.

## Checklist

- [ ] Un carrito activo por cuenta, garantizado por la base de datos
- [ ] Carrito persistente en servidor
- [ ] Añadir SKU repetido suma cantidad
- [ ] `minOrderQty` y `qtyIncrement` validados en dominio
- [ ] Errores con `meta` accionable
- [ ] Precio congelado con `pricedAt`
- [ ] Revalidación de precios de más de 24 h
- [ ] SKU no disponible marcado, no borrado
- [ ] Sin reserva de stock
- [ ] Cambio de cuenta carga el carrito correcto
- [ ] **Intención de invitado firmada, un solo uso, revalidada tras el login**
- [ ] Optimistic update con reversión
- [ ] `cartId` desde la sesión; test de IDOR
- [ ] Rendimiento verificado con 100 líneas
- [ ] Concurrencia probada: dos usuarios, mismo carrito

## Plantillas

[`rfcs/RFC-0004-guest-intent-auth-return.md`](../rfcs/RFC-0004-guest-intent-auth-return.md) ·
[`rfcs/RFC-0006-cart-and-b2b-pricing.md`](../rfcs/RFC-0006-cart-and-b2b-pricing.md)
