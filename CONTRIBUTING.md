# Contribuir a Eusse World

## Antes que nada

> **Ningún módulo, feature o endpoint se implementa si antes no existen sus nueve
> artefactos de diseño.**

RFC · ADR · Checklist · Diseño · Casos de uso · Modelo de dominio · Contratos · Interfaces ·
Eventos, estados y errores.

Verificación: [`checklists/pre-code.md`](checklists/pre-code.md).
Un PR de tipo `feat` sin RFC referenciado **se cierra sin revisar**.

---

## Flujo de trabajo

```
1. Identifica tu agente        agents/<agente>.md
2. Lee tu skill                skills/<dominio>.md
3. Lee el RFC de la tarea      rfcs/RFC-XXXX-*.md
4. Verifica la puerta previa   checklists/pre-code.md
5. Crea la rama                feat/<scope>-<slug>
6. Escribe los contratos       packages/contracts/  (primero, siempre)
7. Escribe los contract tests  en rojo
8. Implementa                  dominio → aplicación → infraestructura → HTTP → SDK → UI
9. Verifica                    checklists/definition-of-done.md
10. Abre el PR                 templates/pull-request.md
```

**Los contratos van primero.** Una vez mergeado el esquema Zod, backend y frontend
trabajan en paralelo sin bloquearse.

---

## Ramas

```
main                    protegida, siempre desplegable
feat/<scope>-<slug>     feat/cart-add-item
fix/<scope>-<slug>      fix/checkout-double-submit
docs/<slug>
chore/<slug>
refactor/<scope>-<slug>
```

Sin ramas de larga vida. Lo incompleto se mergea **detrás de un feature flag apagado**.

---

## Commits

Conventional Commits, en inglés, validados por hook:

```
feat(cart): add quantity increment validation

Los SKUs mayoristas se venden por múltiplos de caja. Rechazar en dominio
evita que el back-office reciba pedidos imposibles de despachar.

Refs: RFC-0006
```

`type`: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

---

## Pull Requests

- **Máximo ~400 líneas** de diff productivo. Más grande, se divide.
- Plantilla obligatoria: [`templates/pull-request.md`](templates/pull-request.md).
- Enlaza su RFC y adjunta las checklists marcadas.
- Merge por **squash**.
- Requiere aprobación de al menos una persona distinta al autor.

---

## Cómo se revisa

Orden de [`checklists/pr-review.md`](checklists/pr-review.md):

1. ¿Resuelve el problema del RFC?
2. ¿Está en la capa correcta?
3. ¿Los invariantes se protegen en el dominio?
4. ¿Qué pasa cuando falla?
5. ¿Los tests probarían un bug real?
6. ¿Se puede borrar código?
7. Convenciones y estilo (lo último, y casi todo automatizado).

Distingue en tus comentarios entre **bloqueante**, **sugerencia** y **pregunta**.
El revisor no aprueba lo que no entiende: preguntar es parte del trabajo.

---

## Si algo es ambiguo

**No adivines.** Emite un BLOQUEO ([`docs/10-ai-strategy.md`](docs/10-ai-strategy.md) §4.2)
y escálalo. La resolución **modifica el RFC**, para que la ambigüedad no vuelva.

Adivinar es la principal fuente de deuda técnica en este proyecto.

---

## Deuda técnica

- Toda deuda aceptada conscientemente se registra en `docs/tech-debt.md` con qué, por qué,
  coste de arreglarla, coste de no arreglarla y **fecha límite**.
- **Deuda sin fecha límite no se acepta.**
- `TODO` sin issue es un error de lint.
- El 20% de capacidad de cada sprint está reservado a deuda. No se canjea por features.

---

## Idioma

Documentación en **español**. Código, identificadores, ramas y commits en **inglés**.
Textos de interfaz: ninguno en el código — todo por `next-intl`.

---

## Preguntas frecuentes

**¿Necesito RFC para arreglar un bug?** No. `fix`, `chore`, `docs`, `test` y `refactor` no
lo necesitan.

**¿Y para un cambio de 10 líneas que no toca contratos ni dominio?** Basta una nota en el
PR. Si dudas si aplica, aplica.

**¿Puedo añadir una librería?** No sin ADR. Ni siquiera una pequeña.

**El lint me bloquea por un valor de Tailwind arbitrario.** Correcto. Pide el token que
falta al agente de Design System; no inventes el valor.

**Un test es inestable.** Se arregla o se borra. Nunca `skip` y a otra cosa.
