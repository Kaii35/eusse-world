# ADR-0016 — Motion como librería de animación

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Design System + UI · **RFC** RFC-0008, RFC-0009 |
| ------ | --------------------------------------------------------------------------------------------- |

## Contexto

La landing necesita movimiento de calidad (revelado al scroll, microinteracciones,
transiciones) al nivel de las referencias del proyecto. Al mismo tiempo, el presupuesto de
la landing es el más estricto: **LCP < 2.0 s y JS inicial < 120 KB**.

Tensión real: la librería de animación no puede comerse el presupuesto de la página que
tiene que animar.

## Decisión

**Motion** (antes Framer Motion) como librería única de animación.

Reglas de uso:

- Sólo se animan `transform` y `opacity`.
- `prefers-reduced-motion` se respeta **siempre**.
- Revelado al scroll con `once: true`.
- **El contenido crítico (LCP) nunca depende de una animación.**
- Motion se carga **dinámicamente** en secciones por debajo del pliegue.
- **Sin animaciones de entrada en `apps/admin`**: sólo feedback de interacción.

## Alternativas descartadas

| Alternativa                             | Por qué se descarta                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Sólo transiciones y `@keyframes` de CSS | Suficiente para microinteracciones, insuficiente para orquestación, gestos y transiciones de layout         |
| GSAP                                    | Muy potente, pero licencia comercial en algunos usos y API imperativa que encaja peor con React             |
| React Spring                            | Buena alternativa; Motion tiene mejor integración con React 19, mejor API declarativa y mejor documentación |
| Web Animations API a pelo               | Habría que construir la capa declarativa: reinventar Motion peor                                            |
| Sin librería                            | El nivel de ejecución que pide RFC-0009 no se alcanza sólo con CSS                                          |

## Consecuencias

**Positivas** — API declarativa que encaja con React · `useReducedMotion` incorporado ·
gestos y transiciones de layout resueltos · `whileInView` para el revelado al scroll sin
observadores manuales.

**Negativas** — **peso en el bundle**: es el principal argumento en contra (riesgo R-11).
Mitigado con carga dinámica y con `size-limit` bloqueante · fácil de abusar: hay que
resistir la tentación de animarlo todo · animaciones mal hechas penalizan el LCP.

**Neutras** — obliga a decidir explícitamente qué anima y por qué, que es la disciplina que
falta en la mayoría de las landings.

## Criterio de revisión

Si el presupuesto de la landing no se alcanza con Motion incluso cargado dinámicamente, se
sustituye por CSS puro en las secciones críticas y se reserva Motion para las interiores.

## Enlaces

[RFC-0009](../rfcs/RFC-0009-landing-and-brand.md) ·
[`skills/motion-animation.md`](../skills/motion-animation.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) §4
