# Documentación — Eusse World

Índice de la documentación viva. Todo documento aquí es **normativo**: si el código
contradice un documento, uno de los dos es un bug.

## Núcleo

| Doc | Tema | Léelo si… |
| --- | ---- | --------- |
| [00-vision.md](00-vision.md) | Qué es Eusse World, para quién y qué no es | entras al proyecto |
| [01-architecture.md](01-architecture.md) | Arquitectura de sistema, capas, límites | vas a diseñar o decidir |
| [02-domain-model.md](02-domain-model.md) | Contextos acotados, agregados, lenguaje ubicuo | vas a modelar o nombrar algo |
| [03-conventions.md](03-conventions.md) | Nombres, carpetas, ramas, commits, imports | vas a escribir cualquier cosa |
| [04-standards.md](04-standards.md) | Estándares de desarrollo y puertas de calidad | vas a abrir un PR |

## Planificación

| Doc | Tema |
| --- | ---- |
| [05-roadmap.md](05-roadmap.md) | Fases, hitos y alcance por fase |
| [06-implementation-order.md](06-implementation-order.md) | Orden exacto de implementación, paso a paso |
| [07-module-dependencies.md](07-module-dependencies.md) | Grafo de dependencias entre módulos y paquetes |
| [11-execution-plan.md](11-execution-plan.md) | Plan de ejecución iterativo, sprint a sprint |

## Transversal

| Doc | Tema |
| --- | ---- |
| [08-technical-risks.md](08-technical-risks.md) | Riesgos técnicos, impacto y mitigación |
| [09-scalability.md](09-scalability.md) | Estrategia de escalabilidad (técnica y organizativa) |
| [10-ai-strategy.md](10-ai-strategy.md) | Cómo trabajan los agentes de IA en este repo |
| [12-ux-guidelines.md](12-ux-guidelines.md) | Principios de UX, sistema visual y movimiento |
| [13-glossary.md](13-glossary.md) | Lenguaje ubicuo ES↔EN |
| [14-repo-structure.md](14-repo-structure.md) | Árbol completo del repositorio |

## Subcarpetas

- [`domain/`](domain/) — Modelos de dominio detallados por contexto acotado (uno por RFC aprobado).
- [`api/`](api/) — Contratos de API publicados (OpenAPI generado + guías de uso).
- [`diagrams/`](diagrams/) — Diagramas fuente (Mermaid en Markdown; sin binarios sin fuente).

## Reglas de la documentación

1. **Un documento, un dueño.** El agente responsable está declarado al inicio de cada doc.
2. **Fechado y versionado.** Todo cambio significativo actualiza `Última revisión`.
3. **Los ADR no se editan, se supersedan.** Los RFC sí evolucionan hasta aprobarse.
4. **Sin documentación duplicada.** Si un dato vive en un ADR, los demás documentos lo enlazan.
5. **Diagramas en Mermaid**, embebidos en Markdown. Nunca capturas de pantalla como fuente.
