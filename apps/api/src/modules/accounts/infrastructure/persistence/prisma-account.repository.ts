import { randomUUID } from 'node:crypto'

import {
  ACCOUNT_ROLE,
  ACCOUNT_STATUS,
  type AccountRole,
  type AccountStatus,
} from '@eusse/contracts'
import { Money } from '@eusse/domain'
import { Inject, Injectable } from '@nestjs/common'

import type { Currency } from '@eusse/domain'

import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service'
import { TransactionContext } from '../../../../shared-kernel/infrastructure/transaction-context'
import { Account, type AccountSummary, type Membership } from '../../domain/account.entity'

import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port'
import type { Account as AccountRow, Membership as MembershipRow } from '@prisma/client'

/**
 * Repositorio de cuentas sobre Prisma.
 *
 * Nota sobre el dinero: en la base de datos se guarda el importe en **unidades mínimas**
 * dentro de un `numeric(18,4)`. `Decimal.toNumber()` es seguro aquí porque el valor es un
 * entero de centavos, no un decimal con parte fraccionaria que pudiera perder precisión.
 */
@Injectable()
export class PrismaAccountRepository implements AccountRepositoryPort {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TransactionContext) private readonly tx: TransactionContext,
  ) {}

  async create(account: Account): Promise<void> {
    const snapshot = account.toSnapshot()

    await this.tx.client(this.prisma).account.create({
      data: {
        id: snapshot.id,
        tenantId: snapshot.tenantId,
        legalName: snapshot.legalName,
        taxId: snapshot.taxId,
        phone: snapshot.phone,
        status: snapshot.status,
        creditLimitAmount: snapshot.creditLimit.amount,
        creditLimitCurrency: snapshot.creditLimit.currency,
        memberships: {
          create: snapshot.memberships.map((member) => ({
            id: randomUUID(),
            userId: member.userId,
            role: member.role,
            approvalThresholdAmount: member.approvalThreshold?.amount ?? null,
            approvalThresholdCurrency: member.approvalThreshold?.currency ?? null,
          })),
        },
      },
    })
  }

  async findById(accountId: string): Promise<Account | null> {
    const row = await this.tx.client(this.prisma).account.findUnique({
      where: { id: accountId },
      include: { memberships: true },
    })
    return row ? toDomain(row, row.memberships) : null
  }

  async save(account: Account): Promise<void> {
    const snapshot = account.toSnapshot()
    const client = this.tx.client(this.prisma)

    await client.account.update({
      where: { id: snapshot.id },
      data: {
        legalName: snapshot.legalName,
        phone: snapshot.phone,
        status: snapshot.status,
        creditLimitAmount: snapshot.creditLimit.amount,
        creditLimitCurrency: snapshot.creditLimit.currency,
      },
    })

    // Las membresías se reconcilian por completo: el agregado es la fuente de verdad y
    // aplicar sólo diferencias abriría la puerta a que una eliminación se perdiera.
    await client.membership.deleteMany({
      where: {
        accountId: snapshot.id,
        userId: { notIn: snapshot.memberships.map((member) => member.userId) },
      },
    })

    for (const member of snapshot.memberships) {
      await client.membership.upsert({
        where: { accountId_userId: { accountId: snapshot.id, userId: member.userId } },
        create: {
          id: randomUUID(),
          accountId: snapshot.id,
          userId: member.userId,
          role: member.role,
          approvalThresholdAmount: member.approvalThreshold?.amount ?? null,
          approvalThresholdCurrency: member.approvalThreshold?.currency ?? null,
        },
        update: {
          role: member.role,
          approvalThresholdAmount: member.approvalThreshold?.amount ?? null,
          approvalThresholdCurrency: member.approvalThreshold?.currency ?? null,
        },
      })
    }
  }

  async membershipsOf(userId: string): Promise<readonly AccountSummary[]> {
    const rows = await this.tx.client(this.prisma).membership.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: 'asc' },
    })

    return rows.map((row) => toSummary(row, row.account))
  }

  async membershipOf(userId: string, accountId: string): Promise<AccountSummary | null> {
    const row = await this.tx.client(this.prisma).membership.findUnique({
      where: { accountId_userId: { accountId, userId } },
      include: { account: true },
    })

    return row ? toSummary(row, row.account) : null
  }
}

function toDomain(row: AccountRow, memberships: readonly MembershipRow[]): Account {
  return Account.fromSnapshot({
    id: row.id,
    tenantId: row.tenantId,
    legalName: row.legalName,
    taxId: row.taxId,
    phone: row.phone,
    status: toStatus(row.status),
    creditLimit: Money.of(row.creditLimitAmount.toNumber(), toCurrency(row.creditLimitCurrency)),
    memberships: memberships.map(toMembership),
  })
}

function toMembership(row: MembershipRow): Membership {
  return {
    userId: row.userId,
    role: toRole(row.role),
    approvalThreshold:
      row.approvalThresholdAmount && row.approvalThresholdCurrency
        ? Money.of(
            row.approvalThresholdAmount.toNumber(),
            toCurrency(row.approvalThresholdCurrency),
          )
        : null,
  }
}

function toSummary(row: MembershipRow, account: AccountRow): AccountSummary {
  return {
    accountId: account.id,
    legalName: account.legalName,
    status: toStatus(account.status),
    role: toRole(row.role),
    approvalThreshold: row.approvalThresholdAmount?.toNumber() ?? null,
  }
}

/**
 * Las columnas de estado y rol son `varchar`, no enums de PostgreSQL. Un valor desconocido
 * se resuelve siempre al más restrictivo: `CLOSED` no compra y `VIEWER` no escribe. Fallar
 * cerrado ante una fila corrupta.
 */
function toStatus(value: string): AccountStatus {
  return value in ACCOUNT_STATUS ? (value as AccountStatus) : ACCOUNT_STATUS.CLOSED
}

function toRole(value: string): AccountRole {
  return value in ACCOUNT_ROLE ? (value as AccountRole) : ACCOUNT_ROLE.VIEWER
}

function toCurrency(value: string): Currency {
  // Si la moneda guardada no existe, `Money` lanzará. Es lo correcto: un importe sin
  // moneda válida no se puede interpretar, y adivinarla sería peor.
  return value as Currency
}
