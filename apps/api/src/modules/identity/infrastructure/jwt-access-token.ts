import { Inject, Injectable } from '@nestjs/common'
import { SignJWT } from 'jose'

import { ENV } from '../../../config/config.module'

import type { Env } from '../../../config/env.schema'
import type { AccessTokenClaims, AccessTokenPort } from '../domain/ports/access-token.port'

/**
 * Access token JWT (ADR-0008).
 *
 * **HS256 y el secreto sólo en la API.** No hay verificación en el BFF de Next: el
 * frontend no valida tokens, pregunta a la API. Repartir el secreto entre procesos para
 * ahorrarse una llamada multiplica los sitios desde los que se puede filtrar.
 *
 * Los permisos NO van dentro. Se evalúan en servidor en cada petición (RFC-0003 §4.2).
 */
@Injectable()
export class JwtAccessToken implements AccessTokenPort {
  private readonly secret: Uint8Array

  constructor(@Inject(ENV) env: Env) {
    this.secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
  }

  sign(claims: AccessTokenClaims, expiresAt: Date): Promise<string> {
    return (
      new SignJWT({ sid: claims.sid, acc: claims.acc, ten: claims.ten })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(claims.sub)
        .setIssuedAt()
        // En segundos: el `exp` de JWT no admite milisegundos.
        .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
        .sign(this.secret)
    )
  }
}
