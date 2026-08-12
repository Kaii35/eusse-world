import { describe, expect, it } from 'vitest'

import {
  InvalidOneTimeTokenError,
  TOKEN_PURPOSE,
  assertUsableToken,
  emailVerificationExpiryFrom,
  passwordResetExpiryFrom,
  type StoredOneTimeToken,
} from './one-time-token'

const NOW = new Date('2026-08-11T12:00:00.000Z')

function aToken(overrides: Partial<StoredOneTimeToken> = {}): StoredOneTimeToken {
  return {
    id: 'ott-1',
    userId: 'user-1',
    purpose: TOKEN_PURPOSE.PASSWORD_RESET,
    hash: 'sha256:token-1',
    expiresAt: new Date('2026-08-11T12:30:00.000Z'),
    consumedAt: null,
    ...overrides,
  }
}

describe('validación de un token de un solo uso', () => {
  it('debería aceptar uno vigente, sin consumir y del propósito correcto', () => {
    expect(() => {
      assertUsableToken(aToken(), TOKEN_PURPOSE.PASSWORD_RESET, NOW)
    }).not.toThrow()
  })

  it('debería rechazar uno inexistente', () => {
    expect(() => {
      assertUsableToken(null, TOKEN_PURPOSE.PASSWORD_RESET, NOW)
    }).toThrow(InvalidOneTimeTokenError)
  })

  it('debería rechazar uno ya consumido', () => {
    expect(() => {
      assertUsableToken(aToken({ consumedAt: NOW }), TOKEN_PURPOSE.PASSWORD_RESET, NOW)
    }).toThrow(InvalidOneTimeTokenError)
  })

  it('debería rechazar uno caducado, y el borde exacto cuenta como caducado', () => {
    expect(() => {
      assertUsableToken(aToken({ expiresAt: NOW }), TOKEN_PURPOSE.PASSWORD_RESET, NOW)
    }).toThrow(InvalidOneTimeTokenError)
  })

  it('debería rechazar un token de verificación usado para restablecer la contraseña', () => {
    // Sin esta comprobación, interceptar un correo de bienvenida bastaría para tomar la
    // cuenta: los dos tokens viven en la misma tabla.
    expect(() => {
      assertUsableToken(
        aToken({ purpose: TOKEN_PURPOSE.EMAIL_VERIFICATION }),
        TOKEN_PURPOSE.PASSWORD_RESET,
        NOW,
      )
    }).toThrow(InvalidOneTimeTokenError)
  })

  it('debería dar el mismo error y el mismo mensaje en todos los casos', () => {
    // Distinguir "caducado" de "inexistente" convierte el endpoint en un oráculo.
    const rejected = [
      null,
      aToken({ consumedAt: NOW }),
      aToken({ expiresAt: NOW }),
      aToken({ purpose: TOKEN_PURPOSE.EMAIL_VERIFICATION }),
    ]

    const messages = rejected.map((token) => {
      try {
        assertUsableToken(token, TOKEN_PURPOSE.PASSWORD_RESET, NOW)
        return 'sin-error'
      } catch (error) {
        return error instanceof InvalidOneTimeTokenError ? error.message : 'otro'
      }
    })

    expect(new Set(messages).size).toBe(1)
    expect(messages[0]).not.toBe('sin-error')
  })
})

describe('vigencias', () => {
  it('debería dar 1 h al enlace de recuperación', () => {
    expect(passwordResetExpiryFrom(NOW).toISOString()).toBe('2026-08-11T13:00:00.000Z')
  })

  it('debería dar 24 h al enlace de verificación', () => {
    expect(emailVerificationExpiryFrom(NOW).toISOString()).toBe('2026-08-12T12:00:00.000Z')
  })
})
