import { randomUUID } from 'node:crypto'

import { Test } from '@nestjs/testing'
import { SignJWT } from 'jose'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module'
import { DomainExceptionFilter } from '../src/common/domain-exception.filter'
import { PrismaService } from '../src/shared-kernel/infrastructure/prisma.service'

import type { INestApplication } from '@nestjs/common'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

/**
 * Marketplace mayorista (RFC-0016) sobre HTTP y PostgreSQL reales.
 *
 * Lo que prueba aquí y un doble no puede: que la sesión decide la identidad, que un
 * proveedor no ve ni toca lo ajeno (404, no 403), que la publicación exige datos
 * completos y que el estampado se guarda en la misma transacción que el producto.
 *
 * Requiere `DATABASE_URL`, `REDIS_URL` y `JWT_ACCESS_SECRET` (véase `.env.example`). Se
 * salta si no hay base de datos.
 */
const enabled = Boolean(process.env.DATABASE_URL) && Boolean(process.env.JWT_ACCESS_SECRET)

const OPS_USER = randomUUID()
const TENANT = process.env.TENANT_ID ?? 'eusse'

/** Firma un access token con el mismo secreto y las mismas claims que emite Identity. */
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

const VALID_PRODUCT = {
  name: 'Camiseta básica 180 g',
  category: 'Camisetas',
  basePrice: { amount: 480, currency: 'COP' },
  colors: ['Negro', 'Blanco'],
  sizes: ['S', 'M', 'L'],
  printOptions: [
    {
      technique: 'DTF',
      sizes: ['20x25'],
      placements: ['Frente'],
      unitFee: { amount: 120, currency: 'COP' },
    },
  ],
}

describe.runIf(enabled)('Suppliers sobre HTTP y PostgreSQL', () => {
  let app: INestApplication
  let prisma: PrismaService
  let baseUrl: string

  let ownerA: string
  let ownerB: string
  let merchant: string
  let supplierAId: string
  let productId: string

  async function call(
    method: string,
    path: string,
    user: string | null,
    body?: unknown,
  ): Promise<{ status: number; json: Record<string, unknown> }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (user) headers.Authorization = `Bearer ${await tokenFor(user)}`
    const init: RequestInit = { method, headers }
    if (body !== undefined) init.body = JSON.stringify(body)
    const response = await fetch(`${baseUrl}/api/v1${path}`, init)
    const text = await response.text()
    return {
      status: response.status,
      json: text ? (JSON.parse(text) as Record<string, unknown>) : {},
    }
  }

  beforeAll(async () => {
    // Operaciones se configura antes de compilar: la lista se lee al arrancar.
    process.env.OPS_USER_IDS = OPS_USER

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication({ bufferLogs: true })
    app.setGlobalPrefix('api/v1')
    app.useGlobalFilters(new DomainExceptionFilter())
    await app.listen(0, '127.0.0.1')
    const server = app.getHttpServer() as Server
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
    prisma = app.get(PrismaService)

    ownerA = randomUUID()
    ownerB = randomUUID()
    merchant = randomUUID()
  })

  afterAll(async () => {
    await app.close()
  })

  it('debería rechazar cualquier ruta del proveedor sin sesión', async () => {
    const response = await call('GET', '/supplier/me', null)

    expect(response.status).toBe(401)
    expect(response.json.code).toBe('AUTH_SESSION_EXPIRED')
  })

  it('debería registrar un proveedor en estado pendiente de revisión', async () => {
    const response = await call('POST', '/supplier/register', ownerA, {
      legalName: 'Textiles Andinos SAS',
      taxId: taxId(),
    })

    expect(response.status).toBe(201)
    expect(response.json.status).toBe('PENDING_REVIEW')
    supplierAId = response.json.id as string
  })

  it('no debería registrar dos proveedores con el mismo usuario', async () => {
    const response = await call('POST', '/supplier/register', ownerA, {
      legalName: 'Otro nombre',
      taxId: taxId(),
    })

    expect(response.status).toBe(409)
    expect(response.json.code).toBe('SUPPLIER_ALREADY_REGISTERED')
  })

  it('no debería registrar un documento tributario ya usado', async () => {
    const existing = await prisma.supplier.findUniqueOrThrow({ where: { id: supplierAId } })

    const response = await call('POST', '/supplier/register', ownerB, {
      legalName: 'Copia',
      taxId: existing.taxId,
    })

    expect(response.status).toBe(409)
    expect(response.json.code).toBe('SUPPLIER_TAX_ID_TAKEN')
  })

  it('debería rechazar un registro con campos inválidos y decir cuáles', async () => {
    const response = await call('POST', '/supplier/register', ownerB, { legalName: '' })

    expect(response.status).toBe(400)
    expect(response.json.code).toBe('COMMON_VALIDATION_FAILED')
    const issues = (response.json.meta as { issues: { path: string }[] }).issues
    expect(issues.map((i) => i.path)).toEqual(expect.arrayContaining(['legalName', 'taxId']))
  })

  it('no debería crear productos mientras el proveedor no está activo', async () => {
    const response = await call('POST', '/supplier/products', ownerA, VALID_PRODUCT)

    expect(response.status).toBe(409)
    expect(response.json.code).toBe('SUPPLIER_NOT_ACTIVE')
  })

  it('no debería permitir que un usuario sin rol de Operaciones apruebe', async () => {
    const response = await call('POST', `/admin/suppliers/${supplierAId}/decision`, ownerA, {
      action: 'APPROVE',
    })

    expect(response.status).toBe(403)
  })

  it('debería aprobar al proveedor cuando decide Operaciones', async () => {
    const response = await call('POST', `/admin/suppliers/${supplierAId}/decision`, OPS_USER, {
      action: 'APPROVE',
    })

    expect(response.status).toBe(200)
    expect(response.json.status).toBe('ACTIVE')

    const row = await prisma.supplier.findUniqueOrThrow({ where: { id: supplierAId } })
    expect(row.approvedBy).toBe(OPS_USER)
  })

  it('debería crear un producto en borrador con estampado', async () => {
    const response = await call('POST', '/supplier/products', ownerA, VALID_PRODUCT)

    expect(response.status).toBe(201)
    expect(response.json.status).toBe('DRAFT')
    productId = response.json.id as string

    const options = await prisma.printOption.findMany({ where: { productId } })
    expect(options).toHaveLength(1)
    expect(options.map((o) => o.technique)).toEqual(['DTF'])
  })

  it('no debería publicar un producto incompleto y decir qué falta', async () => {
    const incomplete = await call('POST', '/supplier/products', ownerA, {
      ...VALID_PRODUCT,
      colors: [],
    })
    const response = await call(
      'POST',
      `/supplier/products/${incomplete.json.id as string}/publish`,
      ownerA,
    )

    expect(response.status).toBe(422)
    expect(response.json.code).toBe('SUPPLIER_PRODUCT_INCOMPLETE')
    expect((response.json.meta as { missing: string[] }).missing).toContain('al menos un color')
  })

  it('debería publicar un producto completo', async () => {
    const response = await call('POST', `/supplier/products/${productId}/publish`, ownerA)

    expect(response.status).toBe(200)
    expect(response.json.status).toBe('PUBLISHED')
  })

  it('no debería dejar a un proveedor publicar un producto de otro', async () => {
    // ownerB no tiene proveedor activo: se le responde antes por estado. Para probar la
    // propiedad se usa un producto ajeno con un proveedor activo distinto.
    const other = await call('POST', '/supplier/register', ownerB, {
      legalName: 'Confecciones Sur',
      taxId: taxId(),
    })
    const otherId = other.json.id as string
    await call('POST', `/admin/suppliers/${otherId}/decision`, OPS_USER, { action: 'APPROVE' })

    const response = await call('POST', `/supplier/products/${productId}/publish`, ownerB)

    expect(response.status).toBe(404)
    expect(response.json.code).toBe('COMMON_NOT_FOUND')
  })

  it('debería mostrar a un comerciante los proveedores activos sin el documento tributario', async () => {
    const response = await call('GET', '/suppliers', merchant)
    const list = response.json as unknown as Record<string, unknown>[]

    expect(response.status).toBe(200)
    const mine = list.find((s) => s.id === supplierAId)
    expect(mine).toMatchObject({ legalName: 'Textiles Andinos SAS', status: 'ACTIVE' })
    expect(mine).not.toHaveProperty('taxId')
    expect(list.every((s) => s.status === 'ACTIVE')).toBe(true)
  })

  it('debería mostrar al comerciante sólo los productos publicados', async () => {
    const response = await call('GET', `/suppliers/${supplierAId}/products`, merchant)
    const list = response.json as unknown as Record<string, unknown>[]

    expect(response.status).toBe(200)
    expect(list.map((p) => p.id)).toContain(productId)
    expect(list.every((p) => p.status === 'PUBLISHED')).toBe(true)
  })

  it('debería responder 404 al pedir productos de un proveedor que no está activo', async () => {
    const pending = await call('POST', '/supplier/register', randomUUID(), {
      legalName: 'Pendiente',
      taxId: taxId(),
    })

    const response = await call('GET', `/suppliers/${pending.json.id as string}/products`, merchant)

    expect(response.status).toBe(404)
    expect(response.json.code).toBe('COMMON_NOT_FOUND')
  })

  it('debería exigir motivo al suspender y dejar al proveedor sin pedidos', async () => {
    const missing = await call('POST', `/admin/suppliers/${supplierAId}/decision`, OPS_USER, {
      action: 'SUSPEND',
      reason: '   ',
    })
    expect(missing.status).toBe(400)

    const suspended = await call('POST', `/admin/suppliers/${supplierAId}/decision`, OPS_USER, {
      action: 'SUSPEND',
      reason: 'Revisión de calidad',
    })
    expect(suspended.json.status).toBe('SUSPENDED')

    const create = await call('POST', '/supplier/products', ownerA, VALID_PRODUCT)
    expect(create.json.code).toBe('SUPPLIER_NOT_ACTIVE')

    await call('POST', `/admin/suppliers/${supplierAId}/decision`, OPS_USER, {
      action: 'REACTIVATE',
    })
  })
})
