# 14 — Estructura del repositorio

**Dueño:** Arquitecto · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Árbol completo. Las carpetas marcadas `[F0]` existen hoy; el resto se crea en su bloque
correspondiente de [06-implementation-order.md](06-implementation-order.md).

---

## Raíz

```
eusse-world/
├── .github/
│   ├── workflows/            ci.yml · e2e.yml · deploy.yml · lighthouse.yml
│   ├── ISSUE_TEMPLATE/       bug.md · feature.md · rfc.md
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── .claude/
│   ├── settings.json         permisos, hooks, modelo
│   ├── agents/               generado desde /agents — no editar a mano
│   └── skills/               generado desde /skills — no editar a mano
├── docs/                     [F0] documentación viva
├── agents/                   [F0] 30 agentes especializados
├── skills/                   [F0] skills por dominio
├── rfcs/                     [F0] propuestas de diseño
├── adrs/                     [F0] decisiones de arquitectura
├── checklists/               [F0] puertas de calidad
├── templates/                [F0] plantillas canónicas
├── scripts/                  [F0 spec] automatización del repo
├── apps/                     aplicaciones desplegables
├── packages/                 librerías compartidas
├── e2e/                      suites Playwright entre apps
├── docker/                   Dockerfiles y compose
├── .env.example
├── .gitignore · .editorconfig · .nvmrc · .npmrc
├── package.json · pnpm-workspace.yaml · turbo.json
├── CLAUDE.md                 contexto de entrada para agentes de IA
├── CONTRIBUTING.md
└── README.md                 [F0]
```

---

## `apps/`

### `apps/web` — público + portal de cliente

```
apps/web/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx · error.tsx · not-found.tsx
│   │       ├── (marketing)/       page · about · contact · legal
│   │       ├── (shop)/            catalog · c/[slug] · p/[slug] · search · cart · checkout
│   │       ├── (auth)/            login · register · forgot-password · verify
│   │       ├── (account)/         dashboard · orders · users · addresses · profile
│   │       └── api/               auth/[...] · webhooks/[...]   ← sólo BFF, sin negocio
│   ├── features/
│   │   ├── catalog/    components · hooks · stores · types
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── auth/
│   │   └── account/
│   ├── components/     marketing/ · layout/ · shared/
│   ├── lib/            api · auth · i18n · seo · analytics · utils
│   ├── styles/
│   └── middleware.ts   locale + protección de rutas
├── messages/           es.json · en.json
├── public/
└── next.config.ts · package.json · tsconfig.json
```

### `apps/admin` — back-office

```
apps/admin/
├── src/
│   ├── app/[locale]/
│   │   ├── (auth)/login
│   │   └── (dashboard)/  overview · accounts · users · products · categories
│   │                     price-lists · orders · content · settings · audit
│   ├── features/         accounts · catalog · pricing · orders · content · users
│   ├── components/       layout · data-table · forms
│   └── lib/
└── messages/ · next.config.ts
```

### `apps/api` — dominio y API

```
apps/api/
├── src/
│   ├── main.ts · app.module.ts
│   ├── config/                 esquema Zod del entorno
│   ├── shared-kernel/
│   │   ├── domain/             Money · Ids · Result · DomainEvent · DomainError · Clock
│   │   ├── application/        UseCase · CommandBus · QueryBus · EventBus
│   │   └── infrastructure/     Prisma · Redis · Outbox · Idempotency · Telemetry
│   ├── modules/
│   │   ├── identity/           domain · application · infrastructure · interface · public
│   │   ├── accounts/
│   │   ├── catalog/
│   │   ├── pricing/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── content/
│   │   ├── notifications/
│   │   ├── search/
│   │   ├── payments/           [F2]
│   │   ├── inventory/          [F2]
│   │   ├── shipping/           [F2]
│   │   ├── crm/                [F3]
│   │   └── courses/            [F4]
│   └── common/                 guards · interceptors · filters · decorators · pipes
├── prisma/
│   ├── schema/                 un archivo .prisma por contexto acotado
│   ├── migrations/
│   └── seed/
└── test/                       integration · contract
```

**Estructura interna de cada módulo** — invariable:

```
modules/<module>/
├── public/           ← LO ÚNICO importable por otros módulos
│   ├── <module>.facade.ts
│   └── <module>.types.ts
├── domain/           entities · value-objects · events · errors · ports · services
├── application/      commands · queries · handlers
├── infrastructure/   persistence · messaging · external
├── interface/        http · consumers
└── <module>.module.ts
```

### `apps/workers`

```
apps/workers/
└── src/
    ├── processors/   outbox-relay · notifications · search-index · reports · cleanup
    ├── schedulers/   abandoned-carts · price-expiry · reconciliation
    └── shared/
```

### `apps/mobile` [F4]

Expo + React Native. Consume `@eusse/sdk` y `@eusse/contracts` sin cambios en el backend.

---

## `packages/`

| Paquete | Contenido | Depende de |
| ------- | --------- | ---------- |
| `@eusse/utils` | Helpers puros: fechas, strings, `Result`, invariantes | — |
| `@eusse/tokens` | Tokens de diseño, `@theme` de Tailwind v4, light/dark | — |
| `@eusse/domain` | Tipos, enums, estados y reglas puras compartidas | utils |
| `@eusse/contracts` | Esquemas Zod, tipos de API, errores, generación de OpenAPI | domain, utils |
| `@eusse/ui` | Design system: primitivos, patrones, Storybook | tokens, utils |
| `@eusse/sdk` | Cliente HTTP tipado + hooks de TanStack Query (subpath opcional) | contracts |
| `@eusse/auth` | Sesión cliente/servidor, guards, helpers de permisos | contracts |
| `@eusse/i18n` | Configuración de next-intl, formateadores, utilidades de locale | — |
| `@eusse/analytics` | Puerto de eventos de producto, proveedores, consentimiento | utils |
| `@eusse/observability` | Logger, tracing, métricas, `correlationId` | utils |
| `@eusse/testing` | Setup de Vitest, Testcontainers, fábricas, matchers | — |
| `@eusse/config-typescript` | `tsconfig` base, next, nest, react, library | — |
| `@eusse/config-eslint` | Reglas base, react, next, nest, boundaries | — |
| `@eusse/config-tailwind` | Preset de Tailwind v4 | tokens |

Estructura de `@eusse/ui`:

```
packages/ui/src/
├── primitives/   button · input · select · checkbox · dialog · sheet · tooltip
│                 toast · popover · tabs · skeleton · badge · avatar
├── patterns/     data-table · form-field · empty-state · error-state
│                 page-header · stat-card · pagination
├── motion/       fade-in · slide-in · scroll-reveal · stagger
├── hooks/        use-media-query · use-theme · use-reduced-motion
└── lib/          cn · cva variants
```

---

## `e2e/`

```
e2e/
├── specs/
│   ├── marketing/   landing · seo · a11y
│   ├── auth/        register · login · refresh · logout
│   ├── shop/        search · filter · product · guest-add-to-cart ← crítico
│   ├── checkout/    happy-path · approval-flow · idempotency
│   ├── account/     reorder · users · addresses
│   └── admin/       accounts · products · prices · orders
├── fixtures/        auth · seed · accounts
└── support/         page objects · axe · visual
```

---

## Convención de archivos por tipo

| Tipo | Patrón |
| ---- | ------ |
| Componente | `PascalCase.tsx` |
| Hook | `use-kebab-case.ts` |
| Caso de uso | `kebab-case.use-case.ts` |
| Entidad | `kebab-case.entity.ts` |
| Value object | `kebab-case.vo.ts` |
| Evento | `kebab-case.event.ts` |
| Puerto | `kebab-case.port.ts` |
| Repositorio | `prisma-<agg>.repository.ts` |
| Contrato | `kebab-case.contract.ts` |
| Test unitario | `<archivo>.spec.ts` |
| Test E2E | `<flujo>.e2e.ts` |

Detalle completo: [03-conventions.md](03-conventions.md).
