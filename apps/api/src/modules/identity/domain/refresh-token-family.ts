import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Familia de refresh tokens: la rotación con detección de reutilización (RFC-0003 §4.3).
 *
 * Es el control de seguridad más importante de la sesión. La idea:
 *
 *   · Cada refresh se usa UNA vez y emite el siguiente de la misma familia.
 *   · Si alguien presenta un refresh YA USADO, hay dos copias del token en circulación:
 *     una es del usuario legítimo y otra de quien lo robó. No se puede saber cuál es
 *     cuál, así que **se revoca la familia entera** y ambos deben autenticarse de nuevo.
 *
 * Sin esto, un token robado vale para siempre y el robo es indetectable.
 *
 * Este archivo vive en `domain/`: cero imports de framework, cero base de datos.
 */

export const TOKEN_STATE = {
  /** Emitido y aún no usado. Es el único que puede rotar. */
  ACTIVE: 'ACTIVE',
  /** Ya se usó para rotar. Presentarlo otra vez indica robo. */
  USED: 'USED',
  /** Revocado por logout o por detección de reutilización. */
  REVOKED: 'REVOKED',
} as const

export type TokenState = (typeof TOKEN_STATE)[keyof typeof TOKEN_STATE]

export type RefreshToken = {
  readonly id: string
  readonly familyId: string
  readonly state: TokenState
  readonly expiresAt: Date
}

export class SessionExpiredError extends DomainError {
  override readonly name = 'SessionExpiredError'

  constructor(reason: string) {
    // Mismo código para expiración y para robo detectado: al cliente le da igual y
    // distinguirlos le diría a un atacante que fue descubierto.
    super('AUTH_SESSION_EXPIRED', reason)
  }
}

export type RotationOutcome =
  | { readonly kind: 'rotated'; readonly familyId: string }
  | { readonly kind: 'reuse_detected'; readonly familyId: string }

/**
 * Decide qué hacer al presentarse un refresh token.
 *
 * Devuelve el resultado en vez de lanzar en el caso de reutilización: quien llama debe
 * **revocar la familia** antes de responder, y un `throw` invitaría a olvidarlo.
 */
export function evaluateRefresh(token: RefreshToken, now: Date): RotationOutcome {
  if (token.state === TOKEN_STATE.REVOKED) {
    throw new SessionExpiredError('El token fue revocado')
  }

  if (token.expiresAt.getTime() <= now.getTime()) {
    throw new SessionExpiredError('El token ha expirado')
  }

  // Un token ya usado en circulación significa que existen dos copias. No se puede
  // saber cuál es la legítima: se revoca todo.
  if (token.state === TOKEN_STATE.USED) {
    return { kind: 'reuse_detected', familyId: token.familyId }
  }

  return { kind: 'rotated', familyId: token.familyId }
}

/** Vida del refresh token. Se calcula desde el momento de emisión, no se hereda. */
export function refreshExpiryFrom(issuedAt: Date, days = 30): Date {
  return new Date(issuedAt.getTime() + days * 24 * 60 * 60 * 1000)
}

/** Vida del access token. Corta a propósito: limita la ventana de un token robado. */
export function accessExpiryFrom(issuedAt: Date, minutes = 15): Date {
  return new Date(issuedAt.getTime() + minutes * 60 * 1000)
}
