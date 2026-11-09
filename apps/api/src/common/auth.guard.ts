import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { jwtVerify } from 'jose'

import { ENV } from '../config/config.module'
import { DomainError } from '../shared-kernel/domain/domain-error'

import { readCookie, sessionCookieNames } from './session-cookies'

import type { Env } from '../config/env.schema'

/** Identidad de la petición, extraída de un access token verificado. Nunca del cliente. */
export type AuthContext = {
  readonly userId: string
  readonly sessionId: string
  readonly accountId: string | null
}

export type AuthedRequest = {
  headers: Record<string, string | string[] | undefined>
  auth?: AuthContext
}

/**
 * Verifica el access token (ADR-0008) y deja la identidad en `request.auth`.
 *
 * Límites conocidos (corregir en B6):
 *   · Sólo acepta `Authorization: Bearer`. Las cookies httpOnly `__Host-` llegan en B6.
 *   · No consulta la sesión en base de datos: un token vale hasta su `exp` (15 min), aunque
 *     se haya cerrado la sesión. Aceptable sólo como estado transitorio.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly secret: Uint8Array

  constructor(@Inject(ENV) private readonly env: Env) {
    this.secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>()
    const token =
      bearerToken(request.headers.authorization) ??
      readCookie(request.headers.cookie, sessionCookieNames(this.env).access)
    if (!token) throw unauthorized()

    try {
      const { payload } = await jwtVerify(token, this.secret, { algorithms: ['HS256'] })
      if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
        throw unauthorized()
      }
      if (payload.ten !== this.env.TENANT_ID) throw unauthorized()

      request.auth = {
        userId: payload.sub,
        sessionId: payload.sid,
        accountId: typeof payload.acc === 'string' ? payload.acc : null,
      }
      return true
    } catch {
      throw unauthorized()
    }
  }
}

function bearerToken(header: string | string[] | undefined): string | null {
  if (typeof header !== 'string') return null
  const match = /^Bearer (.+)$/.exec(header)
  return match?.[1] ?? null
}

function unauthorized(): DomainError {
  return new DomainError('AUTH_SESSION_EXPIRED', 'Inicia sesión para continuar')
}

/** Usuario de la petición. Sólo válido después de `AuthGuard`, que garantiza `request.auth`. */
export function userIdOf(request: AuthedRequest): string {
  if (!request.auth) throw new Error('AuthGuard no se ejecutó sobre esta ruta')
  return request.auth.userId
}
