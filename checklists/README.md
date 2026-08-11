# Checklists

Puertas de calidad **verificables**. Una checklist no es una sugerencia: es lo que separa
"creo que está bien" de "está bien".

## Cómo se usan

1. El agente marca su checklist **antes** de entregar.
2. El PR enlaza la checklist aplicable, con los ítems marcados.
3. El revisor verifica por muestreo, no confía a ciegas.
4. Lo que se puede automatizar, se automatiza: un ítem que una máquina puede verificar
   **debe** ser una puerta de CI, no una casilla.

## Índice

### Proceso

| Checklist                                        | Cuándo                                                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| [pre-rfc.md](pre-rfc.md)                         | Antes de escribir un RFC                                       |
| [pre-code.md](pre-code.md)                       | **Antes de escribir la primera línea de código de un feature** |
| [definition-of-ready.md](definition-of-ready.md) | Antes de que una tarea entre a un sprint                       |
| [definition-of-done.md](definition-of-done.md)   | Antes de dar una tarea por terminada                           |
| [pr-review.md](pr-review.md)                     | Al revisar un PR                                               |

### Por disciplina

| Checklist                                      | Para                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| [backend.md](backend.md)                       | Módulos, casos de uso, endpoints                      |
| [frontend.md](frontend.md)                     | Rutas, componentes, integración                       |
| [database-migration.md](database-migration.md) | Cualquier cambio de esquema                           |
| [security.md](security.md)                     | Features con datos privados, dinero o entrada externa |
| [accessibility.md](accessibility.md)           | Cualquier pantalla o componente                       |
| [performance.md](performance.md)               | Rutas y consultas críticas                            |
| [seo.md](seo.md)                               | Páginas públicas                                      |
| [i18n.md](i18n.md)                             | Cualquier texto visible                               |

### Operación

| Checklist                  | Para                    |
| -------------------------- | ----------------------- |
| [release.md](release.md)   | Despliegue a producción |
| [incident.md](incident.md) | Incidente en producción |

## Regla

Si un ítem se marca sin haberlo verificado de verdad, la checklist deja de servir para
todos. Es preferible dejarlo sin marcar y explicar por qué.
