# Plantillas

Formato canónico de cada artefacto. Usarlas no es burocracia: es lo que hace que dos
personas distintas produzcan documentos comparables y que un agente sepa qué se espera de
él sin preguntarlo.

| Plantilla | Para |
| --------- | ---- |
| [rfc.md](rfc.md) | Propuesta de diseño previa a implementar |
| [adr.md](adr.md) | Decisión de arquitectura |
| [use-case.md](use-case.md) | Caso de uso con flujos y criterios |
| [domain-model.md](domain-model.md) | Documentación de un contexto acotado |
| [api-contract.md](api-contract.md) | Contrato de endpoint |
| [event.md](event.md) | Definición de un evento |
| [module.md](module.md) | Estructura de un módulo de `apps/api` |
| [component.md](component.md) | Documentación de un componente de UI |
| [pull-request.md](pull-request.md) | Descripción de PR |
| [bug-report.md](bug-report.md) | Reporte de defecto |
| [test-plan.md](test-plan.md) | Plan de pruebas de un feature |
| [agent.md](agent.md) | Definición de un agente nuevo |
| [skill.md](skill.md) | Definición de una skill nueva |

## Reglas

- Se rellenan **todas** las secciones. Si una no aplica, se escribe "No aplica" y por qué;
  no se borra.
- Español para la prosa, inglés para identificadores y código.
- Diagramas en Mermaid, embebidos.
- Un artefacto incompleto no pasa la revisión.
