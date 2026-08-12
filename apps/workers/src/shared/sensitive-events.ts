/**
 * Eventos cuyo payload se borra al publicarlos.
 *
 * Resuelve el BLOQUEO abierto en RFC-0013 §4.4: los correos de verificación y de
 * recuperación necesitan el token **en claro** para componer el enlace, así que viaja en
 * el payload del evento. Eso lo dejaría escrito para siempre en `shared.outbox_events`, y
 * RFC-0003 §4.9 exige que de esos tokens sólo se guarde el hash.
 *
 * La fila del outbox se conserva —es la traza de que el evento existió y se publicó—,
 * pero su payload se vacía en el mismo `UPDATE` que la marca `SENT`. El mensaje ya está en
 * la cola con sus datos; el reintento lo hace BullMQ desde ahí, no desde esta fila.
 *
 * Añadir un evento con un secreto en el payload y no añadirlo aquí es un fallo de
 * seguridad, no un descuido de estilo.
 */
export const REDACT_PAYLOAD_ON_SEND: ReadonlySet<string> = new Set([
  'identity.EmailVerificationRequested.v1',
  'identity.PasswordResetRequested.v1',
])

export function redactsPayload(eventType: string): boolean {
  return REDACT_PAYLOAD_ON_SEND.has(eventType)
}

/** Separa los identificadores publicados en los que conservan payload y los que no. */
export function partitionForRedaction(rows: readonly { id: string; type: string }[]): {
  readonly keep: string[]
  readonly redact: string[]
} {
  const keep: string[] = []
  const redact: string[] = []

  for (const row of rows) {
    if (redactsPayload(row.type)) redact.push(row.id)
    else keep.push(row.id)
  }

  return { keep, redact }
}
