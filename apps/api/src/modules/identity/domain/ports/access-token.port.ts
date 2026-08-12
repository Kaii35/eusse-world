/**
 * Claims del access token (RFC-0003 §4.2).
 *
 * **No llevan permisos.** Se evalúan en servidor en cada petición para que revocar un
 * permiso tenga efecto inmediato y no dentro de 15 minutos.
 */
export type AccessTokenClaims = {
  /** userId */
  readonly sub: string
  /** sessionId — permite invalidar la sesión en servidor */
  readonly sid: string
  /** activeAccountId. `null` mientras la cuenta esté pendiente de aprobación. */
  readonly acc: string | null
  readonly ten: string
}

export type AccessTokenPort = {
  sign(claims: AccessTokenClaims, expiresAt: Date): Promise<string>
}

export const ACCESS_TOKEN = Symbol('ACCESS_TOKEN')
