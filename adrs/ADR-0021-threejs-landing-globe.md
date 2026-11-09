# ADR-0021 — three.js para el globo 3D de la landing, cargado de forma diferida

| Campo          | Valor                                    |
| -------------- | ---------------------------------------- |
| **Estado**     | Propuesto — pendiente de revisión humana |
| **Fecha**      | 2026-11-08                               |
| **Decisor**    | Arquitecto + Performance                 |
| **RFC origen** | RFC-0009                                 |

## Contexto

El diseño de la landing entregado por negocio
([`docs/design/prototypes/eusse-world-react/landing`](../docs/design/prototypes/eusse-world-react/landing/))
tiene como pieza central del hero un globo 3D con las rutas entre Colombia, Costa Rica,
Nicaragua y Estados Unidos. Es la imagen de marca: dice "logística internacional" antes de
leer una palabra.

Restricción: la landing tiene el presupuesto más estricto del proyecto — **JS inicial
< 120 KB y LCP < 2.0 s** (RFC-0009 §5). Un renderizador 3D pesa más que todo ese
presupuesto junto.

## Decisión

Usamos **three.js** (`three` y `@types/three`) **sólo** en `apps/web`, para el globo del
hero, con estas reglas:

- Se importa con `import()` dinámico desde el script de movimiento, después de hidratar.
  **Nunca entra en el JS inicial.** Medido: 112 KB de JS inicial con el globo activo.
- El globo es decorativo (`aria-hidden`). El `h1` y los CTA no dependen de él: si no hay
  WebGL o falla la carga, el hero se ve completo sin globo.
- Se pausa cuando sale de pantalla. Con `prefers-reduced-motion` se pinta una imagen fija.
- La máscara de continentes se sirve desde `public/` (5 KB), no desde un CDN.

## Alternativas descartadas

| Alternativa                       | Por qué se descarta                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| Imagen o vídeo estático del globo | Pierde la interacción con el puntero y el scroll, que es lo que el diseño pide; un vídeo pesa más |
| `three-globe` / `react-globe.gl`  | Envuelven three.js y añaden peso y API propia para algo que son ~200 líneas                       |
| `@react-three/fiber`              | Reconciliador React sobre three.js: más peso y otra capa para una escena sin estado de React      |
| Canvas 2D a mano                  | Rotación 3D, profundidad y halo atmosférico en 2D serían reinventar un motor 3D peor              |
| SVG animado                       | Miles de puntos de continente en el DOM: coste de render y de memoria mayor que WebGL             |

## Consecuencias

**Positivas**

- El hero alcanza el nivel de ejecución del diseño sin tocar el JS inicial.
- three.js es estable, sin dependencias y con tipos oficiales mantenidos.

**Negativas**

- ~150 KB comprimidos adicionales que se descargan **después** de la carga: coste en datos
  móviles para quien llega a la landing.
- Una segunda forma de animar además de CSS y Motion (ADR-0016), acotada a un archivo.
- Los colores de la escena WebGL no pueden leer variables CSS: se duplican en
  `globe.ts` como hexadecimales de los primitivos `--eusse-steel-*`, con comentario.

**Neutras**

- No afecta a `apps/admin` ni a ningún paquete compartido.

## Criterio de revisión

- Si el JS inicial de la landing supera 120 KB por culpa del globo, o el INP en móvil
  supera 200 ms con el globo activo, se sustituye por una imagen estática en móvil.
- Si aparece una segunda escena 3D en el producto, se reevalúa `@react-three/fiber`.

## Enlaces

[RFC-0009](../rfcs/RFC-0009-landing-and-brand.md) · [ADR-0016](ADR-0016-motion-animation.md) ·
[`docs/design/prototypes/README.md`](../docs/design/prototypes/README.md)
