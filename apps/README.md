# apps/

Aplicaciones desplegables. **Las apps no se importan entre sí**: lo común sube a
`packages/`.

> Estas carpetas están vacías. El código se crea en el **Sprint 0** (Bloque A de
> [`docs/06-implementation-order.md`](../docs/06-implementation-order.md)).

| App                   | Qué es                                                                | Puerto local | Fase | Paso |
| --------------------- | --------------------------------------------------------------------- | ------------ | ---- | ---- |
| [`web`](web/)         | Landing + catálogo + carrito + checkout + portal de cliente (Next.js) | 3000         | 1    | A10  |
| [`admin`](admin/)     | Back-office administrativo (Next.js)                                  | 3002         | 1    | A11  |
| [`api`](api/)         | API y núcleo de dominio (NestJS)                                      | 3001         | 1    | A5   |
| [`workers`](workers/) | Consumidores BullMQ, jobs y proyecciones (NestJS standalone)          | —            | 1    | A12  |
| [`mobile`](mobile/)   | App móvil (Expo)                                                      | —            | 4    | —    |

## Reglas

- **Ninguna app habla con PostgreSQL, Redis ni con terceros directamente.** Todo pasa por
  `apps/api`.
- `web` y `admin` son apps separadas por diferencias de riesgo, bundle y cadencia de
  despliegue. Ver [ADR-0004](../adrs/ADR-0004-web-admin-split.md).
- `mobile` consumirá `@eusse/sdk` y `@eusse/contracts` **sin cambios en el backend**: esa es
  la razón de que los contratos sean neutrales ([ADR-0009](../adrs/ADR-0009-zod-contracts.md)).
- Los Route Handlers de Next (`app/api/`) son **sólo BFF**: sesión y webhooks. Cero lógica
  de negocio.

Estructura interna detallada: [`docs/14-repo-structure.md`](../docs/14-repo-structure.md).
