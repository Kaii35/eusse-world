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
 * Carrito del comerciante (RFC-0006, RFC-0016 R-01) sobre HTTP y PostgreSQL reales.
 *
 * Lo que se prueba aquí: el precio sale del servidor aunque el cliente envíe otro, el
 * mínimo se cuenta por proveedor, un comerciante no ve ni borra el carrito de otro, y un
 * producto no publicado o con un estampado no ofrecido no se puede agregar.
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

describe.runIf(enabled)('Carrito sobre HTTP y PostgreSQL', () => {
  let app: INestApplication
  let baseUrl: string
  let productId: string
  let otherSupplierProductId: string
  let draftProductId: string
  let lineId: string

  const merchantA = randomUUID()
  const merchantB = randomUUID()
  const supplierOwner = randomUUID()
  const supplierOwnerTwo = randomUUID()

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

  /** Crea un proveedor aprobado con un producto publicado y devuelve el ID del producto. */
  async function publishedProductFor(owner: string, legalName: string): Promise<string> {
    const supplier = await call('POST', '/supplier/register', owner, {
      legalName,
      taxId: taxId(),
    })
    await call('POST', `/admin/suppliers/${supplier.json.id as string}/decision`, OPS_USER, {
      action: 'APPROVE',
    })
    const product = await call('POST', '/supplier/products', owner, PRODUCT)
    const published = await call(
      'POST',
      `/supplier/products/${product.json.id as string}/publish`,
      owner,
    )
    expect(published.status).toBe(200)
    return product.json.id as string
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

    productId = await publishedProductFor(supplierOwner, 'Textiles Carrito SAS')
    otherSupplierProductId = await publishedProductFor(supplierOwnerTwo, 'Confección Dos SAS')

    // Un producto aprobado pero todavía en borrador: no debe poder agregarse al carrito.
    const draftOwner = randomUUID()
    const draftSupplier = await call('POST', '/supplier/register', draftOwner, {
      legalName: 'Borrador SAS',
      taxId: taxId(),
    })
    await call('POST', `/admin/suppliers/${draftSupplier.json.id as string}/decision`, OPS_USER, {
      action: 'APPROVE',
    })
    const draftProduct = await call('POST', '/supplier/products', draftOwner, PRODUCT)
    expect(draftProduct.status).toBe(201)
    draftProductId = draftProduct.json.id as string
  })

  afterAll(async () => {
    await app.close()
  })

  it('debería cotizar en el servidor y mostrar el mínimo del proveedor', async () => {
    const added = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Negro',
      qtyBySize: { S: 2, M: 4 },
      print: null,
    })

    expect(added.status).toBe(201)
    expect(added.json.unitPrice).toEqual({ amount: 480, currency: 'COP' })
    lineId = added.json.id as string

    const cart = await call('GET', '/cart', merchantA)
    const suppliers = cart.json.suppliers as Record<string, unknown>[]
    expect(suppliers).toEqual([
      expect.objectContaining({
        units: 6,
        required: 6,
        met: true,
        missing: 0,
        // 6 unidades a 480 centavos: el total lo calcula el servidor.
        subtotal: { amount: 2880, currency: 'COP' },
      }),
    ])
    const lines = cart.json.lines as Record<string, unknown>[]
    expect(lines[0]).toMatchObject({ lineTotal: { amount: 2880, currency: 'COP' } })
  })

  it('debería ignorar un precio enviado por el cliente', async () => {
    const added = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Blanco',
      qtyBySize: { L: 1 },
      print: null,
      unitPrice: { amount: 1, currency: 'COP' },
      unit_price: 1,
    })

    expect(added.status).toBe(201)
    expect(added.json.unitPrice).toEqual({ amount: 480, currency: 'COP' })
  })

  it('debería sumar el costo del estampado al precio por unidad', async () => {
    const added = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Negro',
      qtyBySize: { S: 1 },
      print: { technique: 'DTF', size: '20x25', placement: 'Frente' },
    })

    expect(added.status).toBe(201)
    expect(added.json.unitPrice).toEqual({ amount: 600, currency: 'COP' })
  })

  it('debería contar el mínimo por proveedor, no sobre todo el carrito', async () => {
    await call('POST', '/cart/lines', merchantA, {
      productId: otherSupplierProductId,
      color: 'Negro',
      qtyBySize: { M: 3 },
      print: null,
    })

    const cart = await call('GET', '/cart', merchantA)
    const suppliers = cart.json.suppliers as Record<string, unknown>[]
    expect(suppliers).toHaveLength(2)
    const second = suppliers.find((s) => s.units === 3)
    expect(second).toMatchObject({ met: false, missing: 3 })
  })

  it('no debería mostrar el carrito de otro comerciante', async () => {
    const cart = await call('GET', '/cart', merchantB)

    expect(cart.status).toBe(200)
    expect(cart.json.lines).toEqual([])
    expect(cart.json.suppliers).toEqual([])
  })

  it('no debería borrar una línea ajena', async () => {
    const response = await call('DELETE', `/cart/lines/${lineId}`, merchantB)

    expect(response.status).toBe(404)
    expect(response.json.code).toBe('COMMON_NOT_FOUND')
  })

  it('no debería agregar un color que el proveedor no declara', async () => {
    const response = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Verde',
      qtyBySize: { S: 1 },
      print: null,
    })

    expect(response.status).toBe(400)
    expect(response.json.code).toBe('COMMON_VALIDATION_FAILED')
  })

  it('no debería agregar un estampado que el proveedor no ofrece', async () => {
    const response = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Negro',
      qtyBySize: { S: 1 },
      print: { technique: 'EMBROIDERY', size: '20x25', placement: 'Frente' },
    })

    expect(response.status).toBe(422)
    expect(response.json.code).toBe('SUPPLIER_PRINT_NOT_AVAILABLE')
  })

  it('no debería agregar cantidades inválidas', async () => {
    const response = await call('POST', '/cart/lines', merchantA, {
      productId,
      color: 'Negro',
      qtyBySize: { S: 0 },
      print: null,
    })

    expect(response.status).toBe(400)
  })

  it('no debería agregar un producto que no está a la venta', async () => {
    const response = await call('POST', '/cart/lines', merchantA, {
      productId: draftProductId,
      color: 'Negro',
      qtyBySize: { S: 1 },
      print: null,
    })

    expect(response.status).toBe(404)
    expect(response.json.code).toBe('COMMON_NOT_FOUND')
  })

  it('debería quitar una línea propia', async () => {
    const response = await call('DELETE', `/cart/lines/${lineId}`, merchantA)

    expect(response.status).toBe(204)
    const cart = await call('GET', '/cart', merchantA)
    const lines = cart.json.lines as Record<string, unknown>[]
    expect(lines.map((l) => l.id)).not.toContain(lineId)
  })
})
