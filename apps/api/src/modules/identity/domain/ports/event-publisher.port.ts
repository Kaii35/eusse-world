/**
 * Publicación de eventos de dominio (ADR-0014).
 *
 * El adaptador escribe en `shared.outbox_events` **dentro de la misma transacción** que el
 * cambio de estado, y rellena `eventId`, `tenantId` y `correlationId` desde el contexto de
 * la petición. Por eso no aparecen aquí: el caso de uso no los conoce ni debe inventarlos.
 */
export type DomainEventInput = {
  /** `<contexto>.<Agregado><VerboEnPasado>.v<N>` — RFC-0013 §4.3 */
  readonly type: string
  /** Autocontenido: el consumidor no debe volver a preguntarle al emisor. */
  readonly payload: Readonly<Record<string, unknown>>
  readonly occurredAt: Date
}

export type EventPublisherPort = {
  publish(events: readonly DomainEventInput[]): Promise<void>
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER')
