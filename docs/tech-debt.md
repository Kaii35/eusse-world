# Registro de deuda técnica

**Dueño:** Arquitecto · **Última revisión:** 2026-08-06

Toda deuda aceptada **conscientemente** se registra aquí. Deuda sin fecha límite es deuda
que no se arregla: **no se acepta**.

El 20% de la capacidad de cada sprint está reservado a pagar esta lista.

## Formato

| #   | Qué | Por qué se aceptó | Coste de arreglarla | Coste de NO arreglarla | Fecha límite | Dueño | Estado |
| --- | --- | ----------------- | ------------------- | ---------------------- | ------------ | ----- | ------ |

## Deuda abierta

| #             | Qué                                                                                     | Por qué se aceptó                                                           | Coste de arreglarla                                                         | Coste de NO arreglarla                              | Fecha límite                 | Dueño    | Estado  |
| ------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------- | -------- | ------- |
| TD-LANDING-01 | El formulario de cotización de la landing confirma en local y **no envía** la solicitud | El contexto Content y el endpoint de leads (RFC-0009 §4.7) aún no existen   | Endpoint de leads + `content.LeadCaptured.v1` + rate limit + anti-bot (C-x) | Las solicitudes reales se pierden si se publica así | Antes de publicar la landing | Frontend | Abierta |
| TD-LANDING-02 | Los textos de la landing están en `messages/*.json`, no en base de datos editable       | RFC-0009 §4.5 (contenido editable) depende del contexto Content y del admin | Migrar a `LandingSection` / `SectionContent` con ISR                        | Cada cambio de texto requiere despliegue            | Bloque C                     | Frontend | Abierta |

## Deuda cerrada

_Ninguna todavía._

---

## Qué NO va aquí

- Bugs → registro de defectos.
- Mejoras deseables sin coste actual → backlog de producto.
- "Código feo" sin impacto medible → revisión de código, no deuda.

## Qué SÍ va aquí

- Un atajo tomado a sabiendas para llegar a una fecha.
- Un test que falta y que sabemos que falta.
- Un adaptador provisional que hay que sustituir.
- Una consulta sin índice que hoy funciona y mañana no.
- Una abstracción que sabemos equivocada y que aún no hemos corregido.
