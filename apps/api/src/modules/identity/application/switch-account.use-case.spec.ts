import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'
import { beforeEach, describe, expect, it } from 'vitest'

import type { AccountStatus } from '@eusse/contracts'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'

import { SessionIssuer } from './session-issuer'
import { SwitchAccountUseCase } from './switch-account.use-case'
import {
  FakeAccessToken,
  FakeAccountsPort,
  FakeClock,
  FakeTokenGenerator,
  InMemorySessionRepository,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')

function setup() {
  const sessions = new InMemorySessionRepository()
  const accounts = new FakeAccountsPort()
  const access = new FakeAccessToken()
  const clock = new FakeClock(NOW)
  const issuer = new SessionIssuer(sessions, new FakeTokenGenerator(), access, clock, 'eusse')
  const useCase = new SwitchAccountUseCase(sessions, accounts, clock, issuer)

  return { useCase, sessions, accounts, access, issuer }
}

function membership(accountId: string, status: AccountStatus = ACCOUNT_STATUS.ACTIVE) {
  return {
    accountId,
    legalName: `Empresa ${accountId}`,
    status,
    role: ACCOUNT_ROLE.BUYER,
    approvalThreshold: null,
  }
}

describe('cambio de cuenta activa', () => {
  let ctx: ReturnType<typeof setup>
  let sessionId: string

  beforeEach(async () => {
    ctx = setup()
    ctx.accounts.give('user-1', membership('account-a'))
    ctx.accounts.give('user-1', membership('account-b'))

    const session = await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: 'account-a',
      ip: null,
      userAgent: null,
    })
    sessionId = session.sessionId
  })

  it('debería reemitir el access token con la cuenta nueva', async () => {
    const result = await ctx.useCase.execute({
      sessionId,
      userId: 'user-1',
      accountId: 'account-b',
    })

    expect(result.activeAccountId).toBe('account-b')
    expect(ctx.access.lastClaims?.acc).toBe('account-b')
  })

  it('debería guardar la cuenta activa en la sesión del servidor', async () => {
    // Si sólo cambiara el token, la próxima renovación devolvería al usuario a la cuenta
    // anterior sin avisar.
    await ctx.useCase.execute({ sessionId, userId: 'user-1', accountId: 'account-b' })

    expect((await ctx.sessions.findSession(sessionId))?.activeAccountId).toBe('account-b')
  })

  it('no debería rotar el refresh token', async () => {
    // Lo que cambia es el claim `acc`, que caduca en 15 minutos. Rotar el refresh aquí
    // sólo añadiría carreras.
    const before = ctx.sessions.refreshTokens.length

    await ctx.useCase.execute({ sessionId, userId: 'user-1', accountId: 'account-b' })

    expect(ctx.sessions.refreshTokens).toHaveLength(before)
  })

  it('debería devolver 404 al cambiar a una cuenta ajena', async () => {
    // 404 y no 403: un 403 confirmaría que esa cuenta existe.
    await expect(
      ctx.useCase.execute({ sessionId, userId: 'user-1', accountId: 'account-de-otro' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('no debería cambiar nada al fallar', async () => {
    await expect(
      ctx.useCase.execute({ sessionId, userId: 'user-1', accountId: 'account-de-otro' }),
    ).rejects.toThrow()

    expect((await ctx.sessions.findSession(sessionId))?.activeAccountId).toBe('account-a')
  })

  it('debería rechazar una cuenta suspendida de la que sí es miembro', async () => {
    ctx.accounts.give('user-1', membership('account-c', ACCOUNT_STATUS.SUSPENDED))

    await expect(
      ctx.useCase.execute({ sessionId, userId: 'user-1', accountId: 'account-c' }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_ACTIVE' })
  })
})
