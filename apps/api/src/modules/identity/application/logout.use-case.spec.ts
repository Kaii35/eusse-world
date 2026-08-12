import { describe, expect, it } from 'vitest'

import { TOKEN_STATE } from '../domain/refresh-token-family'

import { LogoutUseCase } from './logout.use-case'
import { SessionIssuer } from './session-issuer'
import {
  FakeAccessToken,
  FakeClock,
  FakeTokenGenerator,
  InMemorySessionRepository,
} from './testing/in-memory.doubles'

const NOW = new Date('2026-08-11T12:00:00.000Z')

function setup() {
  const sessions = new InMemorySessionRepository()
  const tokens = new FakeTokenGenerator()
  const clock = new FakeClock(NOW)
  const issuer = new SessionIssuer(sessions, tokens, new FakeAccessToken(), clock, 'eusse')
  const useCase = new LogoutUseCase(sessions, tokens, clock)

  return { useCase, sessions, issuer }
}

describe('logout', () => {
  it('debería invalidar la sesión en el servidor, no sólo la cookie', async () => {
    // Una sesión que sigue viva tras el logout es el fallo clásico, y quien cierra sesión
    // en un ordenador compartido cree exactamente lo contrario.
    const ctx = setup()
    const session = await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: null,
      ip: null,
      userAgent: null,
    })

    await ctx.useCase.execute(session.refreshToken)

    const stored = await ctx.sessions.findSession(session.sessionId)
    expect(stored?.revokedAt).toEqual(NOW)
  })

  it('debería revocar toda la familia, no sólo el token presentado', async () => {
    // Si quedara vivo cualquier descendiente, la sesión se renovaría después del logout.
    const ctx = setup()
    const session = await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: null,
      ip: null,
      userAgent: null,
    })

    await ctx.useCase.execute(session.refreshToken)

    expect(ctx.sessions.refreshTokens.every((t) => t.state === TOKEN_STATE.REVOKED)).toBe(true)
  })

  it('no debería tocar las sesiones de otros dispositivos', async () => {
    // Cerrar sesión en el móvil no cierra la del portátil.
    const ctx = setup()
    const movil = await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: null,
      ip: null,
      userAgent: 'movil',
    })
    const portatil = await ctx.issuer.open({
      userId: 'user-1',
      activeAccountId: null,
      ip: null,
      userAgent: 'portatil',
    })

    await ctx.useCase.execute(movil.refreshToken)

    expect((await ctx.sessions.findSession(portatil.sessionId))?.revokedAt).toBeNull()
  })

  it('debería ser idempotente y no fallar con un token desconocido', async () => {
    // Responder distinto según si el token existía convertiría el logout en un oráculo.
    const ctx = setup()

    await expect(ctx.useCase.execute('inventado')).resolves.toBeUndefined()
    await expect(ctx.useCase.execute(null)).resolves.toBeUndefined()
  })
})
