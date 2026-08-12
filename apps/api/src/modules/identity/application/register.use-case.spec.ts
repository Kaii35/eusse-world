import { beforeEach, describe, expect, it } from 'vitest'

import type { RegisterRequest } from '@eusse/contracts'

import { TOKEN_PURPOSE } from '../domain/one-time-token'
import { User } from '../domain/user.entity'

import { RegisterUseCase } from './register.use-case'
import {
  FakeAccountsPort,
  FakeClock,
  FakePasswordHasher,
  FakeTokenGenerator,
  InMemoryOneTimeTokenRepository,
  InMemoryUserRepository,
  PassThroughUnitOfWork,
  RecordingEventPublisher,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')

const REQUEST: RegisterRequest = {
  email: 'Ana@Ferreteria.com',
  password: 'una-contrasena-larga',
  firstName: 'Ana',
  lastName: 'Gómez',
  company: {
    legalName: 'Ferretería Acme S.A.S.',
    taxId: '900123456-7',
    phone: '+57 3001234567',
  },
}

function setup() {
  const users = new InMemoryUserRepository()
  const oneTimeTokens = new InMemoryOneTimeTokenRepository()
  const accounts = new FakeAccountsPort()
  const hasher = new FakePasswordHasher()
  const tokens = new FakeTokenGenerator()
  const events = new RecordingEventPublisher()
  const uow = new PassThroughUnitOfWork()
  const clock = new FakeClock(NOW)

  const useCase = new RegisterUseCase(
    users,
    oneTimeTokens,
    accounts,
    hasher,
    tokens,
    events,
    uow,
    clock,
  )

  return { useCase, users, oneTimeTokens, accounts, hasher, events, uow, clock }
}

describe('registro de una empresa nueva', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(async () => {
    ctx = setup()
    await ctx.useCase.execute(REQUEST)
  })

  it('debería crear al usuario con el email normalizado y sin verificar', async () => {
    const user = await ctx.users.findByEmail('ana@ferreteria.com')

    expect(user).not.toBeNull()
    expect(user?.isEmailVerified).toBe(false)
  })

  it('debería pasar la contraseña por el hasher, no guardarla tal cual', async () => {
    // El doble produce `hashed:<clave>` a propósito, para que el test compruebe que la
    // contraseña pasó por el puerto. Que Argon2id sea irreversible se prueba en su
    // adaptador, no aquí.
    const user = await ctx.users.findByEmail('ana@ferreteria.com')

    expect(user?.credentialHash).not.toBe(REQUEST.password)
    expect(user?.credentialHash).toBe(`hashed:${REQUEST.password}`)
  })

  it('debería crear también la empresa, con el registrante como OWNER', async () => {
    const user = await ctx.users.findByEmail('ana@ferreteria.com')
    const memberships = await ctx.accounts.membershipsOf(user?.id ?? '')

    expect(memberships).toHaveLength(1)
    expect(memberships[0]?.role).toBe('OWNER')
    expect(memberships[0]?.status).toBe('PENDING_VERIFICATION')
  })

  it('debería hacer usuario, empresa y eventos en una sola transacción', () => {
    // Si no fueran atómicos, un fallo a mitad deja a una persona registrada sin empresa
    // y nadie lo repararía.
    expect(ctx.uow.runs).toBe(1)
  })

  it('debería publicar el registro y la petición de verificación', () => {
    expect(ctx.events.typesPublished()).toEqual([
      'identity.UserRegistered.v1',
      'identity.EmailVerificationRequested.v1',
    ])
  })

  it('debería publicar un payload autocontenido', () => {
    // El consumidor no debe volver a preguntarle al emisor (RFC-0013 §4.2).
    const registered = ctx.events.find('identity.UserRegistered.v1')

    expect(registered?.payload).toMatchObject({
      email: 'ana@ferreteria.com',
      firstName: 'Ana',
      legalName: 'Ferretería Acme S.A.S.',
      taxId: '900123456-7',
    })
  })

  it('debería guardar sólo el hash del token de verificación', () => {
    const stored = ctx.oneTimeTokens.tokens
    const event = ctx.events.find('identity.EmailVerificationRequested.v1')
    const plain = event?.payload.token

    expect(stored).toHaveLength(1)
    expect(stored[0]?.purpose).toBe(TOKEN_PURPOSE.EMAIL_VERIFICATION)
    expect(stored[0]?.hash).toBe(`sha256:${String(plain)}`)
    expect(stored[0]?.hash).not.toBe(plain)
  })
})

describe('registro con un email que ya existe', () => {
  it('debería responder igual que un registro nuevo, sin crear nada', async () => {
    // Si respondiera distinto, el formulario de registro serviría para listar clientes.
    const ctx = setup()
    await ctx.useCase.execute(REQUEST)
    const before = ctx.users.byId.size

    await expect(ctx.useCase.execute(REQUEST)).resolves.toBeUndefined()
    expect(ctx.users.byId.size).toBe(before)
  })

  it('debería reenviar el enlace si esa persona nunca verificó su correo', async () => {
    const ctx = setup()
    await ctx.useCase.execute(REQUEST)
    ctx.events.published.length = 0

    await ctx.useCase.execute(REQUEST)

    expect(ctx.events.typesPublished()).toEqual(['identity.EmailVerificationRequested.v1'])
  })

  it('debería invalidar el enlace anterior al reenviar', async () => {
    const ctx = setup()
    await ctx.useCase.execute(REQUEST)
    const user = await ctx.users.findByEmail('ana@ferreteria.com')

    await ctx.useCase.execute(REQUEST)

    const live = ctx.oneTimeTokens.liveFor(user?.id ?? '', TOKEN_PURPOSE.EMAIL_VERIFICATION)
    expect(live).toHaveLength(1)
    expect(ctx.oneTimeTokens.tokens).toHaveLength(2)
  })

  it('no debería mandar nada si esa persona ya verificó su correo', async () => {
    // Aquí sí que no hay nada que hacer: avisar sería confirmarle a quien prueba emails
    // que ha acertado.
    const ctx = setup()
    await ctx.users.create(
      User.register({
        id: 'user-existente',
        email: 'ana@ferreteria.com',
        passwordHash: 'hashed:otra',
        firstName: 'Ana',
        lastName: 'Gómez',
      }),
    )
    const existing = await ctx.users.findById('user-existente')
    existing?.verifyEmail(NOW)

    await ctx.useCase.execute(REQUEST)

    expect(ctx.events.published).toHaveLength(0)
    expect(ctx.oneTimeTokens.tokens).toHaveLength(0)
  })
})
