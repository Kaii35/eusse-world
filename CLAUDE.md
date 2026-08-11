# CLAUDE.md — Contexto para agentes de IA

Punto de entrada para cualquier agente que trabaje en este repositorio.
**Léelo entero antes de tocar nada.**

---

## Estado del proyecto

**Fase 0 aprobada. Sprint 0 en curso** — Bloque A de
[`docs/06-implementation-order.md`](docs/06-implementation-order.md).

Lo que ya existe y está verificado (`lint` · `typecheck` · `test` en verde):

| Paso   | Entregable                                                                      | Estado       |
| ------ | ------------------------------------------------------------------------------- | ------------ |
| A1     | Monorepo: pnpm workspaces, Turborepo                                            | ✅           |
| A2     | `@eusse/config-typescript`, `-eslint`, `-tailwind`; Prettier; commitlint; husky | ✅           |
| A3     | Docker Compose: PostgreSQL, Redis, MailHog, MinIO                               | ✅           |
| A4     | CI en GitHub Actions                                                            | ✅           |
| A5     | `apps/api`: NestJS, config validada, `correlationId`, filtro de errores, health | ✅           |
| A6     | Prisma: un schema por contexto, outbox, idempotencia, migración inicial         | ✅           |
| A7     | `@eusse/contracts`: catálogo de errores, primitivos, paginación por cursor      | ✅           |
| A8     | `@eusse/tokens` con contraste AA verificado por test                            | ✅           |
| —      | `@eusse/utils`, `@eusse/domain` (`Money`, IDs, reglas de cantidad)              | ✅           |
| A9–A15 | ui, web, admin, workers, relay del outbox, testing, Playwright                  | ⏳ pendiente |

Verificado en ejecución, no sólo compilado:

- `GET /api/v1/health/live` → 200 · `/health/ready` → 200 con PostgreSQL y Redis en pie,
  503 y `degraded` con una dependencia caída.
- `apps/web` sirve `/es` y `/en` prerenderizadas, con `canonical` y `hreflang` absolutos.
  JS inicial: 108 kB (presupuesto de la landing: 120 kB).
- **Puerta A superada:** un evento insertado en `shared.outbox_events` pasa a `SENT`, se
  publica en BullMQ y el consumidor lo procesa una sola vez, con el `correlationId`
  intacto hasta el worker.

**Bloque A cerrado.** El Bloque B (Identidad, RFC-0003) está desbloqueado.

**Sólo se implementa lo que cubre un RFC ya aprobado.** Los bloques D, E y F siguen
bloqueados: RFC-0005, RFC-0006 y RFC-0007 están en `Borrador` y requieren validar el
modelo de precios contra listas reales del negocio.

---

## La regla fundamental

> **Ningún módulo, feature o endpoint se implementa si antes no existen sus nueve
> artefactos de diseño:**
> RFC · ADR · Checklist · Diseño · Casos de uso · Modelo de dominio · Contratos ·
> Interfaces · Eventos, estados y errores.

Un PR de tipo `feat` sin RFC referenciado **se cierra sin revisar**.
`fix`, `chore`, `docs`, `test` y `refactor` no necesitan RFC.

Verificación: [`checklists/pre-code.md`](checklists/pre-code.md).

---

## Tu contexto mínimo

**No leas el repositorio entero.** Lee exactamente cinco cosas:

```
1. agents/<tu-agente>.md          quién eres, qué puedes tocar
2. skills/<tu-dominio>.md         cómo se hace bien aquí
3. rfcs/RFC-XXXX-<feature>.md     qué construyes ahora
4. docs/03-conventions.md         reglas mecánicas
5. checklists/<dominio>.md        cuándo has terminado
```

Todo lo demás se consulta **bajo demanda y con enlace explícito**.

Estrategia completa: [`docs/10-ai-strategy.md`](docs/10-ai-strategy.md).

---

## Prohibiciones absolutas

1. Escribir código de producto sin RFC aprobado que lo cubra.
2. Tocar archivos fuera del ámbito declarado en tu agente.
3. **Tomar una decisión de arquitectura.** Si hace falta decidir, **para y emite un BLOQUEO**.
4. **Inventar una convención.** Si falta, para y pregunta.
5. Añadir una dependencia sin ADR.
6. Modificar un contrato de `@eusse/contracts` sin actualizar consumidores y tests.
7. Desactivar un test, un lint o una puerta de CI para que pase.
8. Dejar `any`, `@ts-ignore` injustificado, `TODO` sin issue, o código comentado.
9. Mergear sin revisión humana (regla vigente durante toda la Fase 1).

---

## Reglas técnicas que se violan más a menudo

- `apps/api/src/modules/*/domain/` **no importa NestJS, Prisma ni ningún framework**.
- Prisma **sólo** en `infrastructure/persistence/`.
- Un módulo sólo importa el `public/` de otro. Nunca su `domain/`.
- **`accountId` sale de la sesión, jamás del cliente.** (Prevención de IDOR.)
- **Ningún precio, total ni impuesto se calcula en el cliente.**
- Ninguna respuesta con precio de cuenta es cacheable en capa compartida.
- Cero literales de texto en el código: todo por `next-intl`.
- Cero valores mágicos de Tailwind: todo desde `@eusse/tokens`.
- Server Component por defecto; `"use client"` lo más abajo posible.
- Datos del servidor en TanStack Query, **nunca** copiados a Zustand.
- Los eventos se publican por **outbox**, dentro de la transacción.
- Todo consumidor de eventos es **idempotente** por `eventId`.

---

## Idioma

| Qué                                            | Idioma                                      |
| ---------------------------------------------- | ------------------------------------------- |
| Documentación, RFC, ADR, comentarios de diseño | **Español**                                 |
| Código, identificadores, tablas, columnas      | **Inglés**                                  |
| Ramas y mensajes de commit                     | **Inglés**                                  |
| Textos de interfaz                             | Ninguno en el código — todo vía `next-intl` |

---

## Cuando algo es ambiguo

**No adivines.** Emite un BLOQUEO:

```markdown
## BLOQUEO

**Agente:** …
**Tarea:** RFC-XXXX · …
**Ambigüedad:** …
**Opciones:** A) … B) … C) …
**Recomendación:** … porque …
**Impacto:** bloquea X. No bloquea Y.
```

La resolución **modifica el RFC**, para que la ambigüedad no vuelva.

---

## Cuando entregas

```markdown
## ENTREGA

**Tarea:** …
**Archivos:** (creados / modificados)
**Decisiones tomadas dentro del margen del RFC:** … o "ninguna"
**Checklist:** … — todos los ítems marcados
**Tests:** N unitarios, M de integración. Cobertura de dominio: X%
**Puertas de CI:** lint ✅ types ✅ tests ✅ fronteras ✅ build ✅
**Deuda introducida:** ninguna / descrita y registrada en docs/tech-debt.md
**Qué NO hice y por qué:** …
**Siguiente paso sugerido:** …
```

---

## Mapa rápido

| Necesitas                  | Ve a                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Entender el proyecto       | [`docs/00-vision.md`](docs/00-vision.md)                                                                                        |
| Entender la arquitectura   | [`docs/01-architecture.md`](docs/01-architecture.md)                                                                            |
| Modelar o nombrar algo     | [`docs/02-domain-model.md`](docs/02-domain-model.md) · [`docs/13-glossary.md`](docs/13-glossary.md)                             |
| Saber cómo se escribe aquí | [`docs/03-conventions.md`](docs/03-conventions.md)                                                                              |
| Saber cuándo has terminado | [`docs/04-standards.md`](docs/04-standards.md)                                                                                  |
| Saber qué toca ahora       | [`docs/06-implementation-order.md`](docs/06-implementation-order.md) · [`docs/11-execution-plan.md`](docs/11-execution-plan.md) |
| Saber qué puede fallar     | [`docs/08-technical-risks.md`](docs/08-technical-risks.md)                                                                      |
| Diseñar interfaz           | [`docs/12-ux-guidelines.md`](docs/12-ux-guidelines.md) + skill `ui-ux-pro-max`                                                  |

---

## Skills externas

`ui-ux-pro-max` — **obligatoria** para los agentes UI, UX y Design System antes de diseñar
o construir cualquier pantalla. Aporta paletas, tipografía, estilos y guías de UX.

**Ante conflicto con este repositorio, gana `@eusse/tokens` y
[`docs/12-ux-guidelines.md`](docs/12-ux-guidelines.md).**
