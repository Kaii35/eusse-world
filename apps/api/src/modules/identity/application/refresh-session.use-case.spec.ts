import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'
import { beforeEach, describe, expect, it } from 'vitest'

import { SessionExpiredError, TOKEN_STATE } from '../domain/refresh-token-family'

import { RefreshSessionUseCase } from './refresh-session.use-case'
import { SessionIssuer } from './session-issuer'
import {
  FakeAccessToken,
  FakeAccountsPort,
  FakeClock,
  FakeTokenGenerator,
  InMemorySessionRepository,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')
const MINUTE = 60 * 1000

function setup() {
  const sessions = new InMemorySessionRepository()
  const accounts = new FakeAccountsPort()
  const tokens = new FakeTokenGenerator()
  const access = new FakeAccessToken()
  const clock = new FakeClock(NOW)

  const issuer = new SessionIssuer(sessions, tokens, access, clock, 'eusse')
  const useCase = new RefreshSessionUseCase(sessions, accounts, tokens, clock, issuer)

  return { useCase, sessions, accounts, access, clock, issuer }
}

async function openSessionFor(ctx: ReturnType<typeof setup>, activeAccountId: string | null) {
  if (activeAccountId) {
    ctx.accounts.give('user-1', {
      accountId: activeAccountId,
      legalName: 'Ferretería Acme S.A.S.',
      status: ACCOUNT_STATUS.ACTIVE,
      role: ACCOUNT_ROLE.OWNER,
      approvalThreshold: null,
    })
  }

  return ctx.issuer.open({ userId: 'user-1', activeAccountId, ip: null, userAgent: null })
}

describe('rotación normal', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(() => {
    ctx = setup()
  })

  it('debería emitir un refresh nuevo y marcar el anterior como usado', async () => {
    const session = await openSessionFor(ctx, 'account-1')

    const result = await ctx.useCase.execute(session.refreshToken)

    expect(result.refreshToken).not.toBe(session.refreshToken)
    const old = ctx.sessions.refreshTokens.find((t) => t.hash === `sha256:${session.refreshToken}`)
    expect(old?.state).toBe(TOKEN_STATE.USED)
  })

  it('debería mantener la misma familia y la misma sesión', async () => {
    // La familia es lo que permite detectar el robo más adelante.
    const session = await openSessionFor(ctx, 'account-1')

    const result = await ctx.useCase.execute(session.refreshToken)

    const familias = new Set(ctx.sessions.refreshTokens.map((t) => t.familyId))
    expect(familias.size).toBe(1)
    expect(result.sessionId).toBe(session.sessionId)
  })

  it('debería recalcular la caducidad desde ahora, no heredarla', async () => {
    // Si la heredara, una sesión en uso continuo se cortaría a los 30 días del primer
    // login por mucho que el usuario siguiera trabajando.
    const session = await openSessionFor(ctx, 'account-1')
    ctx.clock.advance(10 * 24 * 60 * MINUTE)

    const result = await ctx.useCase.execute(session.refreshToken)

    expect(result.refreshExpiresAt.getTime()).toBeGreaterThan(session.refreshExpiresAt.getTime())
  })

  it('debería permitir renovar varias veces seguidas', async () => {
    const session = await openSessionFor(ctx, 'account-1')

    const first = await ctx.useCase.execute(session.refreshToken)
    const second = await ctx.useCase.execute(first.refreshToken)

    expect(second.accessToken).toContain('user-1')
    expect(second.activeAccountId).toBe('account-1')
  })
})

describe('detección de reutilización — el control clave', () => {
  it('debería revocar la familia entera al presentar un token ya usado', async () => {
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    const rotated = await ctx.useCase.execute(session.refreshToken)

    // El atacante presenta el token robado, que el cliente legítimo ya gastó.
    await expect(ctx.useCase.execute(session.refreshToken)).rejects.toThrow(SessionExpiredError)

    const states = ctx.sessions.refreshTokens.map((t) => t.state)
    expect(states.every((state) => state === TOKEN_STATE.REVOKED)).toBe(true)
    // Y el token que tenía el usuario legítimo también deja de valer: no se puede saber
    // cuál de los dos era el bueno.
    await expect(ctx.useCase.execute(rotated.refreshToken)).rejects.toThrow(SessionExpiredError)
  })

  it('debería cerrar además la sesión', async () => {
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    await ctx.useCase.execute(session.refreshToken)

    await expect(ctx.useCase.execute(session.refreshToken)).rejects.toThrow()

    const stored = await ctx.sessions.findSession(session.sessionId)
    expect(stored?.revokedAt).not.toBeNull()
  })

  it('debería dar el mismo error para token inexistente, caducado y reutilizado', async () => {
    // Cualquier distinción le diría al atacante en qué punto fue descubierto.
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    await ctx.useCase.execute(session.refreshToken)

    const codes: unknown[] = []
    for (const token of ['inventado', session.refreshToken]) {
      try {
        await ctx.useCase.execute(token)
      } catch (error) {
        codes.push(error instanceof SessionExpiredError ? error.code : 'otro')
      }
    }

    expect(codes).toEqual(['AUTH_SESSION_EXPIRED', 'AUTH_SESSION_EXPIRED'])
  })
})

describe('sesión ya cerrada o caducada', () => {
  it('debería rechazar un token caducado', async () => {
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    ctx.clock.advance(31 * 24 * 60 * MINUTE)

    await expect(ctx.useCase.execute(session.refreshToken)).rejects.toThrow(SessionExpiredError)
  })

  it('debería rechazar si la sesión fue revocada, aunque el token siga vivo', async () => {
    // Es lo que hace que el logout cierre algo de verdad.
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    await ctx.sessions.revokeSession(session.sessionId, NOW)

    await expect(ctx.useCase.execute(session.refreshToken)).rejects.toThrow(SessionExpiredError)
  })
})

describe('reevaluación de la cuenta activa', () => {
  it('debería soltar la cuenta si dejó de estar activa', async () => {
    // El staff suspende una cuenta: deja de operar en la siguiente renovación, no dentro
    // de 30 días.
    const ctx = setup()
    const session = await openSessionFor(ctx, 'account-1')
    ctx.accounts.memberships.set('user-1', [
      {
        accountId: 'account-1',
        legalName: 'Ferretería Acme S.A.S.',
        status: ACCOUNT_STATUS.SUSPENDED,
        role: ACCOUNT_ROLE.OWNER,
        approvalThreshold: null,
      },
    ])

    const result = await ctx.useCase.execute(session.refreshToken)

    expect(result.activeAccountId).toBeNull()
    expect((await ctx.sessions.findSession(session.sessionId))?.activeAccountId).toBeNull()
  })

  it('debería tomar una cuenta activa si la sesión no tenía ninguna', async () => {
    // Caso real: la empresa se aprueba mientras el usuario tiene la pestaña abierta.
    const ctx = setup()
    const session = await openSessionFor(ctx, null)
    ctx.accounts.give('user-1', {
      accountId: 'account-9',
      legalName: 'Ferretería Acme S.A.S.',
      status: ACCOUNT_STATUS.ACTIVE,
      role: ACCOUNT_ROLE.OWNER,
      approvalThreshold: null,
    })

    const result = await ctx.useCase.execute(session.refreshToken)

    expect(result.activeAccountId).toBe('account-9')
  })
})
