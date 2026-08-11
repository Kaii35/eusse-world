# ADRs — Architecture Decision Records

Registro **inmutable** de las decisiones de arquitectura. Un ADR aceptado nunca se edita:
si la decisión cambia, se escribe uno nuevo que lo supersede.

## Por qué existen

El mayor valor de un ADR no es documentar lo que se hizo, sino **lo que se descartó y por
qué**. Sin ese registro, cada trimestre alguien vuelve a proponer microservicios y se
repite la misma discusión con menos información.

## Reglas

1. **Un ADR = una decisión.** Si tiene dos, son dos ADR.
2. **No se editan.** Se supersedan (`Supersedido por ADR-YYYY`).
3. **Toda decisión declara sus consecuencias negativas.** Una decisión sin coste no es una
   decisión: es una preferencia.
4. **Toda decisión declara su criterio de revisión**: qué hecho o métrica la invalidaría.
5. La numeración es correlativa y nunca se reutiliza.

Plantilla: [`templates/adr.md`](../templates/adr.md)

## Índice

| ADR                                      | Decisión                                                  | Estado   |
| ---------------------------------------- | --------------------------------------------------------- | -------- |
| [0001](ADR-0001-turborepo-pnpm.md)       | Turborepo + pnpm como monorepo                            | Aceptado |
| [0002](ADR-0002-modular-monolith.md)     | Monolito modular sobre microservicios                     | Aceptado |
| [0003](ADR-0003-nextjs-app-router.md)    | Next.js App Router con React Server Components            | Aceptado |
| [0004](ADR-0004-web-admin-split.md)      | `apps/web` y `apps/admin` como aplicaciones separadas     | Aceptado |
| [0005](ADR-0005-nestjs-backend.md)       | NestJS como framework de backend                          | Aceptado |
| [0006](ADR-0006-postgres-prisma.md)      | PostgreSQL + Prisma, un esquema por contexto              | Aceptado |
| [0007](ADR-0007-redis-bullmq.md)         | Redis + BullMQ para caché y colas                         | Aceptado |
| [0008](ADR-0008-auth-strategy.md)        | Autenticación propia con JWT en cookies httpOnly          | Aceptado |
| [0009](ADR-0009-zod-contracts.md)        | Zod como fuente de verdad de los contratos                | Aceptado |
| [0010](ADR-0010-tailwind-v4-tokens.md)   | TailwindCSS v4 con tokens CSS-first                       | Aceptado |
| [0011](ADR-0011-radix-shadcn.md)         | Radix + shadcn/ui copiado a `packages/ui`                 | Aceptado |
| [0012](ADR-0012-state-management.md)     | TanStack Query para servidor, Zustand para UI             | Aceptado |
| [0013](ADR-0013-next-intl-routing.md)    | next-intl con prefijo de ruta por locale                  | Aceptado |
| [0014](ADR-0014-transactional-outbox.md) | Outbox transaccional para publicar eventos                | Aceptado |
| [0015](ADR-0015-testing-strategy.md)     | Vitest + Playwright + Testcontainers                      | Aceptado |
| [0016](ADR-0016-motion-animation.md)     | Motion como librería de animación                         | Aceptado |
| [0017](ADR-0017-media-storage.md)        | Almacenamiento de medios compatible con S3 tras un puerto | Aceptado |
| [0018](ADR-0018-payments-port.md)        | `PaymentPort` con adaptador offline en Fase 1             | Aceptado |
| [0019](ADR-0019-versioning-releases.md)  | Changesets + Conventional Commits + trunk-based           | Aceptado |
| [0020](ADR-0020-deployment-strategy.md)  | Contenedores en PaaS gestionado, sin Kubernetes           | Aceptado |
