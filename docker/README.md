# docker/

Entorno de desarrollo local (paso A3 del Bloque A).

```bash
pnpm db:up      # levanta PostgreSQL, Redis, MailHog y MinIO
pnpm db:logs
pnpm db:down
```

| Servicio      | Puerto | Para qué                           | Interfaz              |
| ------------- | ------ | ---------------------------------- | --------------------- |
| PostgreSQL 16 | 5432   | Fuente de verdad transaccional     | —                     |
| Redis 7       | 6379   | Caché, rate limiting, colas BullMQ | —                     |
| MailHog       | 1025   | Correo transaccional en local      | http://localhost:8025 |
| MinIO         | 9000   | Almacenamiento de medios (S3)      | http://localhost:9001 |

## PostgreSQL

`postgres/init/01-schemas.sql` crea **un esquema por contexto acotado** ([ADR-0006](../adrs/ADR-0006-postgres-prisma.md))
y las extensiones `pg_trgm` (búsqueda tolerante a erratas) y `pg_stat_statements`
(diagnóstico de consultas lentas).

Se ejecuta **sólo al crear el volumen**. Para reejecutarlo: `pnpm db:down && docker volume rm eusse-world_postgres-data`.

`log_min_duration_statement=200` registra en local toda consulta que pase de 200 ms —
el mismo umbral que el presupuesto de producción ([docs/04-standards.md](../docs/04-standards.md) §6).

## Credenciales

Son de desarrollo local y están en claro a propósito. **En cualquier otro entorno los
secretos van en el gestor del entorno**, nunca en el repositorio.
