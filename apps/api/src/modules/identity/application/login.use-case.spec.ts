import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'
import { beforeEach, describe, expect, it } from 'vitest'

import { TOKEN_STATE } from '../domain/refresh-token-family'
import { InvalidCredentialsError, USER_STATUS, User } from '../domain/user.entity'

import { LoginUseCase } from './login.use-case'
import { SessionIssuer } from './session-issuer'
import {
  FakeAccessToken,
  FakeAccountsPort,
  FakeClock,
  FakePasswordHasher,
  FakeTokenGenerator,
  InMemorySessionRepository,
  InMemoryUserRepository,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')
const PASSWORD = 'una-contrasena-larga'

function setup() {
  const users = new InMemoryUserRepository()
  const sessions = new InMemorySessionRepository()
  const accounts = new FakeAccountsPort()
  const hasher = new FakePasswordHasher()
  const tokens = new FakeTokenGenerator()
  const access = new FakeAccessToken()
  const clock = new FakeClock(NOW)

  const issuer = new SessionIssuer(sessions, tokens, access, clock, 'eusse')
  const useCase = new LoginUseCase(users, accounts, hasher, clock, issuer)

  return { useCase, users, sessions, accounts, hasher, access, clock }
}

function verifiedUser(id = 'user-1'): User {
  const user = User.register({
    id,
    email: 'ana@ferreteria.com',
    passwordHash: `hashed:${PASSWORD}`,
    firstName: 'Ana',
    lastName: 'Gómez',
  })
  user.verifyEmail(NOW)
  return user
}

const credentials = { email: 'ana@ferreteria.com', password: PASSWORD, ip: null, userAgent: null }

describe('login correcto', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(async () => {
    ctx = setup()
    await ctx.users.create(verifiedUser())
    ctx.accounts.give('user-1', {
      accountId: 'account-1',
      legalName: 'Ferretería Acme S.A.S.',
      status: ACCOUNT_STATUS.ACTIVE,
      role: ACCOUNT_ROLE.OWNER,
      approvalThreshold: null,
    })
  })

  it('debería abrir sesión con su cuenta activa', async () => {
    const result = await ctx.useCase.execute(credentials)

    expect(result.activeAccountId).toBe('account-1')
    expect(result.session.accessToken).toContain('user-1')
  })

  it('debería aceptar el email en cualquier combinación de mayúsculas', async () => {
    const result = await ctx.useCase.execute({ ...credentials, email: '  ANA@Ferreteria.com ' })

    expect(result.userId).toBe('user-1')
  })

  it('debería guardar sólo el hash del refresh token', async () => {
    // El valor en claro vive únicamente en la cookie del cliente.
    const result = await ctx.useCase.execute(credentials)
    const stored = ctx.sessions.refreshTokens

    expect(stored).toHaveLength(1)
    expect(stored[0]?.hash).toBe(`sha256:${result.session.refreshToken}`)
    expect(stored[0]?.state).toBe(TOKEN_STATE.ACTIVE)
  })

  it('debería emitir un access token de 15 minutos y un refresh de 30 días', async () => {
    const result = await ctx.useCase.execute(credentials)

    expect(result.session.accessExpiresAt.toISOString()).toBe('2026-08-11T12:15:00.000Z')
    expect(result.session.refreshExpiresAt.toISOString()).toBe('2026-09-10T12:00:00.000Z')
  })

  it('no debería poner permisos en el token', async () => {
    // Se evalúan en servidor: revocar un permiso debe tener efecto ya, no en 15 minutos.
    await ctx.useCase.execute(credentials)

    expect(Object.keys(ctx.access.lastClaims ?? {})).toEqual(['sub', 'sid', 'acc', 'ten'])
  })

  it('debería registrar el último acceso', async () => {
    await ctx.useCase.execute(credentials)
    const user = await ctx.users.findById('user-1')

    expect(user?.lastLogin).toEqual(NOW)
  })
})

describe('login sin cuenta aprobada todavía', () => {
  it('debería dejar entrar pero sin cuenta activa', async () => {
    // Puede navegar el catálogo; sin `acc` no hay precios que enseñarle (RFC-0003 §4.4).
    const ctx = setup()
    await ctx.users.create(verifiedUser())
    ctx.accounts.give('user-1', {
      accountId: 'account-1',
      legalName: 'Ferretería Acme S.A.S.',
      status: ACCOUNT_STATUS.PENDING_APPROVAL,
      role: ACCOUNT_ROLE.OWNER,
      approvalThreshold: null,
    })

    const result = await ctx.useCase.execute(credentials)

    expect(result.activeAccountId).toBeNull()
    expect(result.memberships).toHaveLength(1)
  })
})

describe('login fallido — no debe revelar nada', () => {
  it('debería dar el mismo error con email inexistente y con contraseña incorrecta', async () => {
    const ctx = setup()
    await ctx.users.create(verifiedUser())

    const desconocido = ctx.useCase.execute({ ...credentials, email: 'nadie@ferreteria.com' })
    const incorrecta = ctx.useCase.execute({ ...credentials, password: 'otra-cosa-larguisima' })

    await expect(desconocido).rejects.toThrow(InvalidCredentialsError)
    await expect(incorrecta).rejects.toThrow(InvalidCredentialsError)
  })

  it('debería verificar contra un hash señuelo cuando el email no existe', async () => {
    // Sin esto, el email desconocido responde en 2 ms y el real en 50: esa diferencia es
    // el oráculo que las respuestas uniformes intentan cerrar.
    const ctx = setup()

    await expect(
      ctx.useCase.execute({ ...credentials, email: 'nadie@ferreteria.com' }),
    ).rejects.toThrow(InvalidCredentialsError)
    expect(ctx.hasher.fakeVerifyCalls).toBe(1)
  })

  it('no debería abrir sesión al fallar', async () => {
    const ctx = setup()
    await ctx.users.create(verifiedUser())

    await expect(ctx.useCase.execute({ ...credentials, password: 'mal' })).rejects.toThrow()
    expect(ctx.sessions.sessions.size).toBe(0)
  })

  it('debería rechazar a quien no ha verificado su correo', async () => {
    const ctx = setup()
    const user = User.register({
      id: 'user-2',
      email: 'ana@ferreteria.com',
      passwordHash: `hashed:${PASSWORD}`,
      firstName: 'Ana',
      lastName: 'Gómez',
    })
    await ctx.users.create(user)

    await expect(ctx.useCase.execute(credentials)).rejects.toMatchObject({
      code: 'AUTH_EMAIL_NOT_VERIFIED',
    })
  })

  it('debería rechazar a un usuario suspendido aunque acierte la contraseña', async () => {
    const ctx = setup()
    const user = verifiedUser()
    user.suspend()
    await ctx.users.create(user)

    await expect(ctx.useCase.execute(credentials)).rejects.toMatchObject({
      code: 'AUTH_FORBIDDEN',
    })
    expect(user.currentStatus).toBe(USER_STATUS.SUSPENDED)
  })
})
