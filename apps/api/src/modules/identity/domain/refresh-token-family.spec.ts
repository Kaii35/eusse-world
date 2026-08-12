import { describe, expect, it } from 'vitest'

import {
  SessionExpiredError,
  TOKEN_STATE,
  accessExpiryFrom,
  evaluateRefresh,
  refreshExpiryFrom,
  type RefreshToken,
} from './refresh-token-family'

const NOW = new Date('2026-08-11T12:00:00.000Z')

function token(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    id: 'token-1',
    familyId: 'family-1',
    state: TOKEN_STATE.ACTIVE,
    expiresAt: new Date('2026-09-10T12:00:00.000Z'),
    ...overrides,
  }
}

describe('rotación de refresh tokens', () => {
  it('debería rotar un token activo y vigente', () => {
    expect(evaluateRefresh(token(), NOW)).toEqual({ kind: 'rotated', familyId: 'family-1' })
  })

  it('debería rechazar un token revocado', () => {
    expect(() => evaluateRefresh(token({ state: TOKEN_STATE.REVOKED }), NOW)).toThrow(
      SessionExpiredError,
    )
  })

  it('debería rechazar un token expirado', () => {
    const expired = token({ expiresAt: new Date('2026-08-11T11:59:59.000Z') })
    expect(() => evaluateRefresh(expired, NOW)).toThrow(SessionExpiredError)
  })

  it('debería rechazar un token que expira exactamente ahora', () => {
    // El borde importa: `<=`, no `<`. Un token que expira este instante no vale.
    const expiring = token({ expiresAt: NOW })
    expect(() => evaluateRefresh(expiring, NOW)).toThrow(SessionExpiredError)
  })

  describe('detección de reutilización — el control de seguridad clave', () => {
    it('debería señalar reutilización cuando el token ya se usó', () => {
      // Dos copias del token en circulación: una del usuario, otra de quien lo robó.
      const outcome = evaluateRefresh(token({ state: TOKEN_STATE.USED }), NOW)

      expect(outcome).toEqual({ kind: 'reuse_detected', familyId: 'family-1' })
    })

    it('debería devolver el resultado en vez de lanzar, para que se revoque la familia', () => {
      // Si lanzara, quien llama podría responder 401 y OLVIDAR revocar la familia,
      // dejando al atacante dentro.
      expect(() => evaluateRefresh(token({ state: TOKEN_STATE.USED }), NOW)).not.toThrow()
    })

    it('debería identificar la familia a revocar', () => {
      const outcome = evaluateRefresh(
        token({ state: TOKEN_STATE.USED, familyId: 'family-robada' }),
        NOW,
      )

      expect(outcome.familyId).toBe('family-robada')
    })

    it('debería priorizar la revocación sobre la reutilización', () => {
      // Si la familia ya se revocó por un robo anterior, la respuesta es la misma que
      // para cualquier sesión inválida: no se le confirma nada al atacante.
      const revoked = token({ state: TOKEN_STATE.REVOKED })
      expect(() => evaluateRefresh(revoked, NOW)).toThrow(SessionExpiredError)
    })
  })

  it('debería usar el mismo código de error para expiración y revocación', () => {
    // Distinguirlos le diría a un atacante que fue descubierto.
    const expired = token({ expiresAt: new Date('2026-01-01T00:00:00.000Z') })
    const revoked = token({ state: TOKEN_STATE.REVOKED })

    const codes = [expired, revoked].map((t) => {
      try {
        evaluateRefresh(t, NOW)
        return 'sin-error'
      } catch (error) {
        return error instanceof SessionExpiredError ? error.code : 'otro'
      }
    })

    expect(codes).toEqual(['AUTH_SESSION_EXPIRED', 'AUTH_SESSION_EXPIRED'])
  })
})

describe('vigencias', () => {
  it('debería dar 30 días al refresh token', () => {
    expect(refreshExpiryFrom(NOW).toISOString()).toBe('2026-09-10T12:00:00.000Z')
  })

  it('debería dar 15 minutos al access token', () => {
    // Corta a propósito: limita la ventana de un token robado.
    expect(accessExpiryFrom(NOW).toISOString()).toBe('2026-08-11T12:15:00.000Z')
  })

  it('debería calcular la vigencia desde la emisión, no heredarla', () => {
    // Al rotar, el token nuevo NO hereda la caducidad del anterior: si lo hiciera, una
    // sesión activa se cortaría a los 30 días del primer login.
    const rotatedAt = new Date('2026-09-01T12:00:00.000Z')
    expect(refreshExpiryFrom(rotatedAt).toISOString()).toBe('2026-10-01T12:00:00.000Z')
  })
})
