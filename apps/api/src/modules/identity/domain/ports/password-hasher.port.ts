/**
 * Hash de contraseñas (ADR-0008: Argon2id `m=19456, t=2, p=1`).
 *
 * Es un puerto para que los casos de uso se testeen sin gastar 50 ms de Argon2 por
 * aserción, y para poder subir los parámetros de coste sin tocar la lógica.
 */
export type PasswordHasherPort = {
  hash(plain: string): Promise<string>
  verify(hash: string, plain: string): Promise<boolean>
  /**
   * Verifica contra un hash señuelo y descarta el resultado.
   *
   * Se llama cuando el email no existe. Sin esto, un login con email desconocido responde
   * en 2 ms y uno con email real en 50 ms, y esa diferencia **es** el oráculo de
   * enumeración que las respuestas uniformes intentan cerrar (RFC-0003 §4.9).
   */
  fakeVerify(): Promise<void>
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')
