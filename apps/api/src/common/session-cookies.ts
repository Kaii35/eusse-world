import type { Env } from '../config/env.schema'
import type { Response } from 'express'

/**
 * Cookies de sesión (ADR-0008). El access y el refresh viajan sólo en cookies httpOnly:
 * ningún script de la página puede leerlos.
 *
 * El prefijo `__Host-` exige `Secure`. En local (`COOKIE_SECURE=false`) no se puede usar,
 * así que el nombre cambia. Es la única bifurcación: el resto de atributos son iguales.
 */
export type SessionCookieNames = { readonly access: string; readonly refresh: string }

export function sessionCookieNames(env: Env): SessionCookieNames {
  const prefix = env.COOKIE_SECURE ? '__Host-' : ''
  return { access: `${prefix}eusse_at`, refresh: `${prefix}eusse_rt` }
}

export function setSessionCookies(
  response: Response,
  env: Env,
  tokens: {
    readonly accessToken: string
    readonly accessExpiresAt: Date
    readonly refreshToken: string
    readonly refreshExpiresAt: Date
  },
): void {
  const names = sessionCookieNames(env)
  const base = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax' as const, path: '/' }
  response.cookie(names.access, tokens.accessToken, { ...base, expires: tokens.accessExpiresAt })
  response.cookie(names.refresh, tokens.refreshToken, { ...base, expires: tokens.refreshExpiresAt })
}

export function clearSessionCookies(response: Response, env: Env): void {
  const names = sessionCookieNames(env)
  const base = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax' as const, path: '/' }
  response.clearCookie(names.access, base)
  response.clearCookie(names.refresh, base)
}

/** Lee una cookie de la cabecera `Cookie`, sin dependencias. */
export function readCookie(header: string | string[] | undefined, name: string): string | null {
  if (typeof header !== 'string') return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}
