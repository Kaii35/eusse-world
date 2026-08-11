# Eusse World

Plataforma B2B: landing, ecommerce mayorista, portal de cliente y back-office administrativo.
Preparada para crecer hacia CRM, Inventario, Cursos y App móvil.

> **Estado: Fase 0 aprobada · Sprint 0 en curso.** Las fundaciones del monorepo están en
> pie y verificadas; las aplicaciones aún no. Detalle en [`CLAUDE.md`](CLAUDE.md) y
> [`docs/11-execution-plan.md`](docs/11-execution-plan.md).

## Empezar

```bash
pnpm install
pnpm db:up        # PostgreSQL, Redis, MailHog, MinIO
pnpm test         # 109 tests
pnpm lint && pnpm typecheck
```

---

## Regla fundamental

> **Ningún módulo se implementa si antes no existen sus nueve artefactos de diseño.**

RFC · ADR · Checklist · Diseño · Casos de uso · Modelo de dominio · Contratos ·
Interfaces · Eventos · Estados · Errores.

El detalle y el criterio de aceptación de esta regla están en
[`docs/04-standards.md`](docs/04-standards.md) y
[`checklists/pre-code.md`](checklists/pre-code.md).

---

## Mapa del repositorio

| Carpeta       | Qué contiene                                                              |
| ------------- | ------------------------------------------------------------------------- |
| `docs/`       | Documentación viva: visión, arquitectura, dominio, convenciones, roadmap. |
| `agents/`     | 30 agentes especializados. Contrato de trabajo de cada rol.               |
| `skills/`     | Skills por dominio: cómo se hace bien cada cosa en este repo.             |
| `rfcs/`       | Propuestas de diseño. Se aprueban **antes** de escribir código.           |
| `adrs/`       | Decisiones de arquitectura registradas e inmutables.                      |
| `checklists/` | Puertas de calidad verificables.                                          |
| `templates/`  | Plantillas canónicas de todo artefacto.                                   |
| `scripts/`    | Automatización del repo (especificada en Fase 0, implementada en Fase 1). |
| `apps/`       | Aplicaciones desplegables.                                                |
| `packages/`   | Librerías compartidas del monorepo.                                       |

Estructura detallada: [`docs/14-repo-structure.md`](docs/14-repo-structure.md).

## Aplicaciones

| App            | Qué es                                                                | Fase |
| -------------- | --------------------------------------------------------------------- | ---- |
| `apps/web`     | Landing + catálogo + carrito + checkout + portal de cliente (Next.js) | 1    |
| `apps/admin`   | Back-office administrativo (Next.js)                                  | 1    |
| `apps/api`     | API y núcleo de dominio (NestJS)                                      | 1    |
| `apps/workers` | Consumidores BullMQ, jobs y proyecciones                              | 1    |
| `apps/mobile`  | App móvil (Expo)                                                      | 4    |

## Paquetes

`@eusse/tokens` · `@eusse/ui` · `@eusse/contracts` · `@eusse/domain` · `@eusse/sdk` ·
`@eusse/auth` · `@eusse/i18n` · `@eusse/analytics` · `@eusse/observability` ·
`@eusse/testing` · `@eusse/utils` · `@eusse/config-*`

## Stack

**Frontend** React 19 · Next.js App Router · TypeScript · TailwindCSS v4 · Motion ·
Radix UI · shadcn/ui · Zustand · TanStack Query · React Hook Form · Zod · next-intl

**Backend** NestJS · PostgreSQL · Prisma · Redis · BullMQ

**Infra** Turborepo · pnpm · Docker · GitHub Actions

## Por dónde empezar

1. **Si vas a decidir algo**: lee [`docs/01-architecture.md`](docs/01-architecture.md) y los ADR vigentes.
2. **Si vas a implementar**: lee tu agente en `agents/`, tu skill en `skills/`, y el RFC del módulo.
3. **Si vas a revisar**: usa [`checklists/pr-review.md`](checklists/pr-review.md).
4. **Si eres un agente de IA**: empieza por [`docs/10-ai-strategy.md`](docs/10-ai-strategy.md).

## Idioma

Documentación y comunicación en **español**. Código, identificadores, nombres de
archivo, ramas y mensajes de commit en **inglés**. Ver [`docs/03-conventions.md`](docs/03-conventions.md).
