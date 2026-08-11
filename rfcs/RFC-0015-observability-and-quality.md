# RFC-0015 — Observabilidad, testing y calidad

| Campo             | Valor                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| **Estado**        | Aprobado · **Autor** Arquitecto + DevOps + Testing · **Creado** 2026-08-06 |
| **Revisores**     | QA · Seguridad · Performance · Product Owner                               |
| **ADR generados** | ADR-0015, ADR-0019, ADR-0020                                               |
| **Bloque**        | A (A4, A14, A15) · Sprint 0                                                |

---

## 1. Problema

La calidad no se consigue con buenas intenciones. Sin puertas automáticas, la primera vez
que haya presión de fechas se saltarán los tests, la accesibilidad y el rendimiento — y
después ya no se recuperan.

Y sin observabilidad, cuando algo falle en producción nadie podrá responder "¿qué está
pasando?" sin desplegar código nuevo.

## 2. Objetivos y no-objetivos

**Objetivos:** puertas de calidad automáticas que bloquean el merge · estrategia de tests
por nivel · presupuestos de rendimiento en CI · trazabilidad de punta a punta · SLO con
presupuesto de error · runbooks probados.

**No-objetivos:** cobertura del 100% · APM propietario · pruebas de caos en Fase 1 ·
métricas de negocio avanzadas (F2).

## 3. Alternativas consideradas

**Puertas de calidad**

| Alternativa                           | Descarte                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| A. Revisión humana como único control | No escala; depende del día que tenga el revisor                                   |
| B. Puertas como aviso, no bloqueantes | Se ignoran a la segunda semana                                                    |
| **C. Puertas bloqueantes en CI**      | **Elegida.** Es la única forma de que la calidad sobreviva a la presión de fechas |

**Tests de integración**

| Alternativa                                         | Descarte                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| A. Mock de Prisma                                   | No detecta índices ausentes, restricciones violadas ni problemas de transacción |
| **B. Testcontainers con PostgreSQL y Redis reales** | **Elegida.** Más lento, infinitamente más útil                                  |

## 4. Diseño

### 4.1 Puertas de calidad (todas bloquean el merge)

| Puerta                              | Herramienta                                       |
| ----------------------------------- | ------------------------------------------------- |
| Formato                             | Prettier `--check`                                |
| Lint (0 errores, 0 warnings)        | ESLint                                            |
| **Fronteras de arquitectura**       | `eslint-plugin-boundaries` + `dependency-cruiser` |
| Tipos                               | `tsc --noEmit` en todo el workspace               |
| Tests unitarios e integración       | Vitest                                            |
| Cobertura mínima                    | Vitest coverage                                   |
| Build                               | `turbo build`                                     |
| E2E críticos                        | Playwright                                        |
| Accesibilidad                       | axe-core (violaciones críticas y serias)          |
| Presupuesto de bundle               | `size-limit`                                      |
| Core Web Vitals                     | Lighthouse CI                                     |
| Vulnerabilidades                    | `pnpm audit` + Dependabot                         |
| Secretos                            | gitleaks                                          |
| Formato de commit                   | commitlint                                        |
| **Sin literales de i18n**           | ESLint                                            |
| **Sin valores mágicos de Tailwind** | ESLint                                            |

CI ejecuta sólo lo afectado usando el grafo de Turborepo. Objetivo: PR típico < 10 min.

### 4.2 Estrategia de tests

| Nivel       | Herramienta              | Qué prueba                                     | Umbral                      |
| ----------- | ------------------------ | ---------------------------------------------- | --------------------------- |
| Unitario    | Vitest                   | Invariantes de dominio, cálculos, transiciones | **≥ 90% en `domain/`**      |
| Integración | Vitest + Testcontainers  | Casos de uso con PostgreSQL y Redis reales     | **≥ 80% en `application/`** |
| Contrato    | Vitest                   | Zod ⟷ handler ⟷ SDK                            | Todo endpoint               |
| Componente  | Vitest + Testing Library | Comportamiento accesible                       | Criterio                    |
| E2E         | Playwright               | 7 recorridos críticos                          | Todos verdes                |
| Visual      | Playwright snapshots     | Regresión del design system                    | Sin diffs no aprobados      |

Los siete recorridos críticos están en [`skills/testing.md`](../skills/testing.md).

### 4.3 Presupuestos de rendimiento

En [`docs/04-standards.md`](../docs/04-standards.md) §6, activos en CI. Superarlos rompe el
build. Se suben **por RFC con motivo**, nunca por conveniencia.

### 4.4 Observabilidad

**Logs** JSON estructurados con `correlationId`, sin datos personales.
**Trazas** OpenTelemetry: un span por caso de uso, por consulta y por llamada externa.
**Métricas** RED por endpoint y por handler de cola, más profundidad y antigüedad de colas
y latencia del outbox.
**Errores** agrupados por código de dominio, no por stack trace.

### 4.5 SLO y presupuesto de error

```
Disponibilidad     99.5% mensual  → 3 h 39 min de presupuesto
p95 lectura        < 200 ms
p95 escritura      < 500 ms
Tasa de error      < 0.5%
```

**Si el presupuesto se agota, el sprint siguiente prioriza fiabilidad.** Automático, sin
discusión — es el mecanismo que impide que la fiabilidad pierda siempre contra las
funcionalidades.

### 4.6 Alertas

Por **síntoma**, no por causa. Cada alerta con dueño, umbral justificado y runbook
enlazado. Sin alertas ruidosas: una alerta que se ignora invalida todas las demás.

### 4.7 Gestión de deuda técnica

Toda deuda aceptada conscientemente se registra en `docs/tech-debt.md` con qué, por qué,
coste de arreglarla, coste de no arreglarla y **fecha límite**.
Deuda sin fecha límite no se acepta. `TODO` sin issue es un error de lint.
**20% de capacidad de cada sprint reservado a deuda**, innegociable.

### 4.8 Releases

Trunk-based con feature flags · Changesets para versionar paquetes · Conventional Commits ·
migraciones antes que el código · reversión en < 5 min, probada.

## 5. Impacto

Afecta al flujo de trabajo de todos los agentes desde el primer commit. Añade tiempo a cada
PR y lo devuelve multiplicado a partir del tercer mes.

## 6. Riesgos

| Riesgo                                      | Prob. | Impacto | Mitigación                                                                     |
| ------------------------------------------- | ----- | ------- | ------------------------------------------------------------------------------ |
| CI lenta que se ignora                      | Media | Alto    | Caché remota + ejecución de sólo lo afectado + objetivo de 10 min              |
| Tests inestables que erosionan la confianza | Alta  | Alto    | Regla: se arregla o se borra; verificación de 20 ejecuciones consecutivas      |
| Cobertura como objetivo en sí mismo         | Media | Medio   | Umbral sólo en dominio y aplicación; el resto es criterio                      |
| Puertas desactivadas bajo presión           | Media | Crítico | Desactivar una puerta requiere ADR; no es una decisión individual              |
| Alertas ruidosas                            | Alta  | Medio   | Revisión mensual: toda alerta que no llevó a una acción se ajusta o se elimina |

## 7. Criterios de aceptación

```gherkin
Escenario: Las puertas bloquean de verdad
  Dado un PR con una violación de frontera de arquitectura
  Cuando se ejecuta CI
  Entonces el merge queda bloqueado

Escenario: Cobertura de dominio
  Dado un módulo con cobertura de dominio del 85%
  Cuando se ejecuta CI
  Entonces falla indicando que el mínimo es 90%

Escenario: Presupuesto de rendimiento
  Dado un cambio que sube el JS inicial de la landing a 135 KB
  Cuando se ejecuta CI
  Entonces falla indicando el presupuesto de 120 KB

Escenario: Trazabilidad de punta a punta
  Dada una petición que crea una orden y dispara una notificación
  Cuando se consulta por su correlationId
  Entonces aparecen los spans de web, api, outbox y worker

Escenario: Suite estable
  Cuando se ejecuta la suite 20 veces seguidas
  Entonces no hay ningún fallo espurio
```

## 8. Plan de implementación

A4 (CI), A14 (`@eusse/testing`), A15 (Playwright) del Bloque A. Observabilidad desde A5.
**Ninguna puerta se añade "más adelante": todas están activas antes del Bloque B.**

## 9. Preparación para fases futuras

**Hueco:** OpenTelemetry es estándar → cambiar de backend de observabilidad es
configuración · las métricas RED por módulo permiten decidir con datos cuándo extraer un
servicio.
**No se construye:** APM propietario, pruebas de caos, métricas de negocio avanzadas.

## 10. Preguntas abiertas

Ninguna bloqueante.

## 11. Enlaces

[`docs/04-standards.md`](../docs/04-standards.md) · [`skills/testing.md`](../skills/testing.md) ·
[`skills/observability.md`](../skills/observability.md) · [`skills/devops.md`](../skills/devops.md)
