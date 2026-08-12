import { describe, expect, it } from 'vitest'

import {
  EmailNotVerifiedError,
  USER_STATUS,
  User,
  UserSuspendedError,
  normalizeEmail,
  type UserSnapshot,
} from './user.entity'

const NOW = new Date('2026-08-11T12:00:00.000Z')

function aUser(overrides: Partial<UserSnapshot> = {}): User {
  return User.fromSnapshot({
    id: 'user-1',
    email: 'ana@ferreteria.com',
    passwordHash: 'hashed:secreto-larguisimo',
    firstName: 'Ana',
    lastName: 'Gómez',
    status: USER_STATUS.ACTIVE,
    emailVerifiedAt: NOW,
    lastLoginAt: null,
    ...overrides,
  })
}

describe('normalización de email', () => {
  it('debería igualar mayúsculas y espacios', () => {
    // Si el registro guarda `Ana@X.com` y el login busca `ana@x.com`, el usuario no puede
    // entrar en su propia cuenta.
    expect(normalizeEmail('  Ana@Ferreteria.COM ')).toBe('ana@ferreteria.com')
  })

  it('debería aplicarse al registrar y al reconstruir', () => {
    const registered = User.register({
      id: 'user-2',
      email: 'PEDRO@Ferreteria.com',
      passwordHash: 'h',
      firstName: 'Pedro',
      lastName: 'Ruiz',
    })

    expect(registered.email).toBe('pedro@ferreteria.com')
    expect(aUser({ email: 'ANA@FERRETERIA.COM' }).email).toBe('ana@ferreteria.com')
  })
})

describe('registro', () => {
  it('debería nacer activo pero sin verificar', () => {
    const user = User.register({
      id: 'user-3',
      email: 'nuevo@ferreteria.com',
      passwordHash: 'h',
      firstName: '  Marta ',
      lastName: ' Díaz ',
    })

    expect(user.currentStatus).toBe(USER_STATUS.ACTIVE)
    expect(user.isEmailVerified).toBe(false)
    expect(user.lastLogin).toBeNull()
    expect(user.firstName).toBe('Marta')
    expect(user.lastName).toBe('Díaz')
  })
})

describe('quién puede autenticarse', () => {
  it('debería dejar pasar a un usuario activo y verificado', () => {
    expect(() => {
      aUser().assertCanAuthenticate()
    }).not.toThrow()
  })

  it('debería rechazar a un usuario suspendido', () => {
    expect(() => {
      aUser({ status: USER_STATUS.SUSPENDED }).assertCanAuthenticate()
    }).toThrow(UserSuspendedError)
  })

  it('debería rechazar a quien no ha verificado su correo', () => {
    expect(() => {
      aUser({ emailVerifiedAt: null }).assertCanAuthenticate()
    }).toThrow(EmailNotVerifiedError)
  })

  it('debería priorizar la suspensión sobre la falta de verificación', () => {
    // Reenviar el correo de verificación a un usuario suspendido sería contradictorio.
    expect(() => {
      aUser({ status: USER_STATUS.SUSPENDED, emailVerifiedAt: null }).assertCanAuthenticate()
    }).toThrow(UserSuspendedError)
  })
})

describe('verificación de correo', () => {
  it('debería marcar la fecha', () => {
    const user = aUser({ emailVerifiedAt: null })
    user.verifyEmail(NOW)

    expect(user.verifiedAt).toEqual(NOW)
    expect(user.isEmailVerified).toBe(true)
  })

  it('debería ser idempotente y conservar la fecha original', () => {
    // El usuario puede pulsar dos veces el enlace del correo; la segunda no debe
    // reescribir el histórico.
    const user = aUser({ emailVerifiedAt: null })
    user.verifyEmail(NOW)
    user.verifyEmail(new Date('2026-09-01T00:00:00.000Z'))

    expect(user.verifiedAt).toEqual(NOW)
  })
})

describe('credenciales', () => {
  it('debería sustituir el hash al cambiar la contraseña', () => {
    const user = aUser()
    user.changePassword('hashed:otra-mas-larga-todavia')

    expect(user.credentialHash).toBe('hashed:otra-mas-larga-todavia')
  })

  it('debería registrar el último acceso', () => {
    const user = aUser()
    user.recordLogin(NOW)

    expect(user.toSnapshot().lastLoginAt).toEqual(NOW)
  })
})
