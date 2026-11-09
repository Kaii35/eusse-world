import { randomUUID } from 'node:crypto'

import { Test } from '@nestjs/testing'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module'
import { DomainExceptionFilter } from '../src/common/domain-exception.filter'
import { PrismaService } from '../src/shared-kernel/infrastructure/prisma.service'

import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

/**
 * Sesión por cookies de punta a punta (ADR-0008): registro, verificación, login, uso de la
 * cookie en otro módulo, refresh y logout. Contra HTTP y PostgreSQL reales.
 *
 * Se salta si no hay base de datos. Requiere el mismo `.env` que los demás tests.
 */
const enabled = Boolean(process.env.DATABASE_URL) && Boolean(process.env.JWT_ACCESS_SECRET)

const PASSWORD = 'una-contrasena-muy-larga'

type Reply = { status: number; json: Record<string, unknown>; cookies: Map<string, string> }

function cookiesFrom(response: Response): Map<string, string> {
  const map = new Map<string, string>()
  for (const raw of response.headers.getSetCookie()) {
    const [pair] = raw.split(';')
    const index = pair!.indexOf('=')
    map.set(pair!.slice(0, index), pair!.slice(index + 1))
  }
  return map
}

function cookieHeader(cookies: Map<string, string>): string {
  return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
}

describe.runIf(enabled)('Sesión por cookies', () => {
  let app: INestApplication
  let prisma: PrismaService
  let baseUrl: string

  async function call(
    method: string,
    path: string,
    options: { body?: unknown; cookies?: Map<string, string> } = {},
  ): Promise<Reply> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (options.cookies) headers.Cookie = cookieHeader(options.cookies)
    const init: RequestInit = { method, headers }
    if (options.body !== undefined) init.body = JSON.stringify(options.body)
    const response = await fetch(`${baseUrl}/api/v1${path}`, init)
    const text = await response.text()
    return {
      status: response.status,
      json: text ? (JSON.parse(text) as Record<string, unknown>) : {},
      cookies: cookiesFrom(response),
    }
  }

  async function verificationTokenFor(email: string): Promise<string> {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } })
    // Se filtra por usuario: otras pruebas escriben en la misma base en paralelo.
    const event = await prisma.outboxEvent.findFirstOrThrow({
      where: {
        type: 'identity.EmailVerificationRequested.v1',
        payload: { path: ['userId'], equals: user.id },
      },
      orderBy: { createdAt: 'desc' },
    })
    return (event.payload as { token: string }).token
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication({ bufferLogs: true })
    app.setGlobalPrefix('api/v1')
    app.useGlobalFilters(new DomainExceptionFilter())
    await app.listen(0, '127.0.0.1')
    const server = app.getHttpServer() as Server
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
    prisma = app.get(PrismaService)
  })

  afterAll(async () => {
    await app.close()
  })

  it('debería completar registro, verificación, login y uso de la cookie', async () => {
    const unique = randomUUID().slice(0, 8)
    const email = `sesion-${unique}@proveedor.test`

    const registered = await call('POST', '/auth/register', {
      body: {
        email,
        password: PASSWORD,
        firstName: 'Lucía',
        lastName: 'Restrepo',
        company: {
          legalName: `Proveedora ${unique} SAS`,
          taxId: `8${unique.replace(/\D/g, '1').padEnd(8, '7')}`,
          phone: '+57 3001234567',
        },
      },
    })
    expect(registered.status).toBe(202)

    const verified = await call('POST', '/auth/verify-email', {
      body: { token: await verificationTokenFor(email) },
    })
    expect(verified.status).toBe(200)

    const login = await call('POST', '/auth/login', { body: { email, password: PASSWORD } })
    expect(login.status).toBe(200)
    expect(login.cookies.has('eusse_at')).toBe(true)
    expect(login.cookies.has('eusse_rt')).toBe(true)
    const session = login.cookies

    const me = await call('GET', '/auth/me', { cookies: session })
    expect(me.status).toBe(200)
    expect(me.json.userId).toEqual(expect.any(String))

    // La misma cookie debe servir en otro módulo: la identidad sale de la sesión.
    const supplier = await call('POST', '/supplier/register', {
      cookies: session,
      body: {
        legalName: `Taller ${unique}`,
        taxId: `7${unique.replace(/\D/g, '2').padEnd(8, '3')}`,
      },
    })
    expect(supplier.status).toBe(201)

    const refreshed = await call('POST', '/auth/refresh', { cookies: session })
    expect(refreshed.status).toBe(200)
    expect(refreshed.cookies.get('eusse_rt')).not.toBe(session.get('eusse_rt'))

    const logout = await call('POST', '/auth/logout', { cookies: refreshed.cookies })
    expect(logout.status).toBe(204)
  })

  it('no debería iniciar sesión con una contraseña incorrecta', async () => {
    const response = await call('POST', '/auth/login', {
      body: { email: 'nadie@proveedor.test', password: 'otra-contrasena-larga' },
    })

    expect(response.status).toBe(401)
    expect(response.json.code).toBe('AUTH_INVALID_CREDENTIALS')
    expect(response.cookies.size).toBe(0)
  })

  it('no debería aceptar un access token inventado en la cookie', async () => {
    const forged = new Map([['eusse_at', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.firma-falsa']])

    const response = await call('GET', '/supplier/me', { cookies: forged })

    expect(response.status).toBe(401)
    expect(response.json.code).toBe('AUTH_SESSION_EXPIRED')
  })
})
