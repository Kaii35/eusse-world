# <type>(<scope>): <descripción en inglés, imperativo>

## Qué

Qué cambia. Dos o tres frases.

## Por qué

El problema que resuelve. Si está en el RFC, enlázalo y resume en una línea.

**RFC:** RFC-XXXX
**ADR:** ADR-XXXX (si aplica)
**Issue:** #NNN (si aplica)

> Un PR de tipo `feat` **sin RFC referenciado se cierra sin revisar**.

## Cómo

Decisiones de implementación que un revisor no deduciría del diff. Si tomaste una decisión
dentro del margen del RFC, dila aquí.

## Alcance

**Incluye:** …
**No incluye (y por qué):** …

## Cómo probarlo

1. …
2. …

Datos de prueba, usuario y rol necesarios.

## Capturas / vídeo

Antes y después, en claro y en oscuro, si hay cambios visuales.

## Impacto

| Área                        | Impacto                              |
| --------------------------- | ------------------------------------ |
| Cambios rompedores          | Sí / No — cuáles                     |
| Migración de base de datos  | Sí / No — ver checklist              |
| Variables de entorno nuevas | Sí / No — `.env.example` actualizado |
| Contratos modificados       | Sí / No — consumidores actualizados  |
| Feature flag                | Nombre y estado en producción        |
| Rendimiento                 |                                      |
| Seguridad                   |                                      |

## Checklists

- [ ] [`checklists/definition-of-done.md`](../checklists/definition-of-done.md)
- [ ] [`checklists/backend.md`](../checklists/backend.md) _(si aplica)_
- [ ] [`checklists/frontend.md`](../checklists/frontend.md) _(si aplica)_
- [ ] [`checklists/security.md`](../checklists/security.md) _(si toca datos privados o dinero)_
- [ ] [`checklists/accessibility.md`](../checklists/accessibility.md) _(si hay UI)_
- [ ] [`checklists/database-migration.md`](../checklists/database-migration.md) _(si hay migración)_

## Verificación

- [ ] `lint` · `typecheck` · `test` · `build` en verde
- [ ] Cobertura dentro de umbral
- [ ] E2E del recorrido afectado en verde
- [ ] Documentación actualizada **en este PR**
- [ ] Changeset creado _(si es paquete publicable)_
- [ ] Diff productivo ≤ ~400 líneas

## Deuda técnica

Ninguna · o: qué, por qué se acepta, y registrada en `docs/tech-debt.md` con fecha límite.

## Notas para el revisor

Dónde mirar con más atención. Qué te preocupa. Qué no estás seguro de haber resuelto bien.
