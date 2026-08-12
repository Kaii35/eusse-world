import { Injectable, Logger } from '@nestjs/common'
import { hash, verify } from '@node-rs/argon2'

import type { PasswordHasherPort } from '../domain/ports/password-hasher.port'

/**
 * Argon2id con los parámetros de ADR-0008: `m=19456, t=2, p=1`.
 *
 * Son los mínimos recomendados por OWASP. Subirlos es una decisión de operación, no de
 * código: aquí sólo se cambian estas tres constantes y los hashes antiguos siguen
 * validando, porque Argon2 guarda sus parámetros dentro del propio hash.
 */
const OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const

/**
 * Hash señuelo, calculado una vez al arrancar.
 *
 * Se usa cuando el email no existe, para que la respuesta tarde lo mismo que con un email
 * real. Sin esto, un login con email desconocido responde en microsegundos y uno con email
 * real en decenas de milisegundos: esa diferencia identifica qué correos están
 * registrados, y las respuestas uniformes dejan de servir de nada.
 */
const DECOY_PASSWORD = 'contrasena-senuelo-que-nadie-usa'

@Injectable()
export class Argon2PasswordHasher implements PasswordHasherPort {
  private readonly logger = new Logger(Argon2PasswordHasher.name)
  private decoyHash: string | undefined

  hash(plain: string): Promise<string> {
    return hash(plain, OPTIONS)
  }

  async verify(storedHash: string, plain: string): Promise<boolean> {
    try {
      return await verify(storedHash, plain, OPTIONS)
    } catch (error) {
      // Un hash corrupto o de otro algoritmo no es un 500: es una credencial que no
      // valida. Se registra porque significa que algo escribió mal en la tabla.
      this.logger.warn({
        event: 'auth.hash_verify_failed',
        error: error instanceof Error ? error.message : 'unknown',
      })
      return false
    }
  }

  async fakeVerify(): Promise<void> {
    this.decoyHash ??= await hash(DECOY_PASSWORD, OPTIONS)
    await verify(this.decoyHash, 'lo-que-sea', OPTIONS).catch(() => false)
  }
}
