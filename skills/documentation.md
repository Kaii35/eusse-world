# Skill — Documentación

## Objetivo

Que la documentación sea **cierta**. Documentación desactualizada es peor que ninguna:
hace perder tiempo y provoca decisiones equivocadas con falsa confianza.

## Buenas prácticas

- **Se actualiza en el mismo PR que el cambio.** "Después" no llega nunca.
- **Un dato, un sitio.** Los demás documentos enlazan. Sin duplicación.
- **Documenta el porqué, no el qué.** El código dice qué hace; nunca dice por qué se
  eligió así.
- **Todo documento con dueño y fecha de última revisión.**
- **Los ADR no se editan: se supersedan.** La historia de las decisiones es valiosa.
- **Diagramas en Mermaid**, embebidos. Nunca capturas como fuente.
- **Los ejemplos compilan.** Un ejemplo roto enseña algo falso.
- **Cada pregunta repetida es un fallo de documentación.** Si te la hacen dos veces,
  escríbela.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Documentar "cuando haya tiempo" | Nunca hay tiempo |
| Duplicar información | Se actualiza una copia y las otras mienten |
| Comentar lo obvio (`// incrementa i`) | Ruido que oculta los comentarios útiles |
| Documentar el qué en vez del porqué | El código ya dice el qué, y mejor |
| Diagrama que no coincide con el código | Se pierde la confianza en toda la documentación |
| Captura de pantalla como fuente | Imposible de actualizar |
| README genérico de plantilla | Nadie lo lee |
| Lenguaje vago ("debería", "en general") | Oculta una decisión no tomada |
| Sin dueño ni fecha | Nadie sabe si sigue vigente |
| Ejemplos que no compilan | Enseñan algo incorrecto |

## Patrones

**Comentario que aporta**

```
// Regla PRC-04 — ver RFC-0006
// Revalidamos precios de más de 24 h porque las listas mayoristas se actualizan
// a diario y confirmar con un precio viejo crea un compromiso comercial erróneo.
if (line.isPriceStale(hours(24))) { ... }
```

Explica el porqué y enlaza la fuente. Sin él, alguien "optimizará" quitando la
revalidación.

**Comentario que sobra**

```
// obtiene el usuario por id
function getUserById(id: string) { ... }
```

**README de paquete útil**

```
# @eusse/ui
Design system compartido por apps/web y apps/admin.

## Cuándo usarlo
Cualquier componente visual reutilizable y agnóstico del dominio.

## Cuándo NO usarlo
Composiciones específicas de una app → apps/*/components
Componentes que conocen el dominio → features/<x>/components

## Instalar / Usar / Contribuir
...
```

Lo importante es "cuándo NO usarlo": eso evita la deriva.

**Documento fechado**

```
# 01 — Arquitectura
**Dueño:** Arquitecto · **Última revisión:** 2026-08-06 · **Estado:** Vigente
```

**ADR supersedido** — el original se marca `Supersedido por ADR-0031`; nunca se borra ni se
edita su contenido.

## Antipatrones

- **Documentación en Confluence, Notion y el repositorio a la vez**: tres verdades.
- **Generar documentación de API automáticamente y llamarlo documentación**: falta el cómo
  y el porqué.
- **Comentar código en vez de borrarlo**: para eso está git.
- **`TODO` sin dueño ni issue.**
- **Documento de 40 páginas que nadie lee**: mejor cinco de una que uno de cuarenta.
- **Actualizar sólo cuando alguien se queja.**

## Convenciones

- Español para prosa, inglés para identificadores y ejemplos de código.
- `docs/NN-nombre.md` numerado para orden de lectura.
- Todo documento con dueño, fecha y estado.
- Enlaces relativos entre documentos.
- Mermaid para todo diagrama.
- `TODO(dueño, #issue): descripción`.
- Cambio de contrato → OpenAPI regenerado en el mismo PR.

## Checklist

- [ ] Actualizada en el mismo PR que el cambio
- [ ] Toda afirmación verificable contra el código
- [ ] Enlaces internos funcionan
- [ ] Ejemplos de código compilan
- [ ] Diagramas reflejan la realidad
- [ ] Dueño y fecha actualizados
- [ ] Sin duplicación: se enlaza
- [ ] README de paquete dice cuándo usarlo **y cuándo no**
- [ ] `.env.example` documentado variable a variable
- [ ] OpenAPI regenerado si cambió el contrato
- [ ] Runbook probado por alguien distinto de quien lo escribió
- [ ] `CLAUDE.md` refleja la estructura actual
- [ ] Sin contradicciones con otros documentos

## Plantillas

[`templates/rfc.md`](../templates/rfc.md) · [`templates/adr.md`](../templates/adr.md) ·
[`docs/README.md`](../docs/README.md)
