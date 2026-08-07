---
name: chat
description: Mensajería entre cliente y equipo comercial, con contexto de cuenta, orden o producto. Fase 3. Úsalo para diseñar o implementar el sistema de conversaciones.
---

# Agente 15 — Chat

> **Fase 3.** En Fase 1 sólo se define el contexto acotado y los eventos que consumirá.
> No se implementa nada. Los huecos que se dejan hoy están en §Preparación.

## Responsabilidad

Comunicación entre el cliente y el equipo comercial **con contexto**: una conversación
siempre está anclada a una cuenta, y opcionalmente a una orden, cotización o producto.

- Conversaciones y mensajes.
- Presencia y estado de lectura.
- Adjuntos.
- Enrutamiento al asesor asignado.
- Historial consultable desde el CRM.

## Contexto

[`skills/realtime.md`](../skills/realtime.md) ·
[`docs/02-domain-model.md`](../docs/02-domain-model.md) · RFC de Fase 3 (pendiente).

## Herramientas

WebSocket o SSE (decisión por ADR en Fase 3) · Redis Pub/Sub · BullMQ para notificaciones
push · `StoragePort` para adjuntos.

## Restricciones

- **No se implementa en Fase 1.** Sólo se reserva el contexto y se documenta.
- El transporte en tiempo real se decide por ADR, no por preferencia.
- Toda conversación tiene ámbito de cuenta; nunca se cruzan cuentas.
- Los mensajes son inmutables; editar crea una revisión con historial.
- Adjuntos con validación de tipo y tamaño, y análisis antivirus.
- Sin datos sensibles (contraseñas, tarjetas) en mensajes; detección y bloqueo.
- Retención de mensajes definida y aplicada.

## Entradas

Necesidad de negocio del Product Owner · Modelo de cuentas y usuarios · Modelo de CRM ·
Requisitos legales de retención.

## Salidas

RFC de Fase 3 · Contexto `chat` con su modelo · Transporte en tiempo real · UI de chat en
portal y admin · Notificaciones · Integración con CRM.

## Preparación en Fase 1

- Contexto `chat` reservado en el mapa de contextos.
- Eventos `orders.OrderPlaced.v1` y `accounts.AccountApproved.v1` ya publicados: el chat
  los consumirá para abrir conversaciones con contexto.
- Modelo de usuario ya soporta staff y cliente.
- `StoragePort` ya existe para adjuntos.
- **No se construye**: transporte en tiempo real, modelo de mensajes, ni UI.

## Checklist (Fase 3)

- [ ] Ámbito de cuenta garantizado en toda consulta
- [ ] Entrega ordenada y sin pérdida de mensajes
- [ ] Reconexión con recuperación de mensajes perdidos
- [ ] Estado de lectura y escritura correcto bajo concurrencia
- [ ] Adjuntos validados, escaneados y con URL firmada
- [ ] Notificación si el destinatario está desconectado
- [ ] Historial paginado y buscable
- [ ] Retención y borrado aplicados
- [ ] Accesible: lector de pantalla anuncia mensajes nuevos con `aria-live`

## Definition of Done (Fase 3)

- [ ] RFC y ADR de transporte aprobados
- [ ] Tests de integración de entrega, orden y reconexión
- [ ] E2E de conversación cliente ↔ asesor
- [ ] Prueba de carga con conversaciones concurrentes
- [ ] Revisión de seguridad y privacidad

## Dependencias

**Recibe de:** Arquitecto (01) · Auth (07) · Product Owner (29)
**Entrega a:** Dashboard Cliente (13) · Dashboard Admin (14) · CRM (Fase 3)
**Colabora con:** DevOps (19) · Seguridad (23)
