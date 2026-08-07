# GitHub Actions

> **Especificados en Fase 0, implementados en el Sprint 0** (paso A4). Esta fase no produce
> código ni configuración ejecutable.

## Workflows previstos

### `ci.yml` — en cada PR y push a `main`

```
install (pnpm --frozen-lockfile, con caché)
  └─ turbo lint typecheck test build --filter=...[origin/main]
```

Puertas **bloqueantes** (ver [`docs/04-standards.md`](../../docs/04-standards.md) §5):

| Puerta | Herramienta |
| ------ | ----------- |
| Formato | Prettier `--check` |
| Lint (0 errores, 0 warnings) | ESLint |
| **Fronteras de arquitectura** | `eslint-plugin-boundaries` + `dependency-cruiser` |
| Tipos | `tsc --noEmit` |
| Tests unitarios e integración | Vitest + Testcontainers |
| Cobertura | dominio ≥ 90%, aplicación ≥ 80% |
| Build | `turbo build` |
| Bundle | `size-limit` |
| Secretos | gitleaks |
| Formato de commit | commitlint |
| Paridad de i18n | `pnpm check:i18n` |
| Enlaces de documentación | `pnpm check:docs` |
| Migraciones seguras | `pnpm check:migration` |
| `.claude/` sincronizado | `pnpm sync:claude --check` |

**Objetivo: PR típico en menos de 10 minutos.** Con caché remota de Turborepo y ejecución
selectiva por el grafo de dependencias.

### `e2e.yml` — en PR y antes de desplegar

Playwright sobre el entorno de preview. Los **siete recorridos críticos**
([`skills/testing.md`](../../skills/testing.md)) son puerta de despliegue. axe integrado.

### `lighthouse.yml` — en PR que toca `apps/web`

Lighthouse CI sobre landing, categoría y ficha de producto. Presupuestos de
[`docs/04-standards.md`](../../docs/04-standards.md) §6. Superarlos rompe el build.

### `deploy.yml` — en push a `main`

```
1. Migración de base de datos (expand)   ← SIEMPRE antes que el código
2. Despliegue de api y workers
3. Despliegue de web y admin
4. Humo de recorridos críticos
5. Reversión automática si el humo falla
```

### `security.yml` — semanal y en cada PR

`pnpm audit` · CodeQL · Dependabot. Severidad alta o crítica bloquea.

## Reglas

- **`--frozen-lockfile` siempre.**
- Los secretos van en GitHub Secrets, nunca en el workflow.
- Un workflow que falla de forma intermitente se arregla o se quita: no se reintenta a
  ciegas.
- Desactivar una puerta requiere **ADR**. No es una decisión individual.
