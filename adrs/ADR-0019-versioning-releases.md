# ADR-0019 — Changesets + Conventional Commits + trunk-based

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** DevOps + Arquitecto · **RFC** RFC-0015 |
| ------ | ------------------------------------------------------------------------------------ |

## Contexto

Catorce paquetes internos consumidos por cuatro aplicaciones. Un cambio rompedor en
`@eusse/ui` o `@eusse/contracts` afecta a varios consumidores. Hace falta que ese impacto
sea **explícito** y que el historial de `main` sea legible.

Además, con un equipo pequeño, las ramas de larga vida producen conflictos de fusión que
consumen más tiempo que el propio desarrollo.

## Decisión

- **Trunk-based**: `main` siempre desplegable, sin ramas `develop` ni `release`. Lo
  incompleto se mergea **detrás de un feature flag apagado**.
- **Conventional Commits**, validado por commitlint.
- **Changesets** para versionar paquetes: quien introduce un cambio publicable declara su
  impacto (`patch`/`minor`/`major`) y sus notas de migración.
- **Squash merge**: el historial de `main` es una historia legible de funcionalidades.
- PR ≤ ~400 líneas de diff productivo.

## Alternativas descartadas

| Alternativa                         | Por qué se descarta                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Git Flow                            | Ramas de larga vida, conflictos constantes, integración tardía; pensado para releases empaquetadas que aquí no existen |
| Versionado fijo de todo el monorepo | Un cambio en `@eusse/utils` subiría la versión de todo                                                                 |
| semantic-release                    | Deriva la versión del mensaje de commit; con paquetes interdependientes, Changesets es más explícito y controlable     |
| Sin versionado interno              | Imposible comunicar cambios rompedores a los consumidores                                                              |
| Merge commits                       | Historial ruidoso con los commits de trabajo en curso                                                                  |

## Consecuencias

**Positivas** — integración continua real, sin conflictos acumulados · el impacto de cada
cambio es explícito · notas de versión generadas automáticamente · el historial de `main`
se puede leer.

**Negativas** — los feature flags son código adicional que hay que **retirar** cuando la
funcionalidad se estabiliza (si no, se acumulan) · Changesets exige que la gente recuerde
crear el changeset (mitigado con verificación en CI) · el squash pierde el detalle de los
commits intermedios.

**Neutras** — obliga a PRs pequeños, que es lo que hace posible una revisión real.

## Criterio de revisión

Si el número de feature flags activos supera unos 15, se revisa el proceso de retirada, no
la estrategia de ramas.

## Enlaces

[RFC-0015](../rfcs/RFC-0015-observability-and-quality.md) · [`skills/devops.md`](../skills/devops.md) ·
[`docs/03-conventions.md`](../docs/03-conventions.md) §6
