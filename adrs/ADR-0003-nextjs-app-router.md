# ADR-0003 — Next.js App Router con React Server Components

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001 |
| ------ | --- |

## Contexto

La landing y el catálogo necesitan SEO y LCP < 2.5 s. El portal y el admin necesitan datos
privados nunca cacheados. Y la ficha de producto necesita ser **estática e indexable** pero
mostrar un **precio por cuenta** — dos requisitos que a primera vista se contradicen.

## Decisión

Next.js con **App Router** y Server Components por defecto. `"use client"` sólo donde haya
estado, efectos o eventos del navegador, y lo más abajo posible en el árbol.

Estrategia de renderizado declarada por ruta en
[`docs/01-architecture.md`](../docs/01-architecture.md) §4.5.

**La ficha de producto se cachea sin precio; el precio se pide autenticado desde el
cliente.** Eso resuelve la contradicción de arriba.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| Pages Router | En mantenimiento; sin RSC; peor granularidad de caché |
| SPA con Vite | Sin SEO en la landing y el catálogo, que es donde el SEO importa |
| Astro para marketing + SPA para la app | Dos stacks, dos design systems, dos onboardings |
| Remix / React Router | Buen framework, pero ecosistema menor y sin RSC maduro |

## Consecuencias

**Positivas** — menos JavaScript en el cliente · datos obtenidos donde se usan · caché
granular con `revalidateTag` · SEO y velocidad sin renunciar a precios por cuenta.

**Negativas** — modelo mental nuevo; el error más común del equipo será poner
`"use client"` demasiado arriba · el ecosistema de React 19 aún madura (riesgo R-16) ·
depurar la frontera servidor/cliente es menos evidente.

**Neutras** — obliga a pensar dónde vive cada dato, lo cual es correcto de todas formas.

## Criterio de revisión

Si los presupuestos de rendimiento no se alcanzan por limitaciones del framework, o si
React 19 con Next presenta inestabilidad que bloquee el desarrollo más de dos sprints.

## Enlaces

[RFC-0001](../rfcs/RFC-0001-platform-architecture.md) · [RFC-0006](../rfcs/RFC-0006-cart-and-b2b-pricing.md) ·
[`skills/frontend-nextjs.md`](../skills/frontend-nextjs.md)
