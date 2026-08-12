/**
 * Colas por dominio de trabajo, no una cola gigante (ADR-0007).
 *
 * Permite escalar cada una por separado y priorizar: el correo de confirmación de un
 * pedido va antes que la reindexación del catálogo.
 */
export const QUEUE = {
  NOTIFICATIONS: 'notifications',
  SEARCH_INDEX: 'search-index',
  REPORTS: 'reports',
  CLEANUP: 'cleanup',
} as const

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE]

/**
 * Ruta cada tipo de evento a su cola.
 *
 * Un evento sin entrada aquí va a `notifications`: es preferible entregarlo a la cola
 * equivocada que perderlo en silencio.
 */
export const QUEUE_FOR_EVENT: Readonly<Record<string, QueueName>> = {
  'identity.UserRegistered.v1': QUEUE.NOTIFICATIONS,
  'identity.EmailVerificationRequested.v1': QUEUE.NOTIFICATIONS,
  'identity.PasswordResetRequested.v1': QUEUE.NOTIFICATIONS,
  'identity.PasswordChanged.v1': QUEUE.NOTIFICATIONS,
  'accounts.AccountApproved.v1': QUEUE.NOTIFICATIONS,
  'accounts.AccountRejected.v1': QUEUE.NOTIFICATIONS,
  'catalog.ProductPublished.v1': QUEUE.SEARCH_INDEX,
  'pricing.VariantPriceChanged.v1': QUEUE.NOTIFICATIONS,
  'cart.CartAbandoned.v1': QUEUE.NOTIFICATIONS,
  'orders.OrderPlaced.v1': QUEUE.NOTIFICATIONS,
  'orders.OrderApproved.v1': QUEUE.NOTIFICATIONS,
  'orders.OrderCancelled.v1': QUEUE.NOTIFICATIONS,
  'orders.OrderShipped.v1': QUEUE.NOTIFICATIONS,
  'content.LeadCaptured.v1': QUEUE.NOTIFICATIONS,
}
