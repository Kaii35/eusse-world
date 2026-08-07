# API

## OpenAPI

El documento OpenAPI **se genera** desde los esquemas Zod de `@eusse/contracts` en cada
build. No se escribe a mano y no se commitea: se publica como artefacto.

- Local: `http://localhost:3001/api/docs`
- Fuente de verdad: `packages/contracts/src/**/*.contract.ts`

Ver [ADR-0009](../../adrs/ADR-0009-zod-contracts.md) y [RFC-0012](../../rfcs/RFC-0012-api-contracts.md).

## Reglas de uso

| Regla | Detalle |
| ----- | ------- |
| Versión | En la URL: `/api/v1/` |
| Autenticación | Cookies httpOnly emitidas por `/auth/login` |
| Ámbito | El `accountId` sale **siempre de la sesión**; enviarlo no tiene efecto |
| Paginación | Por cursor: `?cursor=&limit=` → `{ items, nextCursor }` |
| Idempotencia | `Idempotency-Key` en toda mutación que crea o cobra |
| Errores | *problem+json* con `code` estable y `meta` accionable |
| Precios | Nunca cacheables en capa compartida (`private, no-store` + `Vary: Cookie`) |

**El cliente reacciona al `code`, nunca al texto de `detail`.** El texto es localizable y
puede cambiar; el código no.

Catálogo de errores: [`docs/02-domain-model.md`](../02-domain-model.md) §6.

## Guías

*Se añadirán conforme se implementen los módulos (Bloques B en adelante).*
