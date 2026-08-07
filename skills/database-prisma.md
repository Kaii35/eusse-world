# Skill — Base de datos con Prisma

## Objetivo

Un esquema correcto, consultas rápidas y migraciones que no tumban producción.

## Buenas prácticas

- **Un esquema PostgreSQL por contexto acotado.** Impide joins accidentales entre contextos
  y permite separar bases de datos después sin refactor.
- **Sin claves foráneas entre contextos.** La referencia cruzada se guarda por ID.
- **Restricciones en la base de datos, no sólo en la aplicación.** `UNIQUE`, `CHECK`,
  `NOT NULL`. La aplicación tiene bugs; la base de datos no cede.
- **UUID v7** para toda clave primaria. Ordenable en el tiempo, sin colisiones, sin revelar
  volumen de negocio.
- **Dinero en `numeric(18,4)` + columna de moneda.** Nunca `float`, nunca `double`.
- **`timestamptz` siempre**, en UTC.
- **`EXPLAIN ANALYZE` en toda consulta de listado**, adjunto al PR. No es opcional.
- **Índice con comentario**: qué consulta sirve y por qué existe.
- **Migraciones expand → migrate → contract**, en tres despliegues.
- **`select` explícito** en las consultas: nunca traer columnas que no se usan.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| `float` para dinero | Errores de céntimos que se acumulan; imposible cuadrar |
| ID autoincremental | Enumerable; revela volumen; colisiona al fusionar entornos |
| `DROP COLUMN` en el mismo despliegue | Ventana de caída entre versiones |
| `CREATE INDEX` sin `CONCURRENTLY` | Bloqueo de escritura en tabla grande |
| Migración sin ensayar con volumen real | Un `ALTER` de 40 minutos en producción |
| Consulta sin índice | Funciona con 100 filas, muere con 100 000 |
| `include` anidado profundo en Prisma | Consultas monstruosas; trae MB innecesarios |
| Consultar dentro de un bucle | N+1 clásico |
| `$queryRaw` con interpolación de strings | Inyección SQL |
| Borrado lógico por defecto en todo | Toda consulta necesita `WHERE deleted_at IS NULL`; se olvida una y filtra datos |

## Patrones

**Expand → migrate → contract**

```
Despliegue 1 (expand):   añadir columna nueva, nullable. Código escribe en ambas.
Despliegue 2 (migrate):  backfill por lotes. Código lee de la nueva.
Despliegue 3 (contract): eliminar la columna vieja.
```

**Backfill por lotes** — nunca un `UPDATE` de un millón de filas. Lotes de 1 000 con pausa,
en un job, con progreso registrado y reanudable.

**Repositorio con ámbito de cuenta obligatorio** — el tipo no permite consultar sin
`accountId`:

```
findById(accountId: AccountId, id: OrderId): Promise<Order | null>
// no existe findById(id) — el compilador previene el IDOR
```

**Paginación por cursor**

```
WHERE (created_at, id) < ($cursorCreatedAt, $cursorId)
ORDER BY created_at DESC, id DESC LIMIT $limit + 1
```

Estable ante inserciones, y sin el coste creciente del `OFFSET`.

**Índice GIN para atributos JSONB y búsqueda de texto**

```
CREATE INDEX CONCURRENTLY idx_variant_attrs ON catalog.variants USING gin (attributes);
-- sirve: filtro por facetas en el listado de catálogo (RFC-0005)
```

## Antipatrones

- **EAV (entidad-atributo-valor)**: consultas imposibles, sin tipos, sin restricciones.
  Usa JSONB con esquema validado.
- **Una tabla `settings` con `key`/`value` para todo**: sin tipos, sin validación.
- **Tabla `users` compartida entre contextos**: cada contexto tiene su vista del usuario.
- **`SELECT *`**: trae columnas que no necesitas y rompe cuando se añade una.
- **Triggers con lógica de negocio**: invisible desde el código, imposible de testear.
- **Índices "por si acaso"**: cada índice ralentiza las escrituras.

## Ejemplos

**Bien**

```prisma
model Order {
  id              String   @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  accountId       String   @map("account_id") @db.Uuid   // sin FK: otro contexto
  orderNumber     String   @unique @map("order_number")
  status          String
  totalAmount     Decimal  @map("total_amount") @db.Decimal(18, 4)
  totalCurrency   String   @map("total_currency") @db.Char(3)
  idempotencyKey  String?  @map("idempotency_key")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz

  @@unique([accountId, idempotencyKey])       // previene órdenes duplicadas
  @@index([accountId, createdAt(sort: Desc)]) // sirve: listado de órdenes del portal
  @@map("orders")
  @@schema("orders")
}
```

**Mal**

```prisma
model Order {
  id      Int    @id @default(autoincrement())  // enumerable
  total   Float                                  // dinero en float
  status  String                                 // sin check
  userId  Int                                    // FK a otro contexto
}
```

## Convenciones

- Tablas `snake_case` plural; columnas `snake_case`; mapeo con `@map`.
- Toda tabla: `id`, `created_at`, `updated_at`. Las de negocio, además `tenant_id`.
- Un archivo `.prisma` por contexto en `prisma/schema/`.
- Migraciones con nombre descriptivo: `20260806_add_order_idempotency_key`.
- Todo índice con comentario `-- sirve: <consulta>`.
- Seeds deterministas y realistas: ≥ 2 000 SKUs, ≥ 50 cuentas.

## Checklist

- [ ] Un esquema por contexto; sin FK cruzadas
- [ ] `numeric` + moneda para dinero
- [ ] UUID v7 como clave primaria
- [ ] `timestamptz` en UTC
- [ ] Restricciones únicas y checks en la base de datos
- [ ] Índices justificados y verificados con `EXPLAIN ANALYZE`
- [ ] Sin índices redundantes ni sin uso
- [ ] Migración expand→migrate→contract
- [ ] `CREATE INDEX CONCURRENTLY`
- [ ] `lock_timeout` y `statement_timeout` en la migración
- [ ] Ensayada con volumen de producción
- [ ] Plan de reversión escrito
- [ ] Repositorio con ámbito de cuenta obligatorio
- [ ] Paginación por cursor
- [ ] Sin N+1

## Plantillas

[`checklists/database-migration.md`](../checklists/database-migration.md) ·
[`templates/domain-model.md`](../templates/domain-model.md)
