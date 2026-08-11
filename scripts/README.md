# Scripts

Automatización del repositorio. **Especificados en Fase 0, implementados en el Sprint 0** —
esta fase no produce código.

Cada script se implementa con Node y TypeScript (`tsx`), sin dependencias pesadas, y se
expone como comando de `package.json`.

---

## Sincronización con Claude Code

### `sync-claude.ts` → `pnpm sync:claude`

**Problema:** las carpetas raíz `agents/` y `skills/` son la fuente de verdad (versionadas,
revisables, legibles por cualquier herramienta). Claude Code, en cambio, busca sus
definiciones en `.claude/agents/` y `.claude/skills/`.

**Solución:** este script genera `.claude/` a partir de las carpetas raíz.

- Lee `agents/*.md` (con frontmatter `name` y `description`) y los copia a `.claude/agents/`.
- Lee `skills/*.md` y genera `.claude/skills/<nombre>/SKILL.md` con su frontmatter.
- Falla si un archivo carece de frontmatter válido.
- **`.claude/agents` y `.claude/skills` nunca se editan a mano.** Se regeneran.

Se ejecuta en el hook `pre-commit` y en CI, que verifica que `.claude/` está sincronizado.

---

## Generadores

Existen para eliminar el trabajo repetitivo de la arquitectura hexagonal y evitar que la
ceremonia desmotive (riesgo R-06).

### `gen-module.ts` → `pnpm gen:module <nombre>`

Crea la estructura completa de un módulo en `apps/api`: `public/`, `domain/`,
`application/`, `infrastructure/`, `interface/`, su `*.module.ts`, su esquema Prisma y su
entrada en el grafo de dependencias.

### `gen-use-case.ts` → `pnpm gen:use-case <módulo> <nombre>`

Crea el caso de uso, su comando o consulta, su test de integración en rojo y lo registra en
el módulo.

### `gen-component.ts` → `pnpm gen:component <nombre>`

Crea el componente, su story y su test de comportamiento accesible, con la estructura de
[`templates/component.md`](../templates/component.md).

### `gen-rfc.ts` → `pnpm gen:rfc "<título>"`

Crea el siguiente `RFC-NNNN` desde la plantilla, con la numeración correcta, y lo añade al
índice.

### `gen-adr.ts` → `pnpm gen:adr "<título>"`

Igual, para ADRs.

---

## Verificación

### `check-i18n.ts` → `pnpm check:i18n`

Verifica **paridad de claves** entre `messages/es.json` y `messages/en.json` en todas las
apps. Falla listando las claves faltantes. **Puerta de CI.**

### `check-boundaries.ts` → `pnpm check:boundaries`

Ejecuta `dependency-cruiser` y **compara el grafo real con
[`docs/07-module-dependencies.md`](../docs/07-module-dependencies.md)**. Cualquier arista no
declarada es un fallo. **Puerta de CI.**

### `check-docs.ts` → `pnpm check:docs`

Verifica enlaces internos rotos en `docs/`, `rfcs/`, `adrs/`, `agents/`, `skills/`,
`checklists/` y `templates/`. **Puerta de CI.**

### `check-migration.ts` → `pnpm check:migration`

Analiza las migraciones de Prisma pendientes y falla ante operaciones peligrosas:
`DROP COLUMN`, `RENAME`, `CREATE INDEX` sin `CONCURRENTLY`, `ALTER` bloqueante en tabla
grande, o migración sin `lock_timeout`. **Puerta de CI.**

### `check-env.ts` → `pnpm check:env`

Verifica que toda variable usada en el código está documentada en `.env.example` y que
ninguna variable con prefijo `NEXT_PUBLIC_` contiene algo que parezca un secreto.

---

## Datos

### `seed.ts` → `pnpm db:seed`

Datos realistas y **deterministas**: ≥ 50 cuentas con distintos estados y listas de precios,
≥ 2 000 SKUs con atributos y medios, órdenes en todos los estados, usuarios con todos los
roles. Sin esto, los problemas de rendimiento aparecen en producción.

### `db-reset.ts` → `pnpm db:reset`

Borra, migra y siembra. Sólo en local; **falla si detecta un entorno que no sea `local`**.

---

## Convenciones para todo script

- TypeScript ejecutado con `tsx`; sin build previo.
- Salida legible: qué hizo, qué falló y **por qué**.
- Código de salida distinto de 0 si falla (para que CI lo detecte).
- Idempotentes: ejecutarlos dos veces no rompe nada.
- Sin efectos destructivos sin confirmación explícita o sin verificar el entorno.
- Documentados aquí antes de implementarse.
