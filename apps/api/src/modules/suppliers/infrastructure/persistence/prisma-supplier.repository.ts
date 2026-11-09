import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import { Prisma, type Supplier as SupplierRow } from '@prisma/client'

import { ENV } from '../../../../config/config.module'
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { Supplier } from '../../domain/supplier.entity'

import type { Env } from '../../../../config/env.schema'
import type { SupplierRepository } from '../../domain/ports/supplier.repository.port'

/**
 * Adaptador Prisma de `SupplierRepository`. Es el único sitio del módulo que conoce las
 * columnas: el dominio nunca ve una fila.
 */
@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  private readonly tenantId: string

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ENV) env: Env,
  ) {
    this.tenantId = env.TENANT_ID
  }

  async findById(id: string): Promise<Supplier | null> {
    const row = await this.prisma.supplier.findUnique({ where: { id } })
    return row ? toDomain(row) : null
  }

  async findByMemberUserId(userId: string): Promise<Supplier | null> {
    const member = await this.prisma.supplierMember.findUnique({
      where: { userId },
      include: { supplier: true },
    })
    return member ? toDomain(member.supplier) : null
  }

  async findByTaxId(taxId: string): Promise<Supplier | null> {
    const row = await this.prisma.supplier.findFirst({ where: { taxId } })
    return row ? toDomain(row) : null
  }

  async listActive(): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { legalName: 'asc' },
      take: 200,
    })
    return rows.map(toDomain)
  }

  async insertWithMember(supplier: Supplier, memberUserId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.supplier.create({ data: toRow(supplier, this.tenantId) })
      await tx.supplierMember.create({
        data: {
          id: randomUUID(),
          supplierId: supplier.id,
          userId: memberUserId,
        },
      })
    })
  }

  async update(supplier: Supplier): Promise<void> {
    const { id, ...data } = toRow(supplier, this.tenantId)
    await this.prisma.supplier.update({ where: { id }, data })
  }
}

function toDomain(row: SupplierRow): Supplier {
  return Supplier.restore({
    id: row.id,
    legalName: row.legalName,
    taxId: row.taxId,
    status: row.status as Supplier['status'],
    rejectionReason: row.rejectionReason,
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt,
  })
}

function toRow(supplier: Supplier, tenantId: string): Prisma.SupplierUncheckedCreateInput {
  return {
    id: supplier.id,
    tenantId,
    legalName: supplier.legalName,
    taxId: supplier.taxId,
    status: supplier.status,
    rejectionReason: supplier.rejectionReason,
    approvedBy: supplier.approvedBy,
    approvedAt: supplier.approvedAt,
  }
}
