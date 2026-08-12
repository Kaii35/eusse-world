import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Token de un solo uso: verificación de email y recuperación de contraseña
 * (RFC-0003 §4.9).
 *
 * Reglas que no se negocian:
 *
 *   · En la base de datos se guarda el **hash**, nunca el token. Una fuga de la tabla no
 *     debe permitir restablecer contraseñas ajenas.
 *   · Un solo uso, con TTL corto.
 *   · Cualquier motivo de rechazo produce **el mismo error**: distinguir "caducado" de
 *     "inexistente" convierte el endpoint en un oráculo.
 *
 * Este archivo vive en `domain/`: cero imports de framework.
 */

export const TOKEN_PURPOSE = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const

export type TokenPurpose = (typeof TOKEN_PURPOSE)[keyof typeof TOKEN_PURPOSE]

export type StoredOneTimeToken = {
  readonly id: string
  readonly userId: string
  readonly purpose: TokenPurpose
  readonly hash: string
  readonly expiresAt: Date
  readonly consumedAt: Date | null
}

export class InvalidOneTimeTokenError extends DomainError {
  override readonly name = 'InvalidOneTimeTokenError'

  constructor() {
    // Mensaje único a propósito. Ver la cabecera del archivo.
    super('COMMON_VALIDATION_FAILED', 'El enlace no es válido o ha caducado. Solicita otro.')
  }
}

/** Vigencia del enlace de recuperación: 1 h (RFC-0003 §4.9). */
export function passwordResetExpiryFrom(issuedAt: Date, minutes = 60): Date {
  return new Date(issuedAt.getTime() + minutes * 60 * 1000)
}

/**
 * Vigencia del enlace de verificación: 24 h.
 *
 * El RFC no fija el valor. 24 h cubre a quien se registra al final de su jornada y abre el
 * correo al día siguiente; el reenvío está siempre disponible.
 */
export function emailVerificationExpiryFrom(issuedAt: Date, hours = 24): Date {
  return new Date(issuedAt.getTime() + hours * 60 * 60 * 1000)
}

/**
 * Valida un token recuperado por su hash.
 *
 * `token` es `null` cuando no existe ninguno con ese hash: se trata igual que uno
 * caducado, para que quien llama no pueda equivocarse y responder distinto.
 */
export function assertUsableToken(
  token: StoredOneTimeToken | null,
  purpose: TokenPurpose,
  now: Date,
): asserts token is StoredOneTimeToken {
  if (!token) throw new InvalidOneTimeTokenError()
  // Un token de verificación no vale para restablecer la contraseña: si valiera, quien
  // interceptase un correo de bienvenida podría tomar la cuenta.
  if (token.purpose !== purpose) throw new InvalidOneTimeTokenError()
  if (token.consumedAt !== null) throw new InvalidOneTimeTokenError()
  if (token.expiresAt.getTime() <= now.getTime()) throw new InvalidOneTimeTokenError()
}
