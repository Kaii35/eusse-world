import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'
import { beforeEach, describe, expect, it } from 'vitest'

import type { RegisterRequest } from '@eusse/contracts'

import { InvalidOneTimeTokenError, TOKEN_PURPOSE } from '../domain/one-time-token'

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
import { VerifyEmailUseCase } from './verify-email.use-case'

const NOW = new Date('2026-08-11T12:00:00.000Z')

const REQUEST: RegisterRequest = {
  email: 'ana@ferreteria.com',
  password: 'una-contrasena-larga',
  firstName: 'Ana',
  lastName: 'Gómez',
  company: { legalName: 'Ferretería Acme S.A.S.', taxId: '900123456-7', phone: '+57 3001234567' },
}

function setup() {
  const users = new InMemoryUserRepository()
  const oneTimeTokens = new InMemoryOneTimeTokenRepository()
  const accounts = new FakeAccountsPort()
  const tokens = new FakeTokenGenerator()
  const events = new RecordingEventPublisher()
  const uow = new PassThroughUnitOfWork()
  const clock = new FakeClock(NOW)

  const register = new RegisterUseCase(
    users,
    oneTimeTokens,
    accounts,
    new FakePasswordHasher(),
    tokens,
    events,
    uow,
    clock,
  )
  const useCase = new VerifyEmailUseCase(users, oneTimeTokens, accounts, tokens, uow, clock)

  return { useCase, register, users, oneTimeTokens, accounts, events, clock }
}

/** Registra y devuelve el token en claro, tal y como llegaría por correo. */
async function registerAndGetToken(ctx: ReturnType<typeof setup>): Promise<string> {
  await ctx.register.execute(REQUEST)
  const event = ctx.events.find('identity.EmailVerificationRequested.v1')
  return String(event?.payload.token)
}

describe('verificación de correo', () => {
  let ctx: ReturnType<typeof setup>
  let token: string

  beforeEach(async () => {
    ctx = setup()
    token = await registerAndGetToken(ctx)
  })

  it('debería marcar el correo como verificado', async () => {
    await ctx.useCase.execute(token)
    const user = await ctx.users.findByEmail('ana@ferreteria.com')

    expect(user?.isEmailVerified).toBe(true)
    expect(user?.verifiedAt).toEqual(NOW)
  })

  it('debería mandar la empresa a la cola de aprobación del staff', async () => {
    // Es la transición PENDING_VERIFICATION → PENDING_APPROVAL del RFC-0003 §4.4.
    await ctx.useCase.execute(token)

    expect(ctx.accounts.submittedForApproval).toHaveLength(1)
    const user = await ctx.users.findByEmail('ana@ferreteria.com')
    const memberships = await ctx.accounts.membershipsOf(user?.id ?? '')
    expect(memberships[0]?.status).toBe(ACCOUNT_STATUS.PENDING_APPROVAL)
  })

  it('debería consumir el token: el enlace no vale dos veces', async () => {
    await ctx.useCase.execute(token)

    await expect(ctx.useCase.execute(token)).rejects.toThrow(InvalidOneTimeTokenError)
  })

  it('debería rechazar un token caducado', async () => {
    ctx.clock.advance(25 * 60 * 60 * 1000)

    await expect(ctx.useCase.execute(token)).rejects.toThrow(InvalidOneTimeTokenError)
  })

  it('debería rechazar un token inventado', async () => {
    await expect(ctx.useCase.execute('inventado')).rejects.toThrow(InvalidOneTimeTokenError)
  })

  it('debería enviar a la cola sólo las empresas pendientes de verificar', async () => {
    // Un usuario puede pertenecer a varias empresas. Reenviar a la cola una que el staff
    // ya aprobó la devolvería al montón de pendientes sin motivo.
    const user = await ctx.users.findByEmail('ana@ferreteria.com')
    ctx.accounts.give(user?.id ?? '', {
      accountId: 'account-ya-activa',
      legalName: 'Otra S.A.S.',
      status: ACCOUNT_STATUS.ACTIVE,
      role: ACCOUNT_ROLE.BUYER,
      approvalThreshold: null,
    })

    await ctx.useCase.execute(token)

    expect(ctx.accounts.submittedForApproval).toEqual(['account-1'])
  })

  it('debería guardar sólo el hash: el token en claro no está en la base de datos', () => {
    const stored = ctx.oneTimeTokens.tokens

    expect(stored[0]?.purpose).toBe(TOKEN_PURPOSE.EMAIL_VERIFICATION)
    expect(stored.some((row) => row.hash === token)).toBe(false)
  })
})
