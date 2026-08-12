import type { RefreshToken } from '../refresh-token-family'

export type SessionRecord = {
  readonly id: string
  readonly userId: string
  readonly activeAccountId: string | null
  readonly createdAt: Date
  readonly lastSeenAt: Date
  readonly revokedAt: Date | null
}

export type NewSession = {
  readonly id: string
  readonly userId: string
  readonly activeAccountId: string | null
  readonly ip: string | null
  readonly userAgent: string | null
  readonly createdAt: Date
}

export type NewRefreshToken = {
  readonly id: string
  readonly sessionId: string
  readonly familyId: string
  /** Sólo el hash. El valor en claro vive únicamente en la cookie del cliente. */
  readonly hash: string
  readonly expiresAt: Date
  readonly createdAt: Date
}

export type StoredRefreshToken = RefreshToken & {
  readonly sessionId: string
  readonly userId: string
}

export type SessionRepositoryPort = {
  /** Sesión y primer refresh token, en una sola transacción. */
  openSession(session: NewSession, refresh: NewRefreshToken): Promise<void>
  findSession(sessionId: string): Promise<SessionRecord | null>
  findRefreshByHash(hash: string): Promise<StoredRefreshToken | null>
  /**
   * Marca el token presentado como usado y emite el siguiente, atómicamente.
   *
   * Devuelve `false` si el token ya no estaba `ACTIVE` al escribir: dos refresh
   * simultáneos del mismo token llegan aquí a la vez y sólo uno puede ganar. Sin esta
   * comprobación en la escritura, la carrera emite dos familias válidas y la detección de
   * reutilización deja de servir para nada.
   */
  rotate(usedTokenId: string, next: NewRefreshToken, usedAt: Date): Promise<boolean>
  /** Robo detectado: revoca toda la familia y cierra su sesión (RFC-0003 §4.3). */
  revokeFamily(familyId: string, at: Date): Promise<void>
  /** Logout: la sesión deja de valer **en el servidor**, no sólo en la cookie. */
  revokeSession(sessionId: string, at: Date): Promise<void>
  /** Cambio de contraseña: fuera todas las sesiones, incluida la de quien la robó. */
  revokeAllForUser(userId: string, at: Date): Promise<void>
  /** `null` cuando la cuenta deja de estar activa y el usuario no tiene otra. */
  setActiveAccount(sessionId: string, accountId: string | null, at: Date): Promise<void>
}

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY')
