import { randomUUID } from 'node:crypto'

import { Module } from '@nestjs/common'

import { ENV } from '../../config/config.module'

import { AccountsFacade } from './application/accounts.facade'
import { ACCOUNT_REPOSITORY } from './domain/ports/account.repository.port'
import { ACCOUNT_ID_GENERATOR } from './domain/ports/id-generator.port'
import { TENANT, type TenantPort } from './domain/ports/tenant.port'
import { PrismaAccountRepository } from './infrastructure/persistence/prisma-account.repository'
import { ACCOUNTS_PORT } from './public/accounts.port'

import type { Env } from '../../config/env.schema'

/**
 * Módulo Accounts.
 *
 * Exporta **sólo** `ACCOUNTS_PORT`: es la única puerta por la que otros módulos pueden
 * entrar (docs/07-module-dependencies.md). El repositorio y el agregado no salen de aquí.
 */
@Module({
  providers: [
    AccountsFacade,
    { provide: ACCOUNT_REPOSITORY, useClass: PrismaAccountRepository },
    { provide: ACCOUNTS_PORT, useExisting: AccountsFacade },
    { provide: ACCOUNT_ID_GENERATOR, useValue: { newId: (): string => randomUUID() } },
    {
      provide: TENANT,
      inject: [ENV],
      useFactory: (env: Env): TenantPort => ({
        tenantId: env.TENANT_ID,
        defaultCurrency: env.DEFAULT_CURRENCY,
      }),
    },
  ],
  exports: [ACCOUNTS_PORT],
})
export class AccountsModule {}
