# Plan de pruebas — <Feature>

| Campo | Valor |
| ----- | ----- |
| **RFC** | RFC-XXXX |
| **Autor** | Testing / QA |
| **Recorridos críticos afectados** | |

## Alcance

Qué se prueba y qué **no**, con motivo.

## Riesgos a cubrir

Qué es lo que más duele si falla en este feature. Ordena el esfuerzo por aquí, no por
cobertura de líneas.

| Riesgo | Cómo se cubre |
| ------ | ------------- |
| | |

## Unitarios (dominio)

| Invariante / regla | Test | Estado |
| ------------------ | ---- | ------ |
| INV-01 / REGLA-01 | `debería … cuando …` | ☐ |

**Objetivo:** cobertura ≥ 90% en `domain/`.

## Integración (casos de uso)

Con PostgreSQL y Redis **reales** (Testcontainers).

| Caso de uso | Camino feliz | Caminos de error | Estado |
| ----------- | :---: | ---- | ------ |
| CU-001 | ☐ | E1 ☐ · E2 ☐ | |

**Objetivo:** cobertura ≥ 80% en `application/`.

## Contrato

| Endpoint | Entrada válida | Entrada inválida | Respuesta | Errores | SDK |
| -------- | :---: | :---: | :---: | :---: | :---: |
| | ☐ | ☐ | ☐ | ☐ | ☐ |

## Componente

| Componente | Comportamiento accesible | Estados | Estado |
| ---------- | :---: | :---: | ------ |
| | ☐ | ☐ | |

## E2E

| Recorrido | Escenario | Estado |
| --------- | --------- | ------ |
| | | ☐ |

## Casos borde

| Caso | Esperado | Estado |
| ---- | -------- | ------ |
| Vacío | | ☐ |
| Uno | | ☐ |
| Muchos | | ☐ |
| Máximo | | ☐ |
| Nulo / cero / negativo | | ☐ |
| Texto muy largo / emojis | | ☐ |
| Expirado | | ☐ |
| Concurrente | | ☐ |

## Robustez

| Prueba | Esperado | Estado |
| ------ | -------- | ------ |
| Doble clic | Una sola operación | ☐ |
| Recarga a mitad | Estado consistente | ☐ |
| Botón atrás tras completar | Sin repetir | ☐ |
| Sesión expirada durante la operación | Mensaje claro, datos preservados | ☐ |
| Red lenta o intermitente | Reintento o error recuperable | ☐ |
| Dos pestañas | Sin corrupción | ☐ |
| Dos usuarios de la misma cuenta | Sin pérdida de datos | ☐ |

## Seguridad

| Prueba | Estado |
| ------ | ------ |
| IDOR: cuenta A ↛ recurso de B → 404 | ☐ |
| Permisos por rol verificados en servidor | ☐ |
| Entradas maliciosas rechazadas | ☐ |
| Importes del cliente ignorados | ☐ |
| Idempotencia bajo concurrencia real | ☐ |

## No funcional

| Prueba | Objetivo | Estado |
| ------ | -------- | ------ |
| axe sin violaciones críticas ni serias | | ☐ |
| Recorrido sólo con teclado | | ☐ |
| Verificado con lector de pantalla | | ☐ |
| Presupuesto de rendimiento | | ☐ |
| Ambos idiomas | | ☐ |
| Ambos temas | | ☐ |
| Matriz de navegadores y dispositivos | | ☐ |

## Datos de prueba

Qué cuentas, roles, productos y listas de precios hacen falta. Cómo se generan (fábricas
de `@eusse/testing`, no fixtures compartidos).

## Qué NO se automatiza y por qué

Sé explícito. Un hueco declarado se puede gestionar; uno silencioso, no.
