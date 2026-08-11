# ADR-0012 — TanStack Query para estado de servidor, Zustand para estado de UI

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto + Frontend · **RFC** RFC-0001, RFC-0006 |
| ------ | ------------------------------------------------------------------------------------------------ |

## Contexto

La mayoría de los bugs de estado en frontend vienen de tener **el mismo dato en dos
sitios**: la respuesta de la API copiada a un store global, que después queda obsoleta.

En este proyecto el riesgo es mayor de lo normal: si el carrito o el precio quedan
desactualizados en el cliente, el usuario puede ver un importe que no es el que se le va a
cobrar (riesgo R-01).

## Decisión

Cada tipo de estado tiene **un solo dueño**:

| Tipo                         | Dueño               | Ejemplos                            |
| ---------------------------- | ------------------- | ----------------------------------- |
| Servidor (remoto, cacheable) | **TanStack Query**  | catálogo, carrito, órdenes, precios |
| URL (compartible, navegable) | **search params**   | filtros, búsqueda, página           |
| Cliente global (sólo UI)     | **Zustand**         | tema, drawer abierto, sidebar       |
| Formulario                   | **React Hook Form** | login, checkout, alta de producto   |
| Local                        | `useState`          | acordeón, hover                     |

**Regla prohibitiva:** copiar datos del servidor a Zustand está prohibido. Si vino de la
API, lo posee TanStack Query.

`staleTime` explícito por tipo de dato; el valor por defecto casi nunca es correcto.

## Alternativas descartadas

| Alternativa                      | Por qué se descarta                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Redux Toolkit para todo          | Maquinaria considerable; invita precisamente a copiar el estado del servidor al store                                   |
| Sólo Context                     | Sin caché, sin deduplicación, sin reintentos; re-renders masivos                                                        |
| Sólo Zustand                     | Habría que reimplementar caché, invalidación y reintentos                                                               |
| SWR                              | Muy válido, pero TanStack Query tiene mejores herramientas para mutaciones optimistas, que aquí son centrales (carrito) |
| Estado del carrito en el cliente | El precio se recalcularía en el navegador: riesgo R-01                                                                  |

## Consecuencias

**Positivas** — cada dato tiene un dueño evidente · caché, invalidación, reintentos y
deduplicación resueltos · mutaciones optimistas con reversión · estado de filtros
compartible por enlace.

**Negativas** — hay que conocer dos herramientas · `staleTime` mal elegido produce datos
obsoletos o exceso de peticiones · las claves de consulta deben gestionarse con disciplina
(centralizadas por recurso).

**Neutras** — obliga a decidir explícitamente la frescura de cada dato, que es correcto.

## Criterio de revisión

Si el estado de cliente crece hasta necesitar una máquina de estados formal (XState) en
algún flujo concreto, se adopta **para ese flujo**, no globalmente.

## Enlaces

[`skills/state-management.md`](../skills/state-management.md) ·
[RFC-0006](../rfcs/RFC-0006-cart-and-b2b-pricing.md)
