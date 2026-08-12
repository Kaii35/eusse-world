/** Token opaco: el valor viaja al cliente, el hash es lo único que se persiste. */
export type OpaqueToken = {
  readonly value: string
  readonly hash: string
}

/**
 * Generación de secretos y de identificadores.
 *
 * `hashOf` debe ser determinista y sin sal: se usa para **buscar** el token en la base de
 * datos. Es correcto porque el valor es aleatorio de 32 bytes, no una contraseña elegida
 * por una persona: no hay diccionario que atacar.
 */
export type TokenGeneratorPort = {
  /** Refresh tokens y enlaces de un solo uso: 32 bytes de aleatoriedad criptográfica. */
  generate(): OpaqueToken
  hashOf(value: string): string
  /** UUID v7: ordenable por tiempo, como el resto de identificadores del sistema. */
  newId(): string
}

export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR')
