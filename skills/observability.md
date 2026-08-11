# Skill — Observabilidad

## Objetivo

Poder responder "¿qué está pasando y por qué?" en producción **sin desplegar código
nuevo**.

## Buenas prácticas

- **Logs estructurados en JSON**, nunca prosa concatenada. Un log que no se puede consultar
  no sirve.
- **`correlationId` desde el borde**, propagado a través de web → api → worker → tercero.
  Es lo que convierte 40 logs sueltos en una historia.
- **Un span por caso de uso y por consulta a base de datos.**
- **Métricas RED** (Rate, Errors, Duration) por endpoint y por handler de cola.
- **Errores agrupados por código de dominio**, no por stack trace.
- **Alerta sobre síntomas**: "los pedidos fallan", no "la CPU está al 80%".
- **SLO explícitos** con presupuesto de error. Si se agota, el sprint pasa a fiabilidad.
- **Nunca datos personales ni secretos en logs.** Ni emails completos, ni tokens, ni
  tarjetas.

## Errores comunes

| Error                                                | Consecuencia                                      |
| ---------------------------------------------------- | ------------------------------------------------- |
| `console.log` en producción                          | Imposible de consultar y correlacionar            |
| Log sin contexto ("Error al guardar")                | Inútil: ¿qué? ¿de quién? ¿cuándo?                 |
| Sin `correlationId`                                  | No se puede seguir una petición entre servicios   |
| Datos personales en logs                             | Incumplimiento normativo                          |
| Alertas por causa                                    | Ruido; se ignoran                                 |
| Alertar de todo                                      | Fatiga; se pierde la que importaba                |
| Métricas sin dimensiones                             | No se puede segmentar por endpoint o cuenta       |
| Trazas sólo en la API                                | El cuello de botella está en el worker y no se ve |
| Log de nivel `error` para casos de negocio esperados | Ruido que oculta errores reales                   |
| Sin dashboard por contexto                           | Nadie sabe si su módulo está sano                 |

## Patrones

**Log estructurado**

```
logger.info({
  event: 'order.placed',
  correlationId: ctx.correlationId,
  accountId: order.accountId,          // ID, no nombre ni email
  orderId: order.id,
  orderNumber: order.orderNumber,
  lineCount: order.lines.length,
  totalAmount: order.total.amount,
  totalCurrency: order.total.currency,
  durationMs: timer.elapsed(),
})
```

Consultable, correlacionable, sin datos personales.

**Propagación del `correlationId`**

```
Navegador → header X-Correlation-Id (o generado en el borde)
  → interceptor de NestJS lo pone en el contexto de la petición
  → viaja en el payload del evento
  → el worker lo restaura en su contexto
  → se envía al tercero como header
```

**Niveles con criterio**

| Nivel   | Cuándo                                                     |
| ------- | ---------------------------------------------------------- |
| `error` | Fallo inesperado que requiere intervención                 |
| `warn`  | Degradación o comportamiento anómalo recuperable           |
| `info`  | Hecho de negocio relevante (orden creada, cuenta aprobada) |
| `debug` | Detalle de diagnóstico, apagado en producción              |

Un `CART_QTY_BELOW_MINIMUM` es `info`, no `error`: el sistema funcionó como debía.

**SLO con presupuesto de error**

```
Disponibilidad 99.5% mensual → 3 h 39 min de presupuesto
p95 lectura < 200 ms · p95 escritura < 500 ms · tasa de error < 0.5%
Si el presupuesto se agota → el sprint siguiente prioriza fiabilidad
```

**Alertas útiles**

```
✅ "La tasa de error de POST /checkout/confirm supera el 2% durante 5 min"
✅ "La cola notifications tiene mensajes de más de 10 min"
✅ "El outbox tiene pendientes de más de 5 min"
❌ "CPU al 80%"          — puede ser normal
❌ "Se produjo un error" — sin umbral, puro ruido
```

## Antipatrones

- **Loggear todo "por si acaso"**: coste alto y señal enterrada en ruido.
- **`console.log` con `JSON.stringify` de objetos enormes.**
- **Alertas sin dueño ni runbook.**
- **Dashboards que nadie mira**: si no se usa, se borra.
- **Trazar sólo el camino feliz.**
- **Métricas de vanidad** (peticiones totales) sin desglose por endpoint.

## Convenciones

- Logger de `@eusse/observability`, nunca `console`.
- Campo `event` con nombre estable: `<contexto>.<acción>`.
- IDs en los logs, nunca datos personales.
- Trazas con OpenTelemetry; span por caso de uso, consulta y llamada externa.
- Métricas con etiquetas: `endpoint`, `status`, `module`.
- Un dashboard por contexto acotado.
- Toda alerta con dueño, umbral justificado y runbook enlazado.

## Checklist

- [ ] Logs estructurados JSON; sin `console.log`
- [ ] `correlationId` en toda la cadena
- [ ] Sin datos personales ni secretos en logs
- [ ] Niveles usados con criterio
- [ ] Span por caso de uso y por consulta
- [ ] Métricas RED por endpoint y por cola
- [ ] Errores agrupados por código de dominio
- [ ] SLO definidos con presupuesto de error
- [ ] Alertas por síntoma, con umbral justificado
- [ ] Toda alerta con dueño y runbook
- [ ] Dashboard por contexto acotado
- [ ] Métrica de profundidad y antigüedad de colas
- [ ] Alerta si el outbox acumula pendientes
- [ ] Retención de logs definida

## Plantillas

[`checklists/incident.md`](../checklists/incident.md) ·
[`skills/devops.md`](devops.md)
