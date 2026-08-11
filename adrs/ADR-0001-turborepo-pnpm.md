# ADR-0001 — Turborepo + pnpm como monorepo

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001 |
| ------ | --------------------------------------------------------------------------- |

## Contexto

Cinco superficies (web, admin, api, workers, móvil) que comparten design system, contratos,
tipos de dominio y configuración. Con repositorios separados, cada cambio de contrato exige
publicar un paquete, esperar, actualizar y coordinar — inasumible con un equipo de tres.

## Decisión

Un monorepo con **pnpm workspaces** para las dependencias y **Turborepo** para orquestar
tareas y cachear.

## Alternativas descartadas

| Alternativa                         | Por qué se descarta                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Repositorios separados              | Coordinación constante; los contratos se desincronizan; onboarding lento                              |
| npm/yarn workspaces sin orquestador | Sin caché ni ejecución selectiva: CI lenta desde el primer mes                                        |
| Nx                                  | Más potente, pero su curva y su acoplamiento a generadores no se justifican con este tamaño de equipo |

## Consecuencias

**Positivas** — un cambio de contrato y sus consumidores en un solo PR · CI que ejecuta
sólo lo afectado · una versión de cada dependencia · onboarding con un clone.

**Negativas** — configuración inicial más compleja · la caché mal configurada puede mentir
(riesgo R-15) · el repositorio crece y `git clone` se vuelve más pesado con el tiempo.

**Neutras** — obliga a declarar `inputs` y `outputs` en cada tarea, lo que es buena
práctica de todas formas.

## Criterio de revisión

Si un equipo dedicado necesita cadencia de despliegue radicalmente distinta y demuestra que
el monorepo le frena, se extrae ese paquete a su propio repositorio.

## Enlaces

[RFC-0001](../rfcs/RFC-0001-platform-architecture.md) ·
[`docs/14-repo-structure.md`](../docs/14-repo-structure.md) · [ADR-0019](ADR-0019-versioning-releases.md)
