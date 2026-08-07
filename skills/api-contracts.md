# Skill — Contratos de API

## Objetivo

Que backend y frontend trabajen en paralelo sin bloquearse, y que un cambio incompatible
rompa el build en vez de romper producción.

## Buenas prácticas

- **Zod es la fuente de verdad.** De un esquema salen: tipos TS, validación en NestJS,
  OpenAPI y el cliente tipado. Escribirlos por separado garantiza que diverjan.
- **El contrato se aprueba y se mergea primero.** Después backend y frontend avanzan en
  paralelo.
- **Contract tests desde el primer día**, en rojo, antes de implementar.
- **Errores en formato *problem+json*** con `code` estable. El frontend reacciona al código,
  nunca al texto.
- **Paginación por cursor** siempre. El `offset` se degrada y es inestable.
- **`Idempotency-Key` en toda mutación** que cree o cobre algo.
- **Versionado por URL**: `/api/v1/`. Explícito y fácil de enrutar.
- **Aditivo por defecto**: añadir un campo opcional no rompe. Quitar o cambiar el tipo, sí.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Tipos TS escritos a mano junto al esquema | Divergen en la primera prisa |
| Errores identificados por mensaje | Se rompe el frontend al mejorar la redacción o al traducir |
| Devolver la entidad de base de datos tal cual | Se filtran campos internos; el esquema dicta la API |
| Cambiar un campo sin subir versión | Clientes antiguos rotos en silencio |
| `POST /getOrders` | Sin caché, sin semántica, sin idempotencia |
| Paginación por offset | Duplicados y saltos cuando se insertan filas |
| `200 OK` con `{ error: ... }` | Los clientes HTTP no pueden reaccionar correctamente |
| Filtros como blob de query sin tipar | Imposible de validar y de documentar |

## Patrones

**Contrato como fuente única**

```
// packages/contracts/src/cart/add-item.contract.ts
export const addItemToCartRequest = z.object({
  sku: skuSchema,
  quantity: z.number().int().positive(),
})
export const addItemToCartResponse = cartSchema
export type AddItemToCartRequest = z.infer<typeof addItemToCartRequest>
```

Backend valida con `addItemToCartRequest`. Frontend tipa con `AddItemToCartRequest`. El
SDK lo genera. Una sola definición.

**Respuesta de error uniforme**

```
{
  "type": "https://api.eusse.world/errors/cart-qty-below-minimum",
  "title": "Cantidad por debajo del mínimo",
  "status": 422,
  "code": "CART_QTY_BELOW_MINIMUM",
  "detail": "La cantidad mínima para TAL-500 es 12 unidades",
  "instance": "/api/v1/cart/items",
  "correlationId": "req-abc123",
  "meta": { "sku": "TAL-500", "minOrderQty": 12, "qtyIncrement": 6 }
}
```

`meta` permite que el frontend construya un mensaje útil sin parsear prosa.

**Respuesta paginada**

```
{ "items": [...], "nextCursor": "eyJ..." | null, "totalCount": 1234 }
```

`totalCount` sólo si es barato de calcular; si no, se omite.

**Idempotencia**

```
POST /api/v1/checkout/confirm
Idempotency-Key: 01924f8a-...
```

Misma clave + mismo payload → misma respuesta. Misma clave + payload distinto →
`409 COMMON_IDEMPOTENCY_CONFLICT`.

## Antipatrones

- **Endpoints "hazlo todo"** con un parámetro `action`.
- **Devolver el modelo de Prisma**: la base de datos define la API pública.
- **Errores genéricos** (`500` para todo, o `400` para todo).
- **Nombres inconsistentes** entre endpoints (`user_id` aquí, `userId` allá).
- **Versionar por cabecera personalizada**: difícil de depurar, de cachear y de enrutar.
- **Contratos que dependen de tipos de NestJS o de React**: dejan de ser neutrales.

## Ejemplos

**Bien**

```
GET  /api/v1/catalog/variants?categoryId=...&attrs[color]=red&cursor=...&limit=20
POST /api/v1/cart/items                 { sku, quantity }
PATCH /api/v1/cart/items/:lineId        { quantity }
POST /api/v1/checkout/confirm           Idempotency-Key: <uuid>
```

**Mal**

```
POST /api/v1/cart          { action: "add" | "update" | "remove", ... }
GET  /api/v1/getProducts?page=3
POST /api/v1/order/create  → 200 { success: false, message: "no hay crédito" }
```

## Convenciones

- Rutas `kebab-case` plural: `/price-lists`.
- Cuerpos y respuestas en `camelCase`.
- Un archivo por recurso: `packages/contracts/src/<contexto>/<recurso>.contract.ts`.
- Esquemas: `<operacion>Request` / `<operacion>Response`.
- Códigos de error: `<CONTEXTO>_<CASO>` en `SCREAMING_SNAKE_CASE`.
- Fechas ISO-8601 UTC. Dinero como `{ amount: number, currency: string }`.
- `@eusse/contracts` no importa NestJS, React ni Prisma.

## Checklist

- [ ] Esquema Zod como única fuente de verdad
- [ ] Tipos derivados con `z.infer`, no escritos a mano
- [ ] Contract tests escritos antes de implementar
- [ ] Errores con `code` estable y mapeo HTTP fijo
- [ ] `meta` con los datos que el frontend necesita para el mensaje
- [ ] Paginación por cursor
- [ ] `Idempotency-Key` en mutaciones sensibles
- [ ] Versión en la URL
- [ ] OpenAPI regenerado
- [ ] `@eusse/sdk` actualizado
- [ ] Cambio rompedor → versión nueva + guía de migración
- [ ] Sin campos internos filtrados en la respuesta

## Plantillas

[`templates/api-contract.md`](../templates/api-contract.md) ·
[`rfcs/RFC-0012-api-contracts.md`](../rfcs/RFC-0012-api-contracts.md)
