# ADR-0015 — Vitest + Playwright + Testcontainers

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Testing + Arquitecto · **RFC** RFC-0015 |
| ------ | ------------------------------------------------------------------------------------- |

## Contexto

La suite de tests tiene que ser algo en lo que el equipo confíe. Si es lenta, se salta; si
es inestable, se ignora; si mockea demasiado, no detecta nada.

Riesgo específico de este proyecto: mockear Prisma en los tests de integración haría que
**no se detectara** un índice ausente, una restricción violada ni un problema de
transacción — precisamente los bugs que más duelen en producción.

## Decisión

| Nivel                      | Herramienta                                                   |
| -------------------------- | ------------------------------------------------------------- |
| Unitario (dominio)         | **Vitest**                                                    |
| Integración (casos de uso) | **Vitest + Testcontainers** con PostgreSQL y Redis **reales** |
| Contrato                   | **Vitest** contra los esquemas de `@eusse/contracts`          |
| Componente                 | **Vitest + Testing Library**, consultando por rol accesible   |
| E2E                        | **Playwright** con axe integrado                              |
| Visual                     | **Playwright snapshots** en ambos temas                       |

Umbrales: **≥ 90% en `domain/`**, **≥ 80% en `application/`**. El resto no tiene umbral:
tiene criterio.

**Regla:** un test inestable se arregla o se borra. Nunca se marca `skip` y se olvida.

## Alternativas descartadas

| Alternativa                          | Por qué se descarta                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Jest                                 | Más lento; peor soporte de ESM y TypeScript nativo; Vitest comparte configuración con Vite |
| Cypress                              | Playwright cubre más navegadores, es más rápido y su modelo de espera es más robusto       |
| Mock de Prisma en integración        | No detecta índices, restricciones ni transacciones: los bugs más caros pasarían            |
| Base de datos compartida entre tests | Contaminación cruzada; imposible paralelizar                                               |
| Objetivo de 100% de cobertura        | Produce tests de getters y setters que no detectan nada                                    |

## Consecuencias

**Positivas** — los tests de integración detectan problemas reales de base de datos ·
consultar por rol accesible verifica accesibilidad de paso · Vitest comparte configuración
con el resto del stack · Playwright cubre la matriz de navegadores.

**Negativas** — Testcontainers exige Docker en local y en CI · los tests de integración son
más lentos que con mocks (presupuesto: unitarios < 60 s, E2E < 10 min) · mantener los
snapshots visuales tiene coste continuo.

**Neutras** — obliga a que cada test cree sus propios datos con fábricas, que es lo correcto.

## Criterio de revisión

Si el tiempo de la suite supera el presupuesto de forma sostenida, se paraleliza y se revisa
qué E2E aportan valor real — pero **no se sustituyen los tests de integración por mocks**.

## Enlaces

[RFC-0015](../rfcs/RFC-0015-observability-and-quality.md) · [`skills/testing.md`](../skills/testing.md) ·
[`docs/04-standards.md`](../docs/04-standards.md) §5
