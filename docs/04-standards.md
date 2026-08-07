# 04 — Estándares de desarrollo

**Dueño:** Arquitecto + QA · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Mientras [03-conventions.md](03-conventions.md) dice *cómo se escribe*, este documento
dice *qué debe existir y qué debe cumplirse* para que el trabajo se considere hecho.

---

## 1. La regla de los nueve artefactos

> **Ningún módulo, feature o endpoint se implementa si antes no existen sus nueve
> artefactos de diseño, revisados y aprobados.**

| # | Artefacto | Dónde vive | Quién lo produce | Qué responde |
| - | --------- | ---------- | ---------------- | ------------ |
| 1 | **RFC** | `rfcs/RFC-XXXX-*.md` | Arquitecto / dueño del dominio | Qué se construye y por qué |
| 2 | **ADR** | `adrs/ADR-XXXX-*.md` | Arquitecto | Qué decisión técnica se toma y qué se descarta |
| 3 | **Checklist** | `checklists/*.md` | QA | Cómo se verifica que está bien |
| 4 | **Diseño** | RFC §Diseño + Figma / `docs/diagrams/` | UX + UI | Cómo se ve y se comporta |
| 5 | **Casos de uso** | RFC §Casos de uso | Analista Funcional | Qué puede hacer cada actor, con precondiciones y flujos alternos |
| 6 | **Modelo de dominio** | `docs/domain/<ctx>.md` | Arquitecto | Agregados, invariantes, lenguaje |
| 7 | **Contratos** | `packages/contracts/` (esquemas Zod) | Backend + Frontend | Forma exacta de la entrada y la salida |
| 8 | **Interfaces** | RFC §Puertos | Backend | Qué necesita el dominio del exterior |
| 9 | **Eventos, estados y errores** | RFC §§ correspondientes | Arquitecto | Qué se publica, qué transiciones existen, qué puede fallar |

**Aplicación práctica:**

- Un PR de tipo `feat` sin RFC referenciado **se cierra sin revisar**.
- Un `fix`, `chore`, `docs`, `test` o `refactor` **no** necesita RFC.
- Un cambio de menos de 20 líneas que no altera contratos ni dominio (un *tweak*) puede
  ir con una nota en el PR. Si la duda es si aplica o no, aplica.
- El artefacto puede ser breve. Un RFC de dos páginas es un RFC. La regla no exige
  volumen; exige que la decisión esté escrita **antes**.

**Verificación:** [`checklists/pre-code.md`](../checklists/pre-code.md).

---

## 2. Ciclo de vida de un módulo

```mermaid
graph LR
    A["1 Idea"] --> B["2 RFC borrador"]
    B --> C["3 Revisión"]
    C -->|cambios| B
    C --> D["4 RFC aprobado + ADRs"]
    D --> E["5 Contratos Zod"]
    E --> F["6 Contract tests en rojo"]
    F --> G["7 Dominio + tests"]
    G --> H["8 Aplicación"]
    H --> I["9 Infraestructura"]
    I --> J["10 Interfaz HTTP"]
    J --> K["11 SDK"]
    K --> L["12 UI"]
    L --> M["13 E2E"]
    M --> N["14 Revisión + DoD"]
    N --> O["15 Merge"]
    O --> P["16 Docs actualizados"]
```

**Los contratos van primero.** Una vez aprobado el esquema Zod, backend y frontend
trabajan en paralelo contra el mismo contrato. Esa es la razón principal de
[ADR-0009](../adrs/ADR-0009-zod-contracts.md).

---

## 3. Definition of Ready

Una tarea no entra a un sprint sin:

- [ ] RFC aprobado que la cubre.
- [ ] Casos de uso con criterios de aceptación en Gherkin.
- [ ] Contratos Zod definidos y mergeados.
- [ ] Diseño aprobado (o declarado explícitamente "sin UI").
- [ ] Dependencias identificadas y disponibles.
- [ ] Estimada y con dueño.
- [ ] Sin ambigüedad conocida sin resolver.

---

## 4. Definition of Done

Una tarea está terminada cuando **todo** esto es cierto:

**Funcional**
- [ ] Cumple todos los criterios de aceptación.
- [ ] Los flujos alternos y de error están implementados, no sólo el camino feliz.
- [ ] Estados `loading`, `empty`, `error`, `success` implementados en cada vista.

**Calidad**
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pasan en verde.
- [ ] Cobertura: ≥ 90% en `domain/`, ≥ 80% en `application/`.
- [ ] E2E del recorrido crítico afectado, en verde.
- [ ] Sin `any`, sin `@ts-ignore`, sin `console.log`, sin código muerto o comentado.

**No funcional**
- [ ] Accesibilidad: navegación por teclado, contraste, axe sin violaciones críticas.
- [ ] Rendimiento: presupuesto de la ruta respetado (ver §6).
- [ ] i18n: ningún literal en el código; claves en `es` y `en`.
- [ ] Seguridad: entradas validadas, autorización en servidor, sin secretos expuestos.
- [ ] Observabilidad: logs con `correlationId`, errores con código de dominio.

**Proceso**
- [ ] Checklist del dominio marcada en el PR.
- [ ] Documentación actualizada (RFC, `docs/domain/`, `.env.example`, README).
- [ ] Revisado y aprobado por al menos una persona distinta al autor.
- [ ] Migraciones probadas hacia adelante y con plan de reversión.

---

## 5. Puertas de calidad en CI

| Puerta | Herramienta | Bloquea merge |
| ------ | ----------- | ------------- |
| Formato | Prettier `--check` | Sí |
| Lint | ESLint (0 errores, 0 warnings) | Sí |
| Fronteras de arquitectura | `eslint-plugin-boundaries` | Sí |
| Tipos | `tsc --noEmit` en todo el workspace | Sí |
| Tests unitarios + integración | Vitest | Sí |
| Cobertura mínima | Vitest coverage | Sí |
| Build | `turbo build` | Sí |
| E2E críticos | Playwright | Sí |
| Accesibilidad | axe-core en E2E | Sí (violaciones críticas) |
| Presupuesto de bundle | `size-limit` | Sí |
| Lighthouse CI | LHCI | Sí (por debajo del umbral) |
| Dependencias vulnerables | `pnpm audit` + Dependabot | Sí (severidad alta+) |
| Secretos | gitleaks | Sí |
| Formato de commit | commitlint | Sí |
| Migraciones seguras | script de verificación | Sí |

CI corre sólo lo afectado, usando el grafo de Turborepo con caché remota.

---

## 6. Presupuestos de rendimiento

Medidos en p75, móvil, 4G simulada.

| Ruta | LCP | INP | CLS | JS inicial |
| ---- | --- | --- | --- | ---------- |
| Landing | < 2.0 s | < 200 ms | < 0.1 | < 120 KB |
| Listado de catálogo | < 2.5 s | < 200 ms | < 0.1 | < 160 KB |
| Ficha de producto | < 2.5 s | < 200 ms | < 0.1 | < 160 KB |
| Carrito / checkout | < 3.0 s | < 200 ms | < 0.1 | < 200 KB |
| Portal de cliente | < 3.0 s | < 200 ms | < 0.1 | < 220 KB |
| Admin | < 3.5 s | < 300 ms | < 0.1 | < 300 KB |

Backend: p95 < 200 ms en lecturas, p95 < 500 ms en escrituras, excluyendo terceros.

Superar el presupuesto **rompe el build**. Se sube el presupuesto por RFC, con motivo, no
por conveniencia.

---

## 7. Revisión de código

El revisor verifica, en este orden:

1. **¿Resuelve el problema del RFC?** Si el RFC no existe o dice otra cosa, para aquí.
2. **¿Está en la capa correcta?** Lógica de negocio en el dominio, no en el controller ni
   en el componente.
3. **¿Los invariantes están protegidos en el dominio**, no en la validación de entrada?
4. **¿Qué pasa cuando falla?** Errores, timeouts, concurrencia, reintentos.
5. **¿Los tests probarían un bug real?** Un test que sólo verifica el mock no vale.
6. **¿Se puede borrar código?** La mejor revisión elimina líneas.
7. **Convenciones y estilo.** Lo último — y en su mayoría automatizado.

Regla: el revisor no aprueba lo que no entiende. Pedir explicación es parte del trabajo.

---

## 8. Ramas, releases y despliegue

- `main` siempre desplegable. Se despliega en cada merge.
- Sin ramas `develop`. Trunk-based con feature flags para lo incompleto.
- Todo lo que no está terminado va detrás de un flag apagado en producción.
- Versionado de paquetes con Changesets. Ver [ADR-0019](../adrs/ADR-0019-versioning-releases.md).
- Entornos: `local` → `preview` (por PR) → `staging` → `production`.
- Toda migración de base de datos se despliega **antes** que el código que la usa.
- Reversión: el despliegue anterior se restaura en < 5 minutos. Las migraciones no se
  revierten: se corrigen hacia adelante.

---

## 9. Gestión de deuda técnica

- Toda deuda aceptada conscientemente se registra en `docs/tech-debt.md` con: qué,
  por qué, coste de arreglarla, coste de no arreglarla, y fecha límite.
- Deuda sin fecha límite = deuda que no se arregla. No se acepta.
- Cada sprint reserva un **20% de capacidad** para deuda y mantenimiento.
- Un `TODO` sin issue asociado es un error de lint.

---

## 10. Seguridad, mínimos permanentes

- Toda entrada externa se valida con Zod en la frontera. Sin excepciones.
- Autorización en el servidor, en cada operación, sobre el recurso concreto.
- Consultas parametrizadas siempre (Prisma lo garantiza; `$queryRaw` requiere revisión
  explícita de seguridad).
- Rate limiting en autenticación, búsqueda y mutaciones.
- CSP estricta sin `unsafe-inline`, más HSTS, `X-Content-Type-Options`, `Referrer-Policy`.
- Secretos sólo en el gestor de secretos del entorno. Rotación documentada.
- Dependencias auditadas en cada PR; actualización de seguridad en menos de 7 días.
- Datos personales: minimización, cifrado en tránsito y en reposo, retención definida.

Detalle: [`skills/security.md`](../skills/security.md) y
[`checklists/security.md`](../checklists/security.md).
