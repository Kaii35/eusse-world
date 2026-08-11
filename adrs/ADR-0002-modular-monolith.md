# ADR-0002 — Monolito modular sobre microservicios

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001 |
| ------ | --------------------------------------------------------------------------- |

## Contexto

Equipo de tres personas. Dominio B2B todavía en descubrimiento: no sabemos con certeza
dónde están las fronteras reales entre Pricing, Catalog y Cart hasta haber operado unos
meses. Volumen esperado del año 1: ~120 peticiones/s en pico.

## Decisión

Un solo despliegue de API con **módulos aislados por contrato**, no por red:

- Cada módulo expone únicamente su carpeta `public/`; el resto es privado.
- Cada módulo tiene su propio esquema de PostgreSQL, sin claves foráneas cruzadas.
- La comunicación por defecto es por eventos; las llamadas síncronas están declaradas en
  una matriz explícita.
- Las fronteras se **verifican en CI**, no por convención.

## Alternativas descartadas

| Alternativa                   | Por qué se descarta                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microservicios desde el día 1 | Coste operativo multiplicado sin equipo que lo opere; congela fronteras que aún no conocemos; transacciones distribuidas donde hoy basta una transacción local |
| Monolito sin modularizar      | Rápido tres meses, imposible a partir del sexto; extraer nada sería viable                                                                                     |
| Serverless por función        | Arranques en frío, gestión de conexiones a base de datos, y el dominio queda troceado por infraestructura                                                      |

## Consecuencias

**Positivas** — una transacción local donde un microservicio necesitaría una saga · un
despliegue, un log, una traza · refactorizar fronteras sigue siendo barato · **extraer un
módulo a servicio es un cambio de transporte, no un rediseño**.

**Negativas** — un fallo grave puede afectar a todo · no se puede escalar un módulo por
separado · **exige disciplina permanente**: sin las verificaciones de CI, degenera en un
monolito (riesgo R-05).

**Neutras** — más ceremonia que un CRUD directo; mitigado con la excepción explícita para
CRUD sin invariantes y con generadores.

## Criterio de revisión

Se extrae un módulo a servicio cuando **se cumplan las tres**: perfil de carga
radicalmente distinto demostrado con métricas · necesidad real de despliegue independiente ·
un equipo dedicado que lo posea. No antes.

## Enlaces

[RFC-0001](../rfcs/RFC-0001-platform-architecture.md) ·
[`docs/07-module-dependencies.md`](../docs/07-module-dependencies.md) ·
[`docs/09-scalability.md`](../docs/09-scalability.md) §2
