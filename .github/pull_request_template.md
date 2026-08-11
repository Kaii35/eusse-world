# <type>(<scope>): <descripción en inglés, imperativo>

## Qué

<!-- Dos o tres frases. -->

## Por qué

**RFC:** RFC-XXXX <!-- Obligatorio si el PR es de tipo `feat`. Sin RFC, se cierra sin revisar. -->
**ADR:** ADR-XXXX <!-- si aplica -->
**Issue:** #NNN <!-- si aplica -->

## Cómo

<!-- Decisiones de implementación que no se deducen del diff. -->

## Alcance

**Incluye:**
**No incluye (y por qué):**

## Cómo probarlo

1.
2.

## Capturas

<!-- Antes/después, en claro y oscuro, si hay cambios visuales. -->

## Impacto

| Área                        | Impacto                              |
| --------------------------- | ------------------------------------ |
| Cambios rompedores          | Sí / No —                            |
| Migración de base de datos  | Sí / No                              |
| Variables de entorno nuevas | Sí / No — `.env.example` actualizado |
| Contratos modificados       | Sí / No — consumidores actualizados  |
| Feature flag                |                                      |

## Checklists

- [ ] [Definition of Done](../checklists/definition-of-done.md)
- [ ] [Backend](../checklists/backend.md) _(si aplica)_
- [ ] [Frontend](../checklists/frontend.md) _(si aplica)_
- [ ] [Seguridad](../checklists/security.md) _(si toca datos privados o dinero)_
- [ ] [Accesibilidad](../checklists/accessibility.md) _(si hay UI)_
- [ ] [Migración](../checklists/database-migration.md) _(si hay migración)_

## Verificación

- [ ] `lint` · `typecheck` · `test` · `build` en verde
- [ ] Cobertura dentro de umbral (dominio ≥ 90%, aplicación ≥ 80%)
- [ ] E2E del recorrido afectado en verde
- [ ] Documentación actualizada **en este PR**
- [ ] Changeset creado _(si es paquete publicable)_
- [ ] Diff productivo ≤ ~400 líneas

## Deuda técnica

<!-- "Ninguna" o: qué, por qué, y registrada en docs/tech-debt.md con fecha límite. -->

## Notas para el revisor

<!-- Dónde mirar con atención. Qué te preocupa. -->
