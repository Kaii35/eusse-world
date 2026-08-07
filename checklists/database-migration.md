# Checklist — Migración de base de datos

Obligatoria en **todo** cambio de esquema. Una migración mal hecha es la forma más rápida
de tumbar producción (riesgo R-09).

---

## Diseño

- [ ] El cambio está justificado por un RFC aprobado
- [ ] Convenciones respetadas: `snake_case`, `id uuid`, `created_at`, `updated_at`,
      `tenant_id` en tablas de negocio
- [ ] Dinero en `numeric(18,4)` + columna de moneda. **Nunca `float`**
- [ ] Fechas en `timestamptz`, UTC
- [ ] UUID v7 como clave primaria
- [ ] Tabla en el **esquema del contexto correcto**
- [ ] **Sin claves foráneas hacia otro contexto acotado**
- [ ] Restricciones en la base de datos, no sólo en la aplicación (`UNIQUE`, `CHECK`,
      `NOT NULL`)

## Índices

- [ ] Todo índice tiene comentario con la consulta que sirve
- [ ] Verificado con `EXPLAIN ANALYZE` que la consulta objetivo lo usa
- [ ] Sin índices redundantes (prefijo de otro existente)
- [ ] `CREATE INDEX CONCURRENTLY` en tablas con datos
- [ ] Coste en escritura considerado y aceptado

## Seguridad de la migración

- [ ] **Patrón expand → migrate → contract** respetado
- [ ] **Ningún `DROP COLUMN` o `RENAME` en el mismo despliegue** que deja de usarla
- [ ] `lock_timeout` y `statement_timeout` establecidos
- [ ] Sin `ALTER TABLE` bloqueante en tablas grandes
- [ ] Backfill **por lotes**, en un job, reanudable y con progreso registrado
- [ ] Sin `UPDATE` masivo en una sola sentencia

## Pruebas

- [ ] Migración aplicada con éxito en local
- [ ] **Ensayada contra una copia de producción** con volumen realista
- [ ] Tiempo de ejecución medido y aceptable
- [ ] Bloqueos verificados con `pg_locks` durante el ensayo
- [ ] Tests de integración en verde con el esquema nuevo
- [ ] Verificado que la versión **anterior** del código sigue funcionando con el esquema
      nuevo (requisito del patrón expand)

## Reversión

- [ ] Migración de reversión escrita, **o** plan de corrección hacia adelante documentado
- [ ] Reversión probada en entorno de pruebas
- [ ] Si no es reversible, está declarado explícitamente y aprobado

## Despliegue

- [ ] **La migración se despliega antes que el código** que la usa
- [ ] Orden de despliegue coordinado con DevOps
- [ ] Ventana de despliegue acordada si el cambio es sensible
- [ ] Monitorización activa durante y después
- [ ] Copia de seguridad reciente y **verificada** antes de migrar en producción

## Documentación

- [ ] Nombre de migración descriptivo (`20260806_add_order_idempotency_key`)
- [ ] `docs/domain/<contexto>.md` actualizado
- [ ] Datos personales nuevos identificados, con su política de retención

---

## Referencia rápida: expand → migrate → contract

```
Despliegue 1 (expand)
  ALTER TABLE ... ADD COLUMN new_col ... NULL     -- nullable, sin default costoso
  El código escribe en la columna vieja Y en la nueva

Despliegue 2 (migrate)
  Backfill por lotes de 1.000 filas
  El código lee de la columna nueva

Despliegue 3 (contract)
  ALTER TABLE ... DROP COLUMN old_col
```

**Nunca los tres pasos en el mismo despliegue.**
