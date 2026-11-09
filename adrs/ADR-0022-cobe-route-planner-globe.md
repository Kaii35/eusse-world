# ADR-0022 — cobe para el globo del planificador de rutas

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| **Estado**     | Propuesto — pendiente de revisión humana |
| **Fecha**      | 2026-11-08                               |
| **Decisor**    | Arquitecto + Performance                 |
| **RFC origen** | RFC-0009                                 |

## Contexto

Negocio pidió un globo interactivo (arrastrable, con marcadores y arcos etiquetados) en la
sección "Planifique su ruta", a partir de un componente de referencia basado en
[`cobe`](https://github.com/shuding/cobe). La landing ya usa three.js para el globo del hero
([ADR-0021](ADR-0021-threejs-landing-globe.md)), y su presupuesto es JS inicial < 120 KB.

## Decisión

Usamos **cobe 2.x** sólo para el globo del planificador:

- Se importa con `import()` dinámico cuando el planificador entra en pantalla: **no entra
  en el JS inicial**.
- Se integra sin componente React (`routeGlobe.ts`), igual que el resto del planificador:
  el estado de la ruta ya vive en `planner.ts`.
- Contexto WebGL con `failIfMajorPerformanceCaveat`: sin GPU no se crea y queda el
  diagrama SVG del servidor como respaldo.
- Las etiquetas usan CSS Anchor Positioning (las variables `--cobe-*` que expone cobe) y
  sólo se muestran donde el navegador lo soporta (`@supports`).

## Alternativas descartadas

| Alternativa                         | Por qué se descarta                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Reutilizar el globo three.js        | Habría que construir arrastre con inercia y arcos dinámicos: ~150 KB para lo mismo   |
| Copiar el componente React tal cual | Colores literales, `@ts-expect-error`, carga inmediata de cobe y un estado duplicado |
| Mantener sólo el diagrama SVG       | Es lo que había; negocio pidió explícitamente el globo interactivo                   |

## Consecuencias

**Positivas** — globo interactivo con ~6 KB comprimidos, cargados sólo si se ve la sección
· el diagrama SVG sigue sirviendo sin JS, sin WebGL y en las pruebas.

**Negativas** — dos librerías de render 3D en la misma página (three.js y cobe) ·
cobe no lee variables CSS: sus colores se duplican en `routeGlobe.ts` como fracciones RGB
de los primitivos de marca · las etiquetas dependen de una API CSS reciente.

**Neutras** — no afecta a `apps/admin` ni a paquetes compartidos.

## Criterio de revisión

Si el globo del hero se reescribe, se evalúa unificar ambos en cobe (eliminar three.js).
Si el JS diferido de la landing supera 200 KB, se elimina uno de los dos globos.

## Enlaces

[RFC-0009](../rfcs/RFC-0009-landing-and-brand.md) · [ADR-0021](ADR-0021-threejs-landing-globe.md)
