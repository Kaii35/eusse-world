import { randomUUID } from 'node:crypto'

import { Money, type Currency } from '@eusse/domain'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import type { PrintTechnique } from '@eusse/contracts'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { SupplierProduct, type PrintOption } from '../../domain/supplier-product.entity'

import type { SupplierProductRepository } from '../../domain/ports/supplier-product.repository.port'

/** Fila con sus estampados, tal como la devuelve Prisma con `include`. */
type ProductRow = Prisma.SupplierProductGetPayload<{ include: { printOptions: true } }>

/**
 * Adaptador Prisma de `SupplierProductRepository`. Guardar un producto escribe el producto
 * y todos sus estampados en una sola transacción: no existe un producto a medio guardar.
 */
@Injectable()
export class PrismaSupplierProductRepository implements SupplierProductRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SupplierProduct | null> {
    const row = await this.prisma.supplierProduct.findUnique({
      where: { id },
      include: { printOptions: true },
    })
    return row ? toDomain(row) : null
  }

  async listBySupplier(supplierId: string): Promise<SupplierProduct[]> {
    const rows = await this.prisma.supplierProduct.findMany({
      where: { supplierId },
      include: { printOptions: true },
      orderBy: { name: 'asc' },
      take: 500,
    })
    return rows.map(toDomain)
  }

  async save(product: SupplierProduct): Promise<void> {
    const data = toRow(product)
    await this.prisma.$transaction(async (tx) => {
      await tx.supplierProduct.upsert({
        where: { id: product.id },
        create: data.product,
        update: data.product,
      })
      await tx.printOption.deleteMany({ where: { productId: product.id } })
      if (data.printOptions.length > 0) {
        await tx.printOption.createMany({ data: data.printOptions })
      }
    })
  }
}

function toDomain(row: ProductRow): SupplierProduct {
  const currency = row.basePriceCurrency as Currency
  return SupplierProduct.restore({
    id: row.id,
    supplierId: row.supplierId,
    name: row.name,
    category: row.category,
    basePrice: Money.of(Number(row.basePriceAmount), currency),
    colors: row.colors as string[],
    sizes: row.sizes as string[],
    printOptions: row.printOptions.map((option): PrintOption => ({
      technique: option.technique as PrintTechnique,
      sizes: option.sizes as string[],
      placements: option.placements as string[],
      unitFee: Money.of(Number(option.unitFeeAmount), option.unitFeeCurrency as Currency),
    })),
    status: row.status as SupplierProduct['status'],
  })
}

function toRow(product: SupplierProduct): {
  product: Prisma.SupplierProductUncheckedCreateInput
  printOptions: Prisma.PrintOptionCreateManyInput[]
} {
  return {
    product: {
      id: product.id,
      supplierId: product.supplierId,
      name: product.name,
      category: product.category,
      basePriceAmount: product.basePrice.amount,
      basePriceCurrency: product.basePrice.currency,
      colors: [...product.colors],
      sizes: [...product.sizes],
      status: product.status,
    },
    printOptions: product.printOptions.map((option) => ({
      id: randomUUID(),
      productId: product.id,
      technique: option.technique,
      sizes: [...option.sizes],
      placements: [...option.placements],
      unitFeeAmount: option.unitFee.amount,
      unitFeeCurrency: option.unitFee.currency,
    })),
  }
}
