# Skill — Gestión de producto

## Objetivo

Construir lo que aporta valor, en el orden que reduce riesgo, sin canjear calidad por
velocidad.

## Buenas prácticas

- **Prioriza por lo que desbloquea.** Identidad antes que catálogo; catálogo antes que
  carrito. La dependencia manda sobre la preferencia.
- **Ataca pronto lo arriesgado y desconocido.** Descubrir un problema en el Sprint 3 es
  barato; en el 11, no.
- **Toda funcionalidad con su métrica de éxito** definida antes de construirla.
- **Recorta alcance, nunca calidad.** Si falta tiempo, se entrega menos funcionalidad
  terminada, no más funcionalidad a medias.
- **Cada elemento del backlog dice problema, usuario y valor esperado.**
- **No añadas a mitad de sprint sin quitar algo equivalente.**
- **Acepta en un entorno real**, no en una demo guiada por quien lo construyó.
- **Ningún salto de puertas.** Si la Puerta D no está, el Sprint 6 no empieza.

## Errores comunes

| Error                                    | Consecuencia                            |
| ---------------------------------------- | --------------------------------------- |
| Priorizar por intuición                  | Se construye lo que no importa          |
| Negociar calidad por fecha               | Deuda que hace cada sprint más lento    |
| Alcance añadido a mitad de sprint        | Nada se termina                         |
| Funcionalidad sin métrica                | Nunca se sabe si funcionó               |
| Aceptar sin la Definition of Done        | La deuda entra en producción            |
| Dejar lo arriesgado para el final        | Se descubre tarde y cuesta el proyecto  |
| Comprometer fechas sin estimación        | Pérdida de credibilidad                 |
| Copiar funcionalidades de la competencia | Se resuelven problemas ajenos           |
| Backlog de 400 elementos                 | Nadie lo lee; la priorización es teatro |

## Patrones

**Criterios de priorización, en orden**

```
1. ¿Desbloquea a otros?           Identidad → catálogo → precios → carrito → checkout
2. ¿Es arriesgado y desconocido?  Atacar pronto para descubrir problemas temprano
3. Valor / coste                  Mayor cociente primero
4. ¿Se encarece con el tiempo?    i18n, accesibilidad y seguridad van antes
5. ¿La deuda frena al equipo?     Si sí, se paga
```

**Elemento de backlog bien formado**

```
Problema:  El comprador tarda 12 min en repetir un pedido porque reconstruye
           el carrito SKU a SKU desde una orden en PDF.
Usuario:   Comprador recurrente (70% del volumen)
Valor:     Reduce el tiempo de recompra a < 90 s → más pedidos digitales
Métrica:   Tiempo mediano de recompra · % de pedidos originados por recompra
Coste:     ~5 días
Depende de: Órdenes (Sprint 9)
```

**Recorte de alcance, no de calidad**

```
❌ "Entregamos el checkout sin tests para llegar a la fecha"
✅ "Entregamos el checkout sin el flujo de aprobación, terminado y probado.
    La aprobación va al sprint siguiente."
```

**Puertas como criterio de avance** — cada bloque tiene una puerta verificable. Se cumple o
se reduce alcance. Nunca se salta.

**Presupuesto de error de fiabilidad** — si se agota el SLO, el sprint siguiente prioriza
fiabilidad. Automático, sin discusión.

## Antipatrones

- **Backlog como lista de deseos** sin priorizar.
- **Métricas de vanidad** (visitas totales) en lugar de métricas de negocio.
- **"Es rápido, ¿lo puedes meter?"** a mitad de sprint.
- **Aceptar en una demo guiada**: siempre funciona en la demo.
- **Roadmap con fechas exactas a 12 meses.**
- **Construir para el usuario que aún no existe** en lugar de para el que ya paga.
- **Deuda técnica pospuesta indefinidamente**: el 20% de capacidad es innegociable.

## Ejemplos

**Bien — decisión de recorte**

> El Sprint 9 no llega con el flujo de aprobación completo.
> **Decisión:** entregamos el checkout sin aprobación por umbral, tras un feature flag.
> Las cuentas con umbral quedan configuradas en 0 (sin aprobación) hasta el Sprint 10.
> **Motivo:** el 85% de los pedidos está por debajo de cualquier umbral; el valor principal
> (pedido digital) se entrega igual.
> **Riesgo aceptado:** las cuentas grandes esperan un sprint. Se les comunica.

**Mal**

> Entregamos todo pero sin E2E ni revisión de seguridad, y lo arreglamos después.

## Convenciones

- Fases y puertas según [`docs/05-roadmap.md`](../docs/05-roadmap.md) y
  [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).
- Sprints de 2 semanas, 80% features / 20% deuda.
- RFC aprobado con un sprint de antelación.
- Definition of Ready antes de entrar a sprint; Definition of Done antes de aceptar.
- Toda deuda aceptada se registra con fecha límite.

## Checklist

- [ ] Cada elemento con problema, usuario y valor escritos
- [ ] Prioridad justificada, no intuitiva
- [ ] Métrica de éxito definida por funcionalidad
- [ ] Definition of Ready cumplida antes del sprint
- [ ] Dependencias identificadas y resueltas
- [ ] Alcance dentro de la capacidad real
- [ ] Riesgos altos atacados pronto
- [ ] 20% de capacidad reservado a deuda
- [ ] Sin alcance añadido a mitad de sprint
- [ ] Aceptación en entorno real
- [ ] Definition of Done verificada antes de aceptar
- [ ] Puertas respetadas
- [ ] El negocio entiende y acepta las prioridades

## Plantillas

[`docs/05-roadmap.md`](../docs/05-roadmap.md) ·
[`docs/11-execution-plan.md`](../docs/11-execution-plan.md) ·
[`checklists/definition-of-done.md`](../checklists/definition-of-done.md)
