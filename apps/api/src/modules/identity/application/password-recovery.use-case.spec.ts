import { beforeEach, describe, expect, it } from 'vitest'

import { InvalidOneTimeTokenError, TOKEN_PURPOSE } from '../domain/one-time-token'
import { TOKEN_STATE } from '../domain/refresh-token-family'
import { User } from '../domain/user.entity'

import { RequestPasswordResetUseCase } from './request-password-reset.use-case'
import { ResetPasswordUseCase } from './reset-password.use-case'
import { SessionIssuer } from './session-issuer'
import {
  FakeAccessToken,
  FakeClock,
  FakePasswordHasher,
  FakeTokenGenerator,
  InMemoryOneTimeTokenRepository,
  InMemorySessionRepository,
  InMemoryUserRepository,
  PassThroughUnitOfWork,
  RecordingEventPublisher,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')
const HOUR = 60 * 60 * 1000

function setup() {
  const users = new InMemoryUserRepository()
  const oneTimeTokens = new InMemoryOneTimeTokenRepository()
  const sessions = new InMemorySessionRepository()
  const hasher = new FakePasswordHasher()
  const tokens = new FakeTokenGenerator()
  const events = new RecordingEventPublisher()
  const uow = new PassThroughUnitOfWork()
  const clock = new FakeClock(NOW)

  const request = new RequestPasswordResetUseCase(users, oneTimeTokens, tokens, events, uow, clock)
  const reset = new ResetPasswordUseCase(
    users,
    oneTimeTokens,
    sessions,
    hasher,
    tokens,
    events,
    uow,
    clock,
  )
  const issuer = new SessionIssuer(sessions, tokens, new FakeAccessToken(), clock, 'eusse')

  return { request, reset, users, oneTimeTokens, sessions, events, clock, issuer }
}

function aUser(): User {
  const user = User.register({
    id: 'user-1',
    email: 'ana@ferreteria.com',
    passwordHash: 'hashed:la-vieja-larguisima',
    firstName: 'Ana',
    lastName: 'Gómez',
  })
  user.verifyEmail(NOW)
  return user
}

function tokenFrom(ctx: ReturnType<typeof setup>): string {
  return String(ctx.events.find('identity.PasswordResetRequested.v1')?.payload.token)
}

describe('solicitud de recuperación', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(async () => {
    ctx = setup()
    await ctx.users.create(aUser())
  })

  it('debería emitir un enlace de una hora', async () => {
    await ctx.request.execute('Ana@Ferreteria.com')

    const stored = ctx.oneTimeTokens.tokens
    expect(stored).toHaveLength(1)
    expect(stored[0]?.purpose).toBe(TOKEN_PURPOSE.PASSWORD_RESET)
    expect(stored[0]?.expiresAt.toISOString()).toBe('2026-08-11T13:00:00.000Z')
  })

  it('debería guardar sólo el hash del token', async () => {
    await ctx.request.execute('ana@ferreteria.com')

    expect(ctx.oneTimeTokens.tokens[0]?.hash).toBe(`sha256:${tokenFrom(ctx)}`)
  })

  it('debería invalidar el enlace anterior al pedir uno nuevo', async () => {
    // Si no, cada solicitud deja otra llave viva durante una hora.
    await ctx.request.execute('ana@ferreteria.com')
    await ctx.request.execute('ana@ferreteria.com')

    expect(ctx.oneTimeTokens.liveFor('user-1', TOKEN_PURPOSE.PASSWORD_RESET)).toHaveLength(1)
    expect(ctx.oneTimeTokens.tokens).toHaveLength(2)
  })

  it('debería responder igual con un email que no existe', async () => {
    // Este formulario es público y sin sesión: decir "ese correo no está registrado" es
    // la forma más cómoda de listar los clientes de la empresa.
    await expect(ctx.request.execute('nadie@ferreteria.com')).resolves.toBeUndefined()
    expect(ctx.oneTimeTokens.tokens).toHaveLength(0)
    expect(ctx.events.published).toHaveLength(0)
  })

  it('no debería devolver el acceso a un usuario suspendido', async () => {
    const suspendido = aUser()
    suspendido.suspend()
    await ctx.users.save(suspendido)

    await ctx.request.execute('ana@ferreteria.com')

    expect(ctx.oneTimeTokens.tokens).toHaveLength(0)
  })
})

describe('restablecimiento', () => {
  let ctx: ReturnType<typeof setup>
  let token: string

  beforeEach(async () => {
    ctx = setup()
    await ctx.users.create(aUser())
    await ctx.request.execute('ana@ferreteria.com')
    token = tokenFrom(ctx)
  })

  it('debería cambiar la contraseña', async () => {
    await ctx.reset.execute({ token, password: 'la-nueva-larguisima' })

    const user = await ctx.users.findById('user-1')
    expect(user?.credentialHash).toBe('hashed:la-nueva-larguisima')
  })

  it('debería cerrar todas las sesiones abiertas', async () => {
    // Quien restablece su contraseña suele sospechar que alguien más entró: dejarle las
    // sesiones abiertas deja dentro justo a quien intenta echar.
    await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: null,
      ip: null,
      userAgent: null,
    })

    await ctx.reset.execute({ token, password: 'la-nueva-larguisima' })

    expect([...ctx.sessions.sessions.values()].every((s) => s.revokedAt !== null)).toBe(true)
    expect(ctx.sessions.refreshTokens.every((t) => t.state === TOKEN_STATE.REVOKED)).toBe(true)
  })

  it('debería avisar del cambio', async () => {
    // Si no fue el usuario, tiene que enterarse de inmediato.
    await ctx.reset.execute({ token, password: 'la-nueva-larguisima' })

    expect(ctx.events.typesPublished()).toContain('identity.PasswordChanged.v1')
  })

  it('debería rechazar el mismo enlace la segunda vez', async () => {
    await ctx.reset.execute({ token, password: 'la-nueva-larguisima' })

    await expect(ctx.reset.execute({ token, password: 'otra-mas-larga-aun' })).rejects.toThrow(
      InvalidOneTimeTokenError,
    )
  })

  it('debería rechazar un enlace caducado', async () => {
    ctx.clock.advance(HOUR + 1000)

    await expect(ctx.reset.execute({ token, password: 'la-nueva-larguisima' })).rejects.toThrow(
      InvalidOneTimeTokenError,
    )
  })

  it('no debería verificar el correo de paso', async () => {
    // Llegar aquí prueba que controla el buzón, pero verificar mueve la empresa a la cola
    // de aprobación: ese camino tiene su propio caso de uso y nadie diseñó éste para eso.
    const sinVerificar = User.register({
      id: 'user-2',
      email: 'pedro@ferreteria.com',
      passwordHash: 'hashed:la-vieja-larguisima',
      firstName: 'Pedro',
      lastName: 'Ruiz',
    })
    await ctx.users.create(sinVerificar)
    ctx.events.published.length = 0
    await ctx.request.execute('pedro@ferreteria.com')

    await ctx.reset.execute({ token: tokenFrom(ctx), password: 'la-nueva-larguisima' })

    expect((await ctx.users.findById('user-2'))?.isEmailVerified).toBe(false)
  })

  it('debería rechazar un token de verificación usado como enlace de recuperación', async () => {
    await ctx.oneTimeTokens.create({
      id: 'ott-verificacion',
      userId: 'user-1',
      purpose: TOKEN_PURPOSE.EMAIL_VERIFICATION,
      hash: 'sha256:token-de-verificacion',
      expiresAt: new Date(NOW.getTime() + 24 * HOUR),
      consumedAt: null,
    })

    await expect(
      ctx.reset.execute({ token: 'token-de-verificacion', password: 'la-nueva-larguisima' }),
    ).rejects.toThrow(InvalidOneTimeTokenError)
  })
})
