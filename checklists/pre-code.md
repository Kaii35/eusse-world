# Checklist — Antes de escribir código

**La puerta más importante del proyecto.** Verifica la regla de los nueve artefactos
([`docs/04-standards.md`](../docs/04-standards.md) §1).

> Un PR de tipo `feat` sin RFC referenciado **se cierra sin revisar**.
> `fix`, `chore`, `docs`, `test` y `refactor` no necesitan RFC.

---

## Los nueve artefactos

- [ ] **1. RFC aprobado** que cubre este trabajo, sin preguntas abiertas bloqueantes
- [ ] **2. ADR** creados para toda decisión estructural que el RFC implique
- [ ] **3. Checklist** del dominio identificada y disponible
- [ ] **4. Diseño** aprobado con **todos** los estados (o declarado "sin UI")
- [ ] **5. Casos de uso** con actor, precondiciones, flujos principal, alternos y de error
- [ ] **6. Modelo de dominio**: agregados, entidades, value objects e invariantes
- [ ] **7. Contratos** Zod definidos y mergeados en `@eusse/contracts`
- [ ] **8. Interfaces**: puertos que el dominio necesita, con su firma
- [ ] **9. Eventos, estados y errores** especificados

## Comprensión

- [ ] Puedo enunciar el problema que resuelve este trabajo en tres frases
- [ ] Sé qué **no** entra en el alcance
- [ ] Sé qué agentes dependen de mi entrega
- [ ] Sé de qué otros artefactos depende mi trabajo, y están listos

## Sin ambigüedad

- [ ] No hay ninguna decisión que tenga que "suponer"
- [ ] Los casos borde están especificados (vacío, uno, muchos, máximo, nulo, concurrente)
- [ ] El comportamiento concurrente está definido
- [ ] Los permisos por rol están especificados para cada operación
- [ ] Los mensajes de error están escritos, no improvisados

> Si algo aquí no se cumple, **emite un BLOQUEO** ([`docs/10-ai-strategy.md`](../docs/10-ai-strategy.md) §4.2).
> No adivines. Adivinar es cómo entra la deuda técnica.

## Preparación técnica

- [ ] Sé en qué capa va cada pieza que voy a escribir
- [ ] Sé qué eventos emite y qué eventos consume
- [ ] Sé qué índices necesitará y por qué
- [ ] Sé cómo se va a probar (unitario, integración, E2E)
- [ ] Sé cuál es el presupuesto de rendimiento de la ruta afectada

## Antes de empezar de verdad

- [ ] Rama creada con el nombre correcto (`feat/<scope>-<slug>`)
- [ ] `pnpm install && pnpm dev` funciona en mi entorno
- [ ] La suite de tests está en verde antes de tocar nada
- [ ] **Los contract tests están escritos y en rojo**

---

**Si todos los ítems están marcados, puedes escribir código. Si no, todavía no.**
