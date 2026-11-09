# Prototipos de diseño

Material de **referencia**, no código de producto. No se compila, no se lintea y no forma
parte de ningún paquete del monorepo.

Cuando un prototipo se implementa, se reescribe en su app con las reglas del repositorio
(i18n, tokens, Server Components, tipos estrictos). El prototipo se conserva para poder
comparar el resultado con el diseño de origen.

| Prototipo                                                       | Contenido                                                                        | Estado                                                                                                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`eusse-world-react/landing`](eusse-world-react/landing/)       | Landing: globo 3D, parallax, proceso con contenedor 3D, formulario de cotización | **Implementada** en [`apps/web/src/components/marketing/landing`](../../../apps/web/src/components/marketing/landing/) ([RFC-0009](../../../rfcs/RFC-0009-landing-and-brand.md)) |
| [`eusse-world-react/plataforma`](eusse-world-react/plataforma/) | Plataforma mayorista: catálogo, carrito por proveedor, panel de proveedor        | **Referencia.** Bloqueada hasta aprobar RFC-0005, RFC-0006 y RFC-0007                                                                                                            |

## Diferencias deliberadas entre el prototipo de landing y la implementación

| Prototipo                                   | Implementación                                         | Por qué                                        |
| ------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Estilos en línea con colores hexadecimales  | CSS Module con tokens `--landing-*` de `@eusse/tokens` | ADR-0010: los tokens son la única fuente       |
| Textos en el código                         | `messages/es.json` y `messages/en.json`                | i18n obligatorio                               |
| Dos `h1` animados                           | Un solo `h1`, sin animación                            | Es el LCP (RFC-0009 §4.3) y SEO exige uno      |
| Botón en `#5980a6` con texto claro (3.7:1)  | `--landing-cta` (4.6:1)                                | WCAG 2.2 AA, verificado en `contrast.spec.ts`  |
| Máscara de continentes desde unpkg (430 KB) | `public/landing/earth-water.png` (5 KB)                | Sin dependencia externa en tiempo de ejecución |
| Fuentes desde Google Fonts                  | `next/font` (servidas desde el propio dominio)         | Rendimiento y privacidad                       |
| `@ts-nocheck` en `fx.ts` y `globe.ts`       | `motion.ts` y `globe.ts` con tipos estrictos           | Prohibido en el repositorio                    |

## Rediseño posterior (2026-11-08, a petición de negocio)

El prototipo se percibía "con demasiado zoom" y poco práctico. Se rediseñó con escala de
producto B2B de logística:

| Prototipo                                              | Rediseño                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Títulos de 56–156 px en mayúsculas condensadas         | Títulos de 36–60 px en minúscula normal; contenedor de 1200 px            |
| Globo a 118 vw detrás del texto, con parallax          | Hero en dos columnas; globo contenido con tarjeta de centros de operación |
| Marquesina de servicios                                | Franja de cuatro ventajas                                                 |
| Manifiesto de 80 px que se ilumina al hacer scroll     | Sección "Quiénes somos" en dos columnas                                   |
| Proceso de 340 vh con contenedor 3D (secuestra scroll) | Cuatro pasos estáticos en línea de tiempo                                 |
| Marcas de agua gigantes y cruces de plano técnico      | Eliminadas                                                                |
| Sin selector de idioma ni menú móvil                   | Selector ES/EN en la cabecera y menú móvil, ambos `<details>` (sin JS ok) |

## Componentes de referencia integrados

| Origen                                              | Implementación                                                                                      | Adaptaciones                                                                                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web/prompts/shirts.md` (product-rail-gallery) | `apps/web/src/components/marketing/landing/rail` (sección Personal Shopper)                         | CSS Module con tokens, textos por next-intl, sin fotos de terceros (ilustraciones SVG), sin precios en las etiquetas, teclado en cada prenda, carga diferida |
| Componente `cobe-globe` (pegado en el chat)         | `routeGlobe.ts` en el planificador ([ADR-0022](../../../adrs/ADR-0022-cobe-route-planner-globe.md)) | Sin React, colores de marca, carga diferida, diagrama SVG de respaldo                                                                                        |
