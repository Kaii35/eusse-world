# ADR-0011 — Radix + shadcn/ui copiado a `packages/ui`

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Design System · **RFC** RFC-0008 |
| ------ | ------------------------------------------------------------------------------ |

## Contexto

Hay que construir componentes interactivos accesibles: diálogos, menús, selects,
tooltips, tabs. Implementar bien el teclado, el foco y ARIA de cada uno lleva meses y es
donde más bugs de accesibilidad aparecen.

Al mismo tiempo, el control estético debe ser total: la landing tiene que verse a un nivel
alto, y una librería con estética propia se convierte en una pelea constante.

## Decisión

**Radix UI** como base de comportamiento (sin estilos) y **shadcn/ui** como punto de partida
de los estilos, **copiado a `packages/ui`** y mantenido como código propio.

`@eusse/ui` **no importa dominio, SDK ni contratos**. Un botón no sabe qué es una orden.

## Alternativas descartadas

| Alternativa                    | Por qué se descarta                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| MUI / Ant Design / Chakra      | Estética propia difícil de doblegar; bundle grande; se acaba luchando contra la librería  |
| Headless UI                    | Menos primitivos que Radix; menor cobertura de patrones                                   |
| Todo a medida desde cero       | Meses reimplementando accesibilidad ya resuelta, con peor resultado                       |
| shadcn/ui como dependencia npm | No es su modelo: está pensado para copiarse; además perderíamos control sobre los cambios |

## Consecuencias

**Positivas** — accesibilidad de teclado, foco y ARIA resuelta por gente especializada ·
control total del estilo · sin depender de las versiones de un tercero para cambiar un
detalle · Radix es headless y tree-shakeable.

**Negativas** — el código copiado es **nuestro**: las mejoras de shadcn/ui aguas arriba no
llegan solas, hay que traerlas a mano si interesan · varios paquetes de Radix suman al
bundle (mitigado con imports granulares y `size-limit`) · mantener los componentes es
trabajo continuo del agente Design System.

**Neutras** — obliga a tener un dueño claro del design system, que hace falta igualmente.

## Criterio de revisión

Si Radix deja de mantenerse o si aparece una alternativa headless con mejor cobertura y
migración razonable.

## Enlaces

[RFC-0008](../rfcs/RFC-0008-design-system.md) ·
[`skills/design-system.md`](../skills/design-system.md) ·
[`skills/accessibility.md`](../skills/accessibility.md)
