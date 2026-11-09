import { Money, type Currency } from '@eusse/domain'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma, type CartLine as CartLineRow } from '@prisma/client'

import type { PrintChoiceDto, PrintTechnique } from '@eusse/contracts'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'

import type { CartLine } from '../../domain/cart-line'
import type { CartLineRepository } from '../../domain/ports/cart-line.repository.port'

/** Adaptador Prisma del carrito. Las columnas no salen de este archivo. */
@Injectable()
export class PrismaCartLineRepository implements CartLineRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listByOwner(ownerUserId: string): Promise<CartLine[]> {
    const rows = await this.prisma.cartLine.findMany({
      where: { ownerUserId },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    return rows.map(toDomain)
  }

  async findOwned(lineId: string, ownerUserId: string): Promise<CartLine | null> {
    const row = await this.prisma.cartLine.findFirst({ where: { id: lineId, ownerUserId } })
    return row ? toDomain(row) : null
  }

  async insert(line: CartLine): Promise<void> {
    await this.prisma.cartLine.create({ data: toRow(line) })
  }

  async delete(lineId: string): Promise<void> {
    await this.prisma.cartLine.delete({ where: { id: lineId } })
  }
}

function toDomain(row: CartLineRow): CartLine {
  const print: PrintChoiceDto | null =
    row.printTechnique && row.printSize && row.printPlacement
      ? {
          technique: row.printTechnique as PrintTechnique,
          size: row.printSize,
          placement: row.printPlacement,
        }
      : null
  return {
    id: row.id,
    ownerUserId: row.ownerUserId,
    productId: row.productId,
    supplierId: row.supplierId,
    color: row.color,
    qtyBySize: row.qtyBySize as Record<string, number>,
    print,
    unitPrice: Money.of(Number(row.unitPriceAmount), row.unitPriceCurrency as Currency),
    pricedAt: row.pricedAt,
  }
}

function toRow(line: CartLine): Prisma.CartLineUncheckedCreateInput {
  return {
    id: line.id,
    ownerUserId: line.ownerUserId,
    productId: line.productId,
    supplierId: line.supplierId,
    color: line.color,
    qtyBySize: { ...line.qtyBySize },
    printTechnique: line.print?.technique ?? null,
    printSize: line.print?.size ?? null,
    printPlacement: line.print?.placement ?? null,
    unitPriceAmount: line.unitPrice.amount,
    unitPriceCurrency: line.unitPrice.currency,
    pricedAt: line.pricedAt,
  }
}
