# Skill — Arquitectura

## Objetivo

Tomar decisiones estructurales que se sostengan cuando el sistema crezca, el equipo cambie
y el negocio pivote. Documentarlas de modo que dentro de dos años alguien entienda **por
qué** y no sólo **qué**.

## Buenas prácticas

- **Escribe el problema antes que la solución.** Si no puedes enunciar el problema en tres
  frases, todavía no lo entiendes.
- **Evalúa al menos dos alternativas reales.** Una alternativa de paja no cuenta.
- **Documenta lo descartado.** El mayor valor de un ADR es evitar volver a discutirlo.
- **Decide lo último posible, pero no más tarde.** Una decisión postergada es opcionalidad;
  una decisión olvidada es deuda.
- **Optimiza para el cambio, no para la perfección.** Lo que hoy es correcto será
  incorrecto; lo importante es que sea barato de cambiar.
- **Fronteras verificadas por máquina.** Una regla de arquitectura que depende de la
  memoria de la gente no es una regla.
- **Paga el hueco, no la habitación.** Deja el puerto, el evento o la columna. No construyas
  el módulo de Fase 3.
- **Define el criterio de reversión.** ¿Qué métrica nos diría que esta decisión fue mala?

## Errores comunes

| Error                                            | Consecuencia                                                | Qué hacer                                    |
| ------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------- |
| Microservicios por defecto                       | Coste operativo x5, fronteras equivocadas congeladas        | Monolito modular con fronteras verificadas   |
| Abstraer "por si acaso"                          | Complejidad permanente por un futuro que no llega           | Tres repeticiones antes de abstraer          |
| Decidir sin escribirlo                           | Se re-discute cada trimestre                                | ADR, siempre                                 |
| Editar un ADR aceptado                           | Se pierde la historia de por qué se cambió                  | Supersedir con uno nuevo                     |
| Copiar la arquitectura de una empresa 100× mayor | Resuelves problemas que no tienes                           | Diseña para tu escala + un orden de magnitud |
| Diagrama que no coincide con el código           | Nadie vuelve a confiar en la documentación                  | Auditar el grafo real en cada bloque         |
| Dominio acoplado al ORM                          | Cambiar de base de datos exige reescribir reglas de negocio | Dominio puro, adaptadores fuera              |

## Patrones

**Hexagonal (puertos y adaptadores)** — el dominio define lo que necesita; la
infraestructura lo satisface. Permite testear sin red y cambiar proveedor sin tocar reglas.

**Contextos acotados** — la misma palabra significa cosas distintas en sitios distintos.
"Producto" en Catálogo es un concepto comercial; en Inventario es algo que ocupa espacio.
No los unifiques.

**Módulo con `public/`** — sólo esa carpeta es importable desde fuera. Convierte la
disciplina en una regla de lint.

**Outbox transaccional** — el evento se escribe en la misma transacción que el cambio.
Elimina la clase entera de bugs "se guardó pero no se notificó".

**Strangler fig** — para reemplazar algo, se rodea con una fachada, se migra pieza a pieza
y se elimina lo viejo. Nunca _big bang_.

**Decisión reversible vs. irreversible** — las reversibles se toman rápido y solo; las
irreversibles (modelo de datos, autenticación, esquema de eventos) requieren ADR y revisión.

## Antipatrones

- **Big ball of mud**: todo importa todo. Se previene con fronteras en CI, no con buenos
  propósitos.
- **Monolito distribuido**: microservicios que no pueden desplegarse por separado. Lo peor
  de ambos mundos.
- **Modelo de dominio anémico**: entidades que son bolsas de datos con getters, y toda la
  lógica en "servicios". Es programación procedimental con más archivos.
- **God module**: un módulo `shared` o `common` del que depende todo y que crece sin límite.
- **Resume-driven design**: elegir tecnología por interés personal y no por el problema.
- **Arquitectura de PowerPoint**: diagramas bonitos que el código nunca implementó.

## Ejemplos

**Bien — una decisión con criterio de reversión**

> **ADR-0002 — Monolito modular sobre microservicios.**
> Contexto: equipo de 3, dominio B2B aún en descubrimiento.
> Decisión: un despliegue con módulos aislados por `public/` y esquema de base de datos
> propio.
> Descartado: microservicios (coste operativo sin equipo que lo opere), monolito sin
> fronteras (imposible de extraer después).
> **Revisar si:** un módulo necesita escalar por separado con métricas que lo demuestren,
> o el equipo supera 12 personas.

**Mal**

> "Usaremos microservicios porque escalan mejor."
> Sin problema enunciado, sin alternativas, sin criterio de revisión, sin métrica.

## Convenciones

- RFC: `rfcs/RFC-XXXX-<slug-en-ingles>.md`, numeración correlativa, nunca se reutiliza.
- ADR: `adrs/ADR-XXXX-<slug-en-ingles>.md`, estados `Propuesto` → `Aceptado` →
  `Supersedido por ADR-YYYY`.
- Un ADR = una decisión. Si tiene dos, son dos ADR.
- Diagramas en Mermaid, embebidos. Nunca imágenes sin fuente.
- Todo RFC enlaza los ADR que genera, y viceversa.

## Checklist

- [ ] Problema enunciado antes que solución
- [ ] ≥ 2 alternativas con criterios explícitos
- [ ] Lo descartado, escrito, con su motivo
- [ ] Impacto por contexto acotado
- [ ] Contratos, eventos, estados y errores especificados
- [ ] Puertos para todo tercero
- [ ] Estrategia de migración y reversión
- [ ] Riesgos con mitigación verificable
- [ ] Criterio de revisión de la decisión (qué métrica la invalidaría)
- [ ] Qué hueco se deja para fases futuras y qué NO se construye
- [ ] `07-module-dependencies.md` actualizado si cambian fronteras

## Plantillas

[`templates/rfc.md`](../templates/rfc.md) · [`templates/adr.md`](../templates/adr.md) ·
[`templates/domain-model.md`](../templates/domain-model.md) ·
[`templates/event.md`](../templates/event.md)
