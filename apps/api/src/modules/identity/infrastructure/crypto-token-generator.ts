import { createHash, randomBytes, randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import type { OpaqueToken, TokenGeneratorPort } from '../domain/ports/token-generator.port'

/**
 * Tokens opacos y hashes de búsqueda.
 *
 * **SHA-256 sin sal, y es correcto.** Estos valores son 32 bytes de aleatoriedad
 * criptográfica, no contraseñas elegidas por personas: no hay diccionario que probar, así
 * que la sal no aporta nada y sí impediría buscar el token por su hash, que es justo lo
 * que hace falta. Para contraseñas la respuesta es la contraria: Argon2id.
 *
 * `base64url` en vez de hex: la mitad de longitud para la misma entropía, y va en una URL
 * sin escapar nada.
 */
const TOKEN_BYTES = 32

@Injectable()
export class CryptoTokenGenerator implements TokenGeneratorPort {
  generate(): OpaqueToken {
    const value = randomBytes(TOKEN_BYTES).toString('base64url')
    return { value, hash: this.hashOf(value) }
  }

  hashOf(value: string): string {
    return createHash('sha256').update(value).digest('hex')
  }

  /**
   * UUID v7 en cuanto Node lo ofrezca; v4 mientras tanto.
   *
   * Para claves primarias la diferencia importa —v7 es ordenable en el tiempo y no
   * fragmenta el índice—, así que las filas que Prisma genera por defecto siguen usando
   * `shared.uuid_generate_v7()`. Aquí los ids se generan en la aplicación porque el caso
   * de uso los necesita antes de escribir.
   */
  newId(): string {
    return randomUUID()
  }
}
