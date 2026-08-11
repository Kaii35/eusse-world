# ADR-0005 — NestJS como framework de backend

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001 |
| ------ | --------------------------------------------------------------------------- |

## Contexto

Necesitamos un backend con estructura modular impuesta, inyección de dependencias (esencial
para la arquitectura hexagonal), y que el mismo código sirva para la API HTTP y para los
workers de cola.

Alternativa tentadora: poner todo en Route Handlers de Next. Se descarta porque la app
móvil de Fase 4 dejaría el backend inservible y habría que reescribirlo.

## Decisión

**NestJS** para `apps/api` y `apps/workers`, con arquitectura hexagonal dentro de cada
módulo (`domain` / `application` / `infrastructure` / `interface`).

Regla no negociable: **`domain/` no importa NestJS.** El framework vive en las capas
externas; el dominio es TypeScript puro.

## Alternativas descartadas

| Alternativa              | Por qué se descarta                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Route Handlers de Next   | La lógica de negocio queda atada al framework de UI; la app móvil obligaría a reescribir                       |
| Express o Fastify a pelo | Habría que construir DI, módulos y validación: reinventar NestJS peor                                          |
| Hono                     | Excelente y ligero, pero sin DI ni estructura modular; el equipo tendría que imponer ambas a mano              |
| Go o Java                | El equipo es de TypeScript; compartir tipos y contratos con el frontend es una ventaja que no se quiere perder |

## Consecuencias

**Positivas** — estructura modular impuesta por el framework · DI que hace natural el
patrón de puertos y adaptadores · el mismo código sirve para HTTP y para colas · guards,
interceptores y filtros resuelven autorización, trazabilidad y errores de forma transversal.

**Negativas** — más ceremonia que Express en casos triviales · uso intensivo de decoradores
(magia implícita) · el equipo debe entender la DI para no acoplar el dominio.

**Neutras** — la ceremonia se mitiga con generadores y con la excepción explícita para CRUD
sin invariantes.

## Criterio de revisión

Si el rendimiento del framework se convierte en cuello de botella medido (improbable: el
cuello de botella siempre será la base de datos), o si el equipo cambia de lenguaje.

## Enlaces

[RFC-0001](../rfcs/RFC-0001-platform-architecture.md) ·
[`skills/backend-nestjs.md`](../skills/backend-nestjs.md) · [ADR-0002](ADR-0002-modular-monolith.md)
