import type { StoredOneTimeToken, TokenPurpose } from '../one-time-token'

export type OneTimeTokenRepositoryPort = {
  create(token: StoredOneTimeToken): Promise<void>
  findByHash(hash: string): Promise<StoredOneTimeToken | null>
  /**
   * Marca el token como consumido.
   *
   * Devuelve `false` si ya lo estaba. La comprobación tiene que ocurrir **en la escritura**
   * (`UPDATE ... WHERE consumed_at IS NULL`): si sólo se validara antes, dos peticiones
   * simultáneas con el mismo enlace pasarían ambas la validación y ambas cambiarían la
   * contraseña.
   */
  consume(tokenId: string, at: Date): Promise<boolean>
  /** Al emitir uno nuevo, los anteriores del mismo propósito dejan de valer. */
  invalidateAllFor(userId: string, purpose: TokenPurpose, at: Date): Promise<void>
}

export const ONE_TIME_TOKEN_REPOSITORY = Symbol('ONE_TIME_TOKEN_REPOSITORY')
