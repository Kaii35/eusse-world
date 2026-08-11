# CU-NNN · <Nombre del caso de uso>

| Campo                | Valor               |
| -------------------- | ------------------- |
| **Contexto acotado** |                     |
| **RFC**              | RFC-XXXX            |
| **Autor**            | Analista Funcional  |
| **Estado**           | Borrador · Aprobado |

## Actor

Quién lo ejecuta. Rol concreto, no "el usuario".

## Objetivo

Qué consigue el actor. Una frase, en términos de negocio.

## Precondiciones

Qué debe ser cierto antes de empezar. Enumeradas, verificables.

- …

## Disparador

Qué inicia el caso de uso.

## Flujo principal

Paso a paso, sin saltos. Cada paso referencia las reglas que aplica.

1. …
2. … `[REGLA-01]`
3. …

## Flujos alternos

**A1. <Condición>**

1. …
2. Continúa en el paso N del flujo principal

**A2. <Condición>**

1. …

## Flujos de error

| ID  | Condición | Código de error | Qué ve el usuario |
| --- | --------- | --------------- | ----------------- |
| E1  |           |                 |                   |
| E2  |           |                 |                   |

## Postcondiciones

Qué es cierto al terminar con éxito. Incluye los eventos emitidos.

- …

## Reglas de negocio aplicadas

| ID       | Regla | Ejemplo | Contraejemplo |
| -------- | ----- | ------- | ------------- |
| REGLA-01 |       |         |               |

## Permisos

| Rol        | ¿Puede? | Condición |
| ---------- | ------- | --------- |
| `OWNER`    |         |           |
| `ADMIN`    |         |           |
| `BUYER`    |         |           |
| `APPROVER` |         |           |
| `VIEWER`   |         |           |

## Concurrencia

Qué ocurre si dos usuarios de la misma cuenta ejecutan esto a la vez. **Obligatorio.**

## Casos borde

| Caso            | Comportamiento esperado |
| --------------- | ----------------------- |
| Vacío           |                         |
| Uno             |                         |
| Muchos          |                         |
| Máximo          |                         |
| Nulo            |                         |
| Negativo / cero |                         |
| Texto muy largo |                         |
| Expirado        |                         |
| Concurrente     |                         |

## Criterios de aceptación

```gherkin
Escenario: <nombre descriptivo>
  Dado …
  Y …
  Cuando …
  Entonces …
  Y …
```

Un escenario por criterio. **Verificables objetivamente**: sin "rápido", "intuitivo" ni
"fácil".

## Estados de la interfaz

| Estado  | Qué se muestra |
| ------- | -------------- |
| Loading |                |
| Empty   |                |
| Error   |                |
| Partial |                |
| Success |                |

## Preguntas abiertas

| #   | Pregunta | Bloquea | Resuelta |
| --- | -------- | ------- | -------- |
| 1   |          |         |          |
