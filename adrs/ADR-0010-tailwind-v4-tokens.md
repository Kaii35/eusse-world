# ADR-0010 — TailwindCSS v4 con tokens CSS-first

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Design System · **RFC** RFC-0008 |
| ------ | --- |

## Contexto

Dos aplicaciones deben verse como el mismo producto, con modo oscuro nativo y sin que la
deriva visual empiece en el tercer sprint (riesgo R-10). Hace falta un sistema de estilos
que permita **verificar por máquina** que nadie escribe un color a mano.

## Decisión

**TailwindCSS v4** con tokens definidos en CSS mediante `@theme`, publicados desde
`@eusse/tokens`.

Tokens en tres capas: primitivos → semánticos → de componente.
Modo oscuro por **clase**, no por media query: el usuario elige.
**Valores arbitrarios prohibidos por lint**: `text-[#1a2b3c]` y `p-[13px]` rompen el build.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| CSS Modules | Sin sistema de restricciones: cada archivo puede inventar sus valores |
| styled-components / Emotion | Coste en runtime; mala interacción con Server Components |
| Panda CSS / vanilla-extract | Buenas opciones, ecosistema menor y menos integración con shadcn/ui |
| Tailwind v3 | v4 tiene configuración CSS-first, que hace los tokens más naturales y compartibles entre paquetes |
| Modo oscuro por media query | El usuario no puede elegir; en B2B se trabaja en entornos de iluminación muy distintos |

## Consecuencias

**Positivas** — cero CSS en runtime · tokens como variables CSS, consumibles por cualquier
paquete · el lint puede prohibir valores mágicos, que es lo que impide la deriva · cambiar
de marca es cambiar la capa 1 de tokens.

**Negativas** — el HTML acumula muchas clases (mitigado con CVA y componentes) · Tailwind v4
es reciente y su ecosistema aún madura (riesgo R-16) · la curva inicial para quien viene de
CSS tradicional.

**Neutras** — obliga a que todo valor visual exista como token, que es el objetivo.

## Criterio de revisión

Si Tailwind v4 presenta inestabilidad que bloquee el desarrollo más de dos sprints, se
evalúa volver a v3 (el cambio afecta a la configuración, no a los componentes).

## Enlaces

[RFC-0008](../rfcs/RFC-0008-design-system.md) ·
[`skills/design-system.md`](../skills/design-system.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md)
