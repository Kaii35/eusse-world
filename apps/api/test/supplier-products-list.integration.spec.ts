import { randomUUID } from 'node:crypto'

import { Test } from '@nestjs/testing'
import { SignJWT } from 'jose'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module'
import { DomainExceptionFilter } from '../src/common/domain-exception.filter'

import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

/**
 * El panel del proveedor lista TODOS sus productos, borradores incluidos, y sólo los suyos.
 */
const enabled = Boolean(process.env.DATABASE_URL) && Boolean(process.env.JWT_ACCESS_SECRET)
const OPS_USER = randomUUID()
const TENANT = process.env.TENANT_ID ?? 'eusse'

async function tokenFor(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
  return new SignJWT({ sid: randomUUID(), acc: null, ten: TENANT })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret)
}

function taxId(): string {
  return `9${Math.floor(Math.random() * 1e8)
    .toString()
    .padStart(8, '0')}`
}

const PRODUCT = {
  name: 'Sudadera cuello redondo',
  category: 'Sudaderas',
  basePrice: { amount: 1190, currency: 'COP' },
  colors: ['Negro'],
  sizes: ['M'],
  printOptions: [],
}

describe.runIf(enabled)('Listado de productos propios del proveedor', () => {
  let app: INestApplication
  let baseUrl: string

  async function call(
    method: string,
    path: string,
    user: string | null,
    body?: unknown,
  ): Promise<{ status: number; json: unknown }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (user) headers.Authorization = `Bearer ${await tokenFor(user)}`
    const init: RequestInit = { method, headers }
    if (body !== undefined) init.body = JSON.stringify(body)
    const response = await fetch(`${baseUrl}/api/v1${path}`, init)
    const text = await response.text()
    return { status: response.status, json: text ? (JSON.parse(text) as unknown) : {} }
  }

  beforeAll(async () => {
    process.env.OPS_USER_IDS = OPS_USER
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication({ bufferLogs: true })
    app.setGlobalPrefix('api/v1')
    app.useGlobalFilters(new DomainExceptionFilter())
    await app.listen(0, '127.0.0.1')
    const server = app.getHttpServer() as Server
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    await app.close()
  })

  it('debería listar también los borradores y no los de otro proveedor', async () => {
    const owner = randomUUID()
    const other = randomUUID()

    const supplier = await call('POST', '/supplier/register', owner, {
      legalName: 'Listado SAS',
      taxId: taxId(),
    })
    const supplierId = (supplier.json as { id: string }).id
    await call('POST', `/admin/suppliers/${supplierId}/decision`, OPS_USER, { action: 'APPROVE' })
    const draft = await call('POST', '/supplier/products', owner, PRODUCT)
    expect(draft.status).toBe(201)

    await call('POST', '/supplier/register', other, { legalName: 'Otro SAS', taxId: taxId() })
    const otherList = await call('GET', '/supplier/products', other)
    expect(otherList.status).toBe(200)
    expect(otherList.json).toEqual([])

    const mine = await call('GET', '/supplier/products', owner)
    expect(mine.status).toBe(200)
    const list = mine.json as { status: string; id: string }[]
    expect(list.map((p) => p.id)).toContain((draft.json as { id: string }).id)
    expect(list.some((p) => p.status === 'DRAFT')).toBe(true)
  })

  it('debería responder 404 a quien no tiene proveedor', async () => {
    const response = await call('GET', '/supplier/products', randomUUID())

    expect(response.status).toBe(404)
  })
})
