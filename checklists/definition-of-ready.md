# Checklist — Definition of Ready

Una tarea no entra a un sprint sin esto. Meter tareas no listas es la causa número uno de
sprints que no se terminan.

---

## Claridad

- [ ] El problema está enunciado: qué, para quién, por qué ahora
- [ ] El valor esperado está escrito
- [ ] La métrica de éxito está definida
- [ ] El alcance está acotado: se sabe qué **no** entra

## Especificación

- [ ] **RFC aprobado** que la cubre
- [ ] Casos de uso con actor, precondiciones, flujos principal, alternos y de error
- [ ] Criterios de aceptación en Gherkin, **verificables objetivamente**
- [ ] Casos borde enumerados
- [ ] Permisos por rol especificados
- [ ] Comportamiento concurrente definido

## Diseño

- [ ] Diseño aprobado con **todos** los estados, o declarado explícitamente "sin UI"
- [ ] Contenido definitivo, no _lorem ipsum_
- [ ] Mensajes de error escritos

## Técnico

- [ ] **Contratos Zod definidos y mergeados**
- [ ] Modelo de datos aprobado por el agente de Base de Datos
- [ ] Puertos identificados
- [ ] Eventos, estados y errores especificados

## Dependencias

- [ ] Todas las dependencias identificadas
- [ ] Las dependencias bloqueantes están **listas**, no "en camino"
- [ ] La puerta del bloque anterior está superada

## Planificación

- [ ] Estimada por quien la va a hacer
- [ ] Con dueño asignado
- [ ] Cabe en la capacidad del sprint (80% features / 20% deuda)

## Sin ambigüedad

- [ ] **Cero preguntas abiertas que bloqueen**
- [ ] Nadie tendrá que "suponer" nada para implementarla

---

**Si falta un ítem, la tarea no entra al sprint. Se prepara y entra al siguiente.**
