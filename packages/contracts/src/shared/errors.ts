import { z } from 'zod'

/**
 * Catálogo de errores de dominio (docs/02-domain-model.md §6).
 *
 * REGLA: el frontend reacciona al `code`, NUNCA al texto de `detail`.
 * El texto es localizable y puede cambiar; el código es un contrato.
 *
 * Añadir un código aquí obliga a añadir su mapeo HTTP en `ERROR_STATUS`.
 */
export const ERROR_CODE = {
  // --- Autenticación e identidad ---
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_RATE_LIMITED: 'AUTH_RATE_LIMITED',
  AUTH_INTENT_INVALID_SIGNATURE: 'AUTH_INTENT_INVALID_SIGNATURE',
  AUTH_INTENT_ALREADY_USED: 'AUTH_INTENT_ALREADY_USED',

  // --- Cuentas ---
  ACCOUNT_NOT_ACTIVE: 'ACCOUNT_NOT_ACTIVE',
  ACCOUNT_CREDIT_EXCEEDED: 'ACCOUNT_CREDIT_EXCEEDED',

  // --- Catálogo ---
  CATALOG_VARIANT_NOT_FOUND: 'CATALOG_VARIANT_NOT_FOUND',
  CATALOG_VARIANT_NOT_VISIBLE: 'CATALOG_VARIANT_NOT_VISIBLE',
  CATALOG_INVALID_SKU: 'CATALOG_INVALID_SKU',

  // --- Precios ---
  PRICING_NO_PRICE_FOR_ACCOUNT: 'PRICING_NO_PRICE_FOR_ACCOUNT',
  PRICING_AMBIGUOUS_PRICE_LIST: 'PRICING_AMBIGUOUS_PRICE_LIST',
  PRICING_PRICE_CHANGED: 'PRICING_PRICE_CHANGED',

  // --- Carrito ---
  CART_QTY_BELOW_MINIMUM: 'CART_QTY_BELOW_MINIMUM',
  CART_QTY_NOT_MULTIPLE: 'CART_QTY_NOT_MULTIPLE',
  CART_EMPTY: 'CART_EMPTY',

  // --- Checkout y órdenes ---
  CHECKOUT_APPROVAL_REQUIRED: 'CHECKOUT_APPROVAL_REQUIRED',
  CHECKOUT_BELOW_MIN_ORDER: 'CHECKOUT_BELOW_MIN_ORDER',
  ORDER_INVALID_TRANSITION: 'ORDER_INVALID_TRANSITION',

  // --- Transversales ---
  COMMON_VALIDATION_FAILED: 'COMMON_VALIDATION_FAILED',
  COMMON_IDEMPOTENCY_CONFLICT: 'COMMON_IDEMPOTENCY_CONFLICT',
  COMMON_RATE_LIMITED: 'COMMON_RATE_LIMITED',
  COMMON_NOT_FOUND: 'COMMON_NOT_FOUND',
  COMMON_INTERNAL_ERROR: 'COMMON_INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE]

/**
 * Mapeo fijo código → HTTP.
 *
 * Nótese que `CATALOG_VARIANT_NOT_VISIBLE` es 403 sólo cuando el recurso es público
 * pero restringido. Para aislamiento entre CUENTAS se devuelve 404, no 403: un 403
 * confirmaría la existencia del recurso (skills/security.md).
 */
export const ERROR_STATUS: Record<ErrorCode, number> = {
  AUTH_INVALID_CREDENTIALS: 401,
  AUTH_SESSION_EXPIRED: 401,
  AUTH_FORBIDDEN: 403,
  AUTH_EMAIL_NOT_VERIFIED: 403,
  AUTH_RATE_LIMITED: 429,
  AUTH_INTENT_INVALID_SIGNATURE: 400,
  AUTH_INTENT_ALREADY_USED: 409,

  ACCOUNT_NOT_ACTIVE: 403,
  ACCOUNT_CREDIT_EXCEEDED: 422,

  CATALOG_VARIANT_NOT_FOUND: 404,
  CATALOG_VARIANT_NOT_VISIBLE: 403,
  CATALOG_INVALID_SKU: 400,

  PRICING_NO_PRICE_FOR_ACCOUNT: 422,
  PRICING_AMBIGUOUS_PRICE_LIST: 500,
  PRICING_PRICE_CHANGED: 409,

  CART_QTY_BELOW_MINIMUM: 422,
  CART_QTY_NOT_MULTIPLE: 422,
  CART_EMPTY: 422,

  CHECKOUT_APPROVAL_REQUIRED: 202,
  CHECKOUT_BELOW_MIN_ORDER: 422,
  ORDER_INVALID_TRANSITION: 409,

  COMMON_VALIDATION_FAILED: 400,
  COMMON_IDEMPOTENCY_CONFLICT: 409,
  COMMON_RATE_LIMITED: 429,
  COMMON_NOT_FOUND: 404,
  COMMON_INTERNAL_ERROR: 500,
}

export const errorCodeSchema = z.enum(Object.values(ERROR_CODE) as [ErrorCode, ...ErrorCode[]])

/**
 * Respuesta de error uniforme, en formato RFC 7807 (*problem+json*) extendido
 * (RFC-0012 §4.4).
 *
 * `meta` lleva los datos que el frontend necesita para componer un mensaje útil
 * sin analizar prosa: "Se vende en cajas de 6" en lugar de "Valor inválido".
 */
export const problemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  code: errorCodeSchema,
  detail: z.string(),
  instance: z.string(),
  correlationId: z.string(),
  meta: z.record(z.unknown()).optional(),
})

export type ProblemDetails = z.infer<typeof problemDetailsSchema>

export const ERROR_TYPE_BASE_URL = 'https://api.eusse.world/errors'

/** Convierte un código a su URI de documentación: `CART_QTY_NOT_MULTIPLE` → `.../cart-qty-not-multiple`. */
export function errorTypeUri(code: ErrorCode): string {
  return `${ERROR_TYPE_BASE_URL}/${code.toLowerCase().replaceAll('_', '-')}`
}
