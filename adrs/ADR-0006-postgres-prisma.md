# ADR-0006 — PostgreSQL + Prisma, un esquema por contexto acotado

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001, RFC-0002 |
| ------ | --- |

## Contexto

El dominio es relacional y transaccional: órdenes, líneas, precios y crédito exigen
consistencia fuerte. Además, con un monolito modular hace falta un mecanismo que impida
que los módulos se acoplen por la base de datos, que es la forma más común de romper
fronteras sin darse cuenta.

## Decisión

**PostgreSQL 16** como única fuente de verdad transaccional, con **Prisma** como ORM.

**Un `schema` de PostgreSQL por contexto acotado** (`identity`, `catalog`, `pricing`,
`cart`, `orders`, …), **sin claves foráneas entre esquemas**.

Convenciones obligatorias: UUID v7 como clave primaria · dinero en `numeric(18,4)` + columna
de moneda · `timestamptz` en UTC · `tenant_id` en toda tabla de negocio · migraciones
expand → migrate → contract.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| MongoDB | El dominio es relacional; las transacciones multi-documento son un parche |
| Una base de datos por módulo desde el día 1 | Coste operativo sin beneficio; el esquema por contexto da el mismo aislamiento lógico |
| Drizzle | Buena opción y más ligera, pero Prisma tiene migraciones y tooling más maduros para un equipo pequeño |
| TypeORM | Historial de problemas de mantenimiento y de comportamiento sorprendente en migraciones |
| Prisma con un solo esquema | No impide joins accidentales entre contextos: la frontera se rompería en el primer sprint con prisa |

## Consecuencias

**Positivas** — consistencia fuerte donde el negocio la exige · las fronteras entre
contextos están reforzadas por la propia base de datos · migrar un contexto a su propia
instancia después es viable sin tocar código de dominio · Prisma da tipos y migraciones
versionadas.

**Negativas** — sin FK cruzadas, la integridad referencial entre contextos es
responsabilidad de la aplicación (es el precio consciente del aislamiento) · Prisma genera
consultas subóptimas en casos complejos, que hay que revisar con `EXPLAIN` · el cliente de
Prisma es pesado en entornos serverless.

**Neutras** — obliga a revisar el plan de cada consulta de listado, lo cual es buena
práctica.

## Criterio de revisión

Si un contexto necesita un modelo de datos radicalmente distinto (series temporales, grafo)
se añade el almacén adecuado **para ese contexto**, no se cambia el general.

## Enlaces

[RFC-0002](../rfcs/RFC-0002-b2b-domain-model.md) ·
[`skills/database-prisma.md`](../skills/database-prisma.md) ·
[`checklists/database-migration.md`](../checklists/database-migration.md)
