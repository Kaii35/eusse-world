# Skill — Tiempo real

> **Fase 3.** En Fase 1 no se implementa nada. Esta skill existe para que la decisión, cuando
> llegue, no se improvise.

## Objetivo

Comunicación en vivo (chat con el asesor, notificaciones push en la interfaz) sin perder
mensajes, sin duplicarlos y sin abrir un agujero de escalabilidad.

## Buenas prácticas

- **Elige el transporte más simple que resuelva el problema.** SSE basta para
  notificaciones unidireccionales; WebSocket sólo si hace falta bidireccionalidad real.
- **La conexión se cae. Siempre.** Diseña la reconexión con recuperación de lo perdido
  desde el primer día.
- **Cursor de mensajes**, no "envíame lo nuevo": al reconectar, el cliente pide desde el
  último ID que tiene.
- **El servidor es la fuente de verdad del orden.** El cliente no ordena por reloj local.
- **Ámbito de cuenta en toda suscripción.** Un canal mal delimitado es una fuga de datos.
- **Los mensajes son inmutables.** Editar crea una revisión con historial.
- **Limita el número de conexiones por usuario** y aplica límite de frecuencia.

## Errores comunes

| Error                                          | Consecuencia                                        |
| ---------------------------------------------- | --------------------------------------------------- |
| Asumir conexión estable                        | Mensajes perdidos en cada cambio de red             |
| Sin recuperación al reconectar                 | Huecos en la conversación                           |
| Ordenar por hora del cliente                   | Mensajes desordenados entre dispositivos            |
| Canal sin ámbito de cuenta                     | Un cliente recibe mensajes de otro                  |
| Estado sólo en memoria del servidor            | Se pierde al reiniciar; no escala a varias réplicas |
| WebSocket para notificaciones unidireccionales | Complejidad innecesaria                             |
| Sin límite de conexiones                       | Un cliente agota los recursos                       |
| Adjuntos sin validar                           | Vector de malware                                   |
| Sin política de retención                      | Crecimiento sin control y riesgo legal              |

## Patrones

**Elección de transporte**

| Necesidad                              | Transporte                                          |
| -------------------------------------- | --------------------------------------------------- |
| Notificaciones del servidor al cliente | **SSE** — simple, reconexión nativa, sobre HTTP     |
| Chat bidireccional con presencia       | **WebSocket**                                       |
| Actualización cada varios segundos     | **Sondeo** con TanStack Query — a menudo suficiente |

Empezar por lo simple. Escalar el transporte sólo cuando el sondeo demuestre no bastar.

**Reconexión con recuperación**

```
Cliente guarda lastMessageId
Al reconectar: GET /conversations/:id/messages?after=<lastMessageId>
Servidor devuelve lo perdido; sólo entonces se reanuda el flujo en vivo
```

**Distribución entre réplicas** — con varias instancias de API, un mensaje debe llegar a
todas: Redis Pub/Sub distribuye y cada instancia entrega a sus conexiones.

**Deduplicación en el cliente** — por `messageId`: el mismo mensaje puede llegar por
recuperación y por flujo en vivo.

**Presencia con TTL** — la presencia se guarda en Redis con expiración; un cliente que
desaparece deja de figurar solo, sin necesidad de desconexión limpia.

## Antipatrones

- **WebSocket para todo**, incluido lo que un sondeo cada 30 s resolvería.
- **Estado de conexión en memoria** con varias réplicas.
- **Confiar en el evento de desconexión**: no siempre llega.
- **Enviar el historial completo al conectar.**
- **Reconexión sin retroceso exponencial**: tormenta de reconexiones tras una caída.
- **Lógica de negocio en el handler del socket.**

## Convenciones (a confirmar por ADR en Fase 3)

- Canales: `account:<accountId>:conversations`.
- Mensajes con ID ordenable (UUID v7) y `sentAt` del servidor.
- Adjuntos por `StoragePort`, con validación de tipo real y análisis antivirus.
- Retención definida por política y aplicada por job.
- Autorización del canal verificada al suscribirse **y** en cada mensaje.

## Checklist (Fase 3)

- [ ] ADR de transporte escrito y aprobado
- [ ] Ámbito de cuenta en toda suscripción
- [ ] Autorización verificada al suscribirse y por mensaje
- [ ] Reconexión con recuperación por cursor
- [ ] Deduplicación por `messageId` en el cliente
- [ ] Orden determinado por el servidor
- [ ] Funciona con varias réplicas (Redis Pub/Sub)
- [ ] Presencia con TTL
- [ ] Límite de conexiones y de frecuencia por usuario
- [ ] Adjuntos validados y escaneados
- [ ] Notificación si el destinatario está desconectado
- [ ] Historial paginado y buscable
- [ ] Retención aplicada
- [ ] Accesible: mensajes nuevos anunciados con `aria-live`
- [ ] Prueba de carga con conversaciones concurrentes

## Plantillas

[`agents/15-chat.md`](../agents/15-chat.md) ·
[`skills/events-messaging.md`](events-messaging.md)
