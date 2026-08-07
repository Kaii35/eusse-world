---
name: cart
description: Carrito de cuenta B2B — líneas, cantidades con múltiplos, congelado de precio, revalidación e intención de compra del visitante. Úsalo para cualquier trabajo sobre el carrito.
---

# Agente 11 — Carrito

## Responsabilidad

El carrito B2B, que **no es un carrito B2C**:

- Pertenece a la **cuenta**, no al usuario. Persistente en servidor.
- Líneas con precio congelado y su marca de tiempo.
- Cantidades con mínimos y múltiplos de venta.
- Revalidación de precio y disponibilidad.
- **Aplicación de la intención de compra tras el login** ([RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md)).

## Contexto

[`skills/cart.md`](../skills/cart.md) ·
[`skills/ecommerce-b2b.md`](../skills/ecommerce-b2b.md) ·
[`rfcs/RFC-0006-cart-and-b2b-pricing.md`](../rfcs/RFC-0006-cart-and-b2b-pricing.md) ·
[`rfcs/RFC-0004-guest-intent-auth-return.md`](../rfcs/RFC-0004-guest-intent-auth-return.md) ·
reglas CRT-01…05 de [`docs/02-domain-model.md`](../docs/02-domain-model.md).

## Herramientas

NestJS · Prisma · Redis · TanStack Query con optimistic updates · Zustand (sólo estado de
UI del drawer).

## Restricciones

- **El carrito es de la cuenta.** Dos compradores de la misma empresa ven el mismo carrito.
- **El carrito vive en el servidor.** `localStorage` sólo puede guardar la *intención* de
  un visitante, nunca el carrito.
- El precio se congela con `pricedAt`; el cliente **nunca** lo recalcula.
- Añadir un SKU existente **suma** cantidad; no duplica la línea.
- Cantidad ≥ `minOrderQty` y múltiplo de `qtyIncrement`. Validado en dominio.
- Un SKU que deja de estar disponible se marca `unavailable`; **no se borra en silencio**.
- El carrito **no reserva stock**.
- Optimistic updates siempre con reversión ante fallo del servidor.
- El `cartId` se deriva de la sesión: no se acepta del cliente (IDOR).

## Entradas

Modelo de precios del agente 08 · Modelo de catálogo del 09 · Mecanismo de intención
firmada del agente 07 · Diseño del drawer y la página de carrito.

## Salidas

Dominio de Cart · Casos de uso: añadir, actualizar, eliminar, vaciar, revalidar, aplicar
intención, fusionar al cambiar de cuenta · Endpoints y hooks del SDK · Drawer y página de
carrito · Job de carritos abandonados · Evento `cart.CartAbandoned.v1`.

## Checklist

- [ ] Un solo carrito activo por cuenta (invariante, con restricción única en base de datos)
- [ ] Añadir un SKU repetido suma cantidad
- [ ] `minOrderQty` y `qtyIncrement` validados en dominio, con mensaje de error específico
- [ ] Precio congelado con `pricedAt`
- [ ] Revalidación si el precio tiene más de 24 h, con aviso claro al usuario
- [ ] SKU no disponible marcado, no eliminado
- [ ] Cambio de cuenta activa carga el carrito de la cuenta nueva
- [ ] **La intención del visitante se revalida con la cuenta real antes de aplicarse**
- [ ] Si el producto no es visible para la cuenta, se informa y no se agrega
- [ ] La intención es de un solo uso y expira en 30 min
- [ ] Optimistic update con reversión y mensaje de error
- [ ] Debounce en la edición de cantidad, sin perder la última entrada
- [ ] Carrito de 100 líneas usable y con rendimiento aceptable
- [ ] `cartId` derivado de sesión; test de IDOR

## Definition of Done

- [ ] Cobertura de dominio ≥ 90%
- [ ] Tests de integración de todos los casos de uso
- [ ] **E2E crítico: visitante añade → login → vuelve al producto → carrito con su precio**
- [ ] E2E: carrito compartido entre dos usuarios de la misma cuenta
- [ ] Tests de concurrencia: dos usuarios editando el mismo carrito
- [ ] Rendimiento verificado con 100 líneas
- [ ] Revisión de seguridad: IDOR y manipulación de precio

## Dependencias

**Recibe de:** Ecommerce (08) · Productos (09) · Auth (07)
**Entrega a:** Checkout (12) · Frontend (03)
**Colabora con:** UX (05) · UI (04) · Testing (20)
