# @eusse/contracts

**Fuente única de verdad de la API.** De un esquema Zod salen los tipos de TypeScript, la
validación en NestJS, el documento OpenAPI y el cliente tipado de `@eusse/sdk`
([ADR-0009](../../adrs/ADR-0009-zod-contracts.md)).

## Cuándo usarlo

Siempre que backend y frontend tengan que ponerse de acuerdo sobre la forma de un dato.

**El contrato se aprueba y se mergea primero.** Después backend y frontend trabajan en
paralelo sin bloquearse. Es la razón principal de que este paquete exista.

## Cuándo NO usarlo

- **No declares aquí tipos internos de un módulo.** Si sólo lo usa `apps/api`, vive en su
  módulo.
- **No importes NestJS, React ni Prisma.** Es el único punto de encuentro entre backend,
  frontend y —en Fase 4— móvil: si se acopla a un framework, deja de servir. Verificado
  en CI.
- **No escribas tipos a mano junto al esquema.** Se derivan con `z.infer`; si se escriben
  dos veces, divergen en la primera semana con prisa.

## Estructura

```
src/
├── shared/
│   ├── errors.ts       catálogo de códigos + problem+json (RFC 7807)
│   ├── primitives.ts   uuid, sku, money, fechas, slug, email, locale
│   └── pagination.ts   cursor, nunca offset
└── health/
    └── health.contract.ts
```

## Errores: el frontend reacciona al `code`, nunca al texto

```json
{
  "code": "CART_QTY_NOT_MULTIPLE",
  "status": 422,
  "detail": "TAL-500 se vende en cajas de 6 unidades",
  "meta": { "sku": "TAL-500", "requested": 7, "qtyIncrement": 6, "suggested": 12 }
}
```

`detail` es localizable y puede cambiar. `code` es un contrato. `meta` lleva lo que la
interfaz necesita para ofrecer la corrección ("Ajustar a 12") en vez de un mensaje
genérico.

Un test verifica que **todo código tiene mapeo HTTP** y que no hay mapeos huérfanos:
añadir un código sin su status rompe el build.

## Convenciones

| Regla        | Detalle                                                 |
| ------------ | ------------------------------------------------------- |
| Dinero       | `{ amount, currency }`, entero en la menor unidad       |
| Fechas       | ISO-8601 UTC sin offset                                 |
| Paginación   | Por cursor: `?cursor=&limit=` → `{ items, nextCursor }` |
| Idempotencia | `Idempotency-Key` en toda mutación que crea o cobra     |
| Versión      | En la URL: `/api/v1/`                                   |

Detalle completo: [RFC-0012](../../rfcs/RFC-0012-api-contracts.md).
