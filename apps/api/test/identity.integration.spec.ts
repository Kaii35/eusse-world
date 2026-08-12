import { Test } from '@nestjs/testing'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { RegisterRequest } from '@eusse/contracts'

import { AppModule } from '../src/app.module'
import { LoginUseCase } from '../src/modules/identity/application/login.use-case'
import { LogoutUseCase } from '../src/modules/identity/application/logout.use-case'
import { RefreshSessionUseCase } from '../src/modules/identity/application/refresh-session.use-case'
import { RegisterUseCase } from '../src/modules/identity/application/register.use-case'
import { RequestPasswordResetUseCase } from '../src/modules/identity/application/request-password-reset.use-case'
import { ResetPasswordUseCase } from '../src/modules/identity/application/reset-password.use-case'
import { VerifyEmailUseCase } from '../src/modules/identity/application/verify-email.use-case'
import { PrismaService } from '../src/shared-kernel/infrastructure/prisma.service'

import type { TestingModule } from '@nestjs/testing'

/**
 * B5 — persistencia real de Identity y Accounts.
 *
 * Contra PostgreSQL de verdad (ADR-0015). Lo que se prueba aquí es exactamente lo que un
 * doble en memoria **no puede** demostrar: que la transacción abarca los dos contextos,
 * que las restricciones únicas existen en la base de datos, y que las condiciones de
 * carrera se resuelven en la escritura y no en un `if` previo.
 *
 * Se salta si no hay base de datos: `pnpm db:up`.
 */
const enabled = Boolean(process.env.DATABASE_URL)

const PASSWORD = 'una-contrasena-muy-larga'

function aRequest(overrides: Partial<RegisterRequest> = {}): RegisterRequest {
  const unique = Math.random().toString(36).slice(2, 10)
  return {
    email: `ana-${unique}@ferreteria.test`,
    password: PASSWORD,
    firstName: 'Ana',
    lastName: 'Gómez',
    company: {
      legalName: `Ferretería ${unique} S.A.S.`,
      taxId: `9${unique.slice(0, 8)}`,
      phone: '+57 3001234567',
    },
    ...overrides,
  }
}

describe.runIf(enabled)('Identity sobre PostgreSQL', () => {
  let app: TestingModule
  let prisma: PrismaService
  let register: RegisterUseCase
  let verifyEmail: VerifyEmailUseCase
  let login: LoginUseCase
  let refresh: RefreshSessionUseCase
  let logout: LogoutUseCase
  let requestReset: RequestPasswordResetUseCase
  let resetPassword: ResetPasswordUseCase

  beforeAll(async () => {
    app = await Test.createTestingModule({ imports: [AppModule] }).compile()
    await app.init()

    prisma = app.get(PrismaService)
    register = app.get(RegisterUseCase)
    verifyEmail = app.get(VerifyEmailUseCase)
    login = app.get(LoginUseCase)
    refresh = app.get(RefreshSessionUseCase)
    logout = app.get(LogoutUseCase)
    requestReset = app.get(RequestPasswordResetUseCase)
    resetPassword = app.get(ResetPasswordUseCase)
  }, 30_000)

  afterAll(async () => {
    await cleanUp(prisma)
    await app.close()
  })

  beforeEach(async () => {
    await cleanUp(prisma)
  })

  /** Registra y devuelve el token de verificación tal y como saldría por correo. */
  async function registerAndVerify(request: RegisterRequest): Promise<void> {
    await register.execute(request)
    const token = await verificationTokenFor(prisma, request.email.toLowerCase())
    await verifyEmail.execute(token)
  }

  describe('registro', () => {
    it('debería crear persona, empresa, membresía y eventos en una sola transacción', async () => {
      const request = aRequest()

      await register.execute(request)

      const user = await prisma.user.findUniqueOrThrow({
        where: { email: request.email.toLowerCase() },
      })

      const membership = await prisma.membership.findFirstOrThrow({
        where: { userId: user.id },
        include: { account: true },
      })
      expect(membership.role).toBe('OWNER')
      expect(membership.account.status).toBe('PENDING_VERIFICATION')
      expect(membership.account.legalName).toBe(request.company.legalName)

      // Ambos eventos comparten `occurredAt`: describen el mismo hecho. Por eso se
      // comprueban como conjunto y no como secuencia.
      // Acotado a `identity.`: la tabla es compartida y otros paquetes escriben en ella.
      const events = await prisma.outboxEvent.findMany({
        where: { type: { startsWith: 'identity.' } },
      })
      expect(events.map((event) => event.type).sort()).toEqual([
        'identity.EmailVerificationRequested.v1',
        'identity.UserRegistered.v1',
      ])
      expect(new Set(events.map((event) => event.correlationId)).size).toBe(1)
    })

    it('debería guardar el hash de Argon2id, no la contraseña', async () => {
      const request = aRequest()
      await register.execute(request)

      const user = await prisma.user.findUniqueOrThrow({
        where: { email: request.email.toLowerCase() },
      })

      expect(user.passwordHash).toMatch(/^\$argon2id\$/)
      expect(user.passwordHash).not.toContain(PASSWORD)
    })

    it('debería guardar sólo el hash del token de verificación', async () => {
      const request = aRequest()
      await register.execute(request)

      const event = await prisma.outboxEvent.findFirstOrThrow({
        where: { type: 'identity.EmailVerificationRequested.v1' },
      })
      const plain = (event.payload as { token: string }).token
      const stored = await prisma.oneTimeToken.findFirstOrThrow()

      expect(stored.tokenHash).not.toBe(plain)
      expect(stored.tokenHash).toHaveLength(64)
    })

    it('no debería dejar nada a medias si la empresa choca con otra ya registrada', async () => {
      // Mismo taxId: la restricción única de la base de datos rechaza la cuenta. El
      // usuario NO puede quedar creado: sería una persona sin empresa, y eso no lo repara
      // nadie. Es la prueba de que la transacción abarca los dos contextos.
      const first = aRequest()
      await register.execute(first)

      const clash = aRequest({ company: { ...first.company, legalName: 'Otra S.A.S.' } })
      await expect(register.execute(clash)).rejects.toThrow()

      const orphan = await prisma.user.findUnique({ where: { email: clash.email.toLowerCase() } })
      expect(orphan).toBeNull()
      expect(await prisma.account.count()).toBe(1)
    })

    it('debería responder igual con un email ya registrado, sin crear otra empresa', async () => {
      const request = aRequest()
      await register.execute(request)

      await expect(register.execute(aRequest({ email: request.email }))).resolves.toBeUndefined()

      expect(await prisma.user.count()).toBe(1)
      expect(await prisma.account.count()).toBe(1)
    })
  })

  describe('verificación y aprobación', () => {
    it('debería mover la empresa a la cola de aprobación', async () => {
      const request = aRequest()
      await registerAndVerify(request)

      const user = await prisma.user.findUniqueOrThrow({
        where: { email: request.email.toLowerCase() },
      })
      const membership = await prisma.membership.findFirstOrThrow({
        where: { userId: user.id },
        include: { account: true },
      })

      expect(user.emailVerifiedAt).not.toBeNull()
      expect(membership.account.status).toBe('PENDING_APPROVAL')
    })

    it('debería dejar el enlace consumido y sin segundo uso', async () => {
      const request = aRequest()
      await register.execute(request)
      const token = await verificationTokenFor(prisma, request.email.toLowerCase())

      await verifyEmail.execute(token)
      await expect(verifyEmail.execute(token)).rejects.toThrow()

      const stored = await prisma.oneTimeToken.findFirstOrThrow()
      expect(stored.consumedAt).not.toBeNull()
    })

    it('debería dejar pasar un solo consumo ante dos peticiones simultáneas', async () => {
      // La comprobación vive en el `WHERE`, no en un `if`: dos clics rápidos en el enlace
      // del correo llegan de verdad a la vez.
      const request = aRequest()
      await register.execute(request)
      const token = await verificationTokenFor(prisma, request.email.toLowerCase())

      const results = await Promise.allSettled([
        verifyEmail.execute(token),
        verifyEmail.execute(token),
      ])

      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    })
  })

  describe('login', () => {
    it('debería abrir sesión y guardar sólo el hash del refresh', async () => {
      const request = aRequest()
      await registerAndVerify(request)
      await approveAccounts(prisma)

      const result = await login.execute({
        email: request.email,
        password: PASSWORD,
        ip: '203.0.113.10',
        userAgent: 'vitest',
      })

      expect(result.activeAccountId).not.toBeNull()

      const stored = await prisma.refreshToken.findFirstOrThrow()
      expect(stored.tokenHash).not.toBe(result.session.refreshToken)
      expect(stored.state).toBe('ACTIVE')
      expect(await prisma.session.count()).toBe(1)
    })

    it('debería rechazar la contraseña incorrecta con el mismo error que un email desconocido', async () => {
      const request = aRequest()
      await registerAndVerify(request)

      const wrongPassword = login.execute({
        email: request.email,
        password: 'otra-contrasena-larga',
        ip: null,
        userAgent: null,
      })
      const unknownEmail = login.execute({
        email: 'nadie@ferreteria.test',
        password: PASSWORD,
        ip: null,
        userAgent: null,
      })

      await expect(wrongPassword).rejects.toMatchObject({ code: 'AUTH_INVALID_CREDENTIALS' })
      await expect(unknownEmail).rejects.toMatchObject({ code: 'AUTH_INVALID_CREDENTIALS' })
    })

    it('debería impedir entrar sin verificar el correo', async () => {
      const request = aRequest()
      await register.execute(request)

      await expect(
        login.execute({ email: request.email, password: PASSWORD, ip: null, userAgent: null }),
      ).rejects.toMatchObject({ code: 'AUTH_EMAIL_NOT_VERIFIED' })
    })
  })

  describe('rotación de refresh', () => {
    it('debería rotar y dejar el anterior como usado', async () => {
      const session = await openSession(prisma, registerAndVerify, login, aRequest())

      const rotated = await refresh.execute(session.refreshToken)

      const tokens = await prisma.refreshToken.findMany({ orderBy: { createdAt: 'asc' } })
      expect(tokens).toHaveLength(2)
      expect(tokens[0]?.state).toBe('USED')
      expect(tokens[1]?.state).toBe('ACTIVE')
      expect(rotated.refreshToken).not.toBe(session.refreshToken)
    })

    it('debería revocar la familia entera al reutilizar un token', async () => {
      const session = await openSession(prisma, registerAndVerify, login, aRequest())
      await refresh.execute(session.refreshToken)

      await expect(refresh.execute(session.refreshToken)).rejects.toMatchObject({
        code: 'AUTH_SESSION_EXPIRED',
      })

      const tokens = await prisma.refreshToken.findMany()
      expect(tokens.every((token) => token.state === 'REVOKED')).toBe(true)
      const stored = await prisma.session.findFirstOrThrow()
      expect(stored.revokedAt).not.toBeNull()
    })

    it('debería dejar rotar a una sola de dos peticiones simultáneas', async () => {
      // Sin el `WHERE state = 'ACTIVE'` de la actualización, las dos rotarían y quedarían
      // dos familias válidas: la detección de robo dejaría de funcionar.
      const session = await openSession(prisma, registerAndVerify, login, aRequest())

      const results = await Promise.allSettled([
        refresh.execute(session.refreshToken),
        refresh.execute(session.refreshToken),
      ])

      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    })
  })

  describe('cierre de sesión', () => {
    it('debería invalidar la sesión en el servidor', async () => {
      const session = await openSession(prisma, registerAndVerify, login, aRequest())

      await logout.execute(session.refreshToken)

      const stored = await prisma.session.findFirstOrThrow()
      expect(stored.revokedAt).not.toBeNull()
      await expect(refresh.execute(session.refreshToken)).rejects.toThrow()
    })
  })

  describe('recuperación de contraseña', () => {
    it('debería cambiar la contraseña y cerrar todas las sesiones', async () => {
      const request = aRequest()
      const session = await openSession(prisma, registerAndVerify, login, request)

      await requestReset.execute(request.email)
      const event = await prisma.outboxEvent.findFirstOrThrow({
        where: { type: 'identity.PasswordResetRequested.v1' },
      })
      const token = (event.payload as { token: string }).token

      await resetPassword.execute({ token, password: 'la-nueva-contrasena-larga' })

      const sessions = await prisma.session.findMany()
      expect(sessions.every((row) => row.revokedAt !== null)).toBe(true)
      await expect(refresh.execute(session.refreshToken)).rejects.toThrow()

      // Y la contraseña nueva funciona.
      await expect(
        login.execute({
          email: request.email,
          password: 'la-nueva-contrasena-larga',
          ip: null,
          userAgent: null,
        }),
      ).resolves.toMatchObject({ userId: expect.any(String) as unknown as string })
    })

    it('no debería filtrar si el email existe', async () => {
      await expect(requestReset.execute('nadie@ferreteria.test')).resolves.toBeUndefined()
      expect(await prisma.oneTimeToken.count()).toBe(0)
    })
  })
})

// --- utilidades -------------------------------------------------------------

async function cleanUp(prisma: PrismaService): Promise<void> {
  // El orden importa: las membresías cuelgan de la cuenta, y los tokens del usuario.
  await prisma.membership.deleteMany()
  await prisma.account.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.session.deleteMany()
  await prisma.oneTimeToken.deleteMany()
  await prisma.user.deleteMany()
  // SÓLO los eventos de este contexto. `shared.outbox_events` la comparte todo el sistema:
  // vaciarla entera borraba las filas que los tests de `apps/workers` estaban leyendo en
  // ese mismo momento, y el fallo aparecía en el otro paquete.
  await prisma.outboxEvent.deleteMany({ where: { type: { startsWith: 'identity.' } } })
}

async function verificationTokenFor(prisma: PrismaService, email: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { email } })
  const event = await prisma.outboxEvent.findFirstOrThrow({
    where: { type: 'identity.EmailVerificationRequested.v1' },
    orderBy: { createdAt: 'desc' },
  })
  const payload = event.payload as { userId: string; token: string }

  if (payload.userId !== user.id) throw new Error('El evento no corresponde a este usuario')
  return payload.token
}

/** El staff aprueba: sin esto no hay cuenta activa y la sesión abre sin `acc`. */
async function approveAccounts(prisma: PrismaService): Promise<void> {
  await prisma.account.updateMany({
    where: { status: 'PENDING_APPROVAL' },
    data: { status: 'ACTIVE' },
  })
}

async function openSession(
  prisma: PrismaService,
  registerAndVerify: (request: RegisterRequest) => Promise<void>,
  login: LoginUseCase,
  request: RegisterRequest,
): Promise<{ refreshToken: string; sessionId: string }> {
  await registerAndVerify(request)
  await approveAccounts(prisma)

  const result = await login.execute({
    email: request.email,
    password: PASSWORD,
    ip: null,
    userAgent: null,
  })

  return { refreshToken: result.session.refreshToken, sessionId: result.session.sessionId }
}
