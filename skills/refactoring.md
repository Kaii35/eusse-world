# Skill — Refactoring

## Objetivo

Reducir el coste de cambiar el código, sin cambiar lo que hace.

## Buenas prácticas

- **Tests primero.** Sin red de seguridad no se refactoriza: se reescribe y se reza.
- **Los tests no se tocan durante el refactor.** Si hay que modificarlos, no era un
  refactor: era un cambio de comportamiento.
- **Dos commits, dos intenciones.** Nunca refactor y feature en el mismo commit.
- **Pasos pequeños y verdes.** Cambio pequeño → tests → commit. Repetir.
- **Regla de tres.** Se abstrae a la tercera repetición, no a la primera.
- **Duplicación real vs. accidental.** Dos cosas parecidas que cambiarán por motivos
  distintos deben seguir separadas. Unificarlas crea acoplamiento.
- **Mejora medible.** Complejidad, duplicación o tiempo: con número antes y después.
- **PRs pequeños.** Un refactor de 2 000 líneas no se revisa: se aprueba a ciegas.

## Errores comunes

| Error                                      | Consecuencia                                      |
| ------------------------------------------ | ------------------------------------------------- |
| Refactorizar sin tests                     | Se rompe algo y nadie lo nota hasta producción    |
| Modificar los tests durante el refactor    | Se pierde la garantía                             |
| Mezclar refactor y cambio funcional        | Imposible de revisar; imposible de revertir       |
| Abstraer a la primera repetición           | Abstracción equivocada, congelada                 |
| Unificar duplicación accidental            | Acoplamiento entre cosas que evolucionan distinto |
| Refactor gigante de una vez                | Conflictos eternos y revisión imposible           |
| Cambios cosméticos masivos                 | Ensucia el historial y oculta los cambios reales  |
| Refactorizar sin motivo                    | Riesgo sin beneficio                              |
| "Mientras estoy aquí, mejoro esto también" | El PR crece hasta no ser revisable                |

## Patrones

**Ciclo seguro**

```
1. ¿Hay tests que cubren este comportamiento?   No → escribirlos primero (commit aparte)
2. Verde
3. Cambio pequeño
4. Verde
5. Commit
6. Repetir
```

**Extraer método** — cuando un bloque necesita un comentario para entenderse, el comentario
es el nombre del método que falta.

**Reemplazar condicional por polimorfismo** — un `switch` sobre un tipo que aparece en tres
sitios pide una jerarquía o un mapa de estrategias.

**Introducir value object** — tres funciones que reciben `(amount, currency)` piden un
`Money`.

**Mover a la capa correcta** — el refactor más valioso de este proyecto: lógica de negocio
que está en un controller o en un componente vuelve al dominio.

**Strangler fig** — para reemplazar algo grande: fachada nueva, migración pieza a pieza,
eliminación de lo viejo. Nunca _big bang_.

## Antipatrones

- **Big-bang rewrite**: casi siempre fracasa y pierde años de reglas de negocio implícitas.
- **Abstracción especulativa**: una interfaz con una sola implementación "por si acaso".
- **Refactor sin medir**: no sabes si mejoró.
- **DRY llevado al extremo**: acoplar módulos por eliminar cinco líneas duplicadas.
- **Renombrar todo el proyecto** en un PR.
- **Refactorizar en la rama de un feature**: mezcla dos riesgos.

## Ejemplos

**Bien — mover a la capa correcta**

```
// Antes: la regla vive en el componente
const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
const tax = total * 0.19
// Después: el servidor calcula y devuelve; el componente muestra
const { subtotal, tax, total } = cart.totals
```

Se elimina el riesgo de que el número mostrado no sea el cobrado, y de paso desaparece el
IVA codificado en el frontend.

**Mal — duplicación accidental unificada**

```
// Dos validaciones que hoy son iguales pero cambian por motivos distintos
function validateEntity(e: Account | Product) { if (!e.name) throw ... }
```

`Account` y `Product` no comparten motivo de cambio. Unificarlos acopla dos contextos.

## Convenciones

- Commit: `refactor(<scope>): <qué mejora>`.
- PR ≤ 400 líneas de diff.
- El PR declara la mejora con números: complejidad, duplicación, tiempo.
- Deuda pagada se cierra en `docs/tech-debt.md`.
- Si el refactor requiere cambiar una frontera de arquitectura, se escala al Arquitecto y
  se escribe un ADR.

## Checklist

- [ ] Existen tests que cubren el comportamiento antes de tocar
- [ ] Los tests pasan antes y después **sin modificarse**
- [ ] Comportamiento observable idéntico (API, eventos, base de datos)
- [ ] Sin cambios funcionales colados
- [ ] Mejora medida con número antes/después
- [ ] Duplicación real, no accidental
- [ ] Sin dependencias nuevas
- [ ] Sin violación de fronteras arquitectónicas
- [ ] Nombres alineados con el glosario
- [ ] Código muerto eliminado (`knip`)
- [ ] PR ≤ 400 líneas
- [ ] Sin regresión de rendimiento en rutas críticas
- [ ] Deuda cerrada en el registro

## Plantillas

[`docs/07-module-dependencies.md`](../docs/07-module-dependencies.md) ·
[`skills/testing.md`](testing.md)
