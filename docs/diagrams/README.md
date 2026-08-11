# Diagramas

Todos los diagramas del proyecto son **Mermaid embebido en Markdown**. Nunca imágenes sin
fuente: un diagrama que no se puede editar deja de actualizarse y empieza a mentir.

## Dónde vive cada diagrama

| Diagrama                    | Ubicación                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Contexto del sistema (C4-1) | [`docs/01-architecture.md`](../01-architecture.md) §1                                                                 |
| Capas y flujo de eventos    | [`docs/01-architecture.md`](../01-architecture.md) §2                                                                 |
| Mapa de contextos acotados  | [`docs/01-architecture.md`](../01-architecture.md) §3                                                                 |
| Flujo de intención y login  | [`docs/01-architecture.md`](../01-architecture.md) §5.1 · [RFC-0004](../../rfcs/RFC-0004-guest-intent-auth-return.md) |
| Modelo de dominio (ER)      | [`docs/02-domain-model.md`](../02-domain-model.md) §2                                                                 |
| Máquinas de estado          | [`docs/02-domain-model.md`](../02-domain-model.md) §4                                                                 |
| Grafo de paquetes y módulos | [`docs/07-module-dependencies.md`](../07-module-dependencies.md)                                                      |
| Fases y roadmap             | [`docs/05-roadmap.md`](../05-roadmap.md)                                                                              |
| Ciclo de vida de un módulo  | [`docs/04-standards.md`](../04-standards.md) §2                                                                       |
| Composición de agentes      | [`docs/10-ai-strategy.md`](../10-ai-strategy.md) §7                                                                   |

## Convenciones

- Etiquetas en español; identificadores de nodo en inglés.
- Paleta coherente: azul = Fase 1, morado = Fase 2+.
- Un diagrama que no cabe en una pantalla es dos diagramas.
- **Si el código cambia y el diagrama no, el diagrama es un bug.**
