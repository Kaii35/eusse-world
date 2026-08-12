import { ACCOUNT_STATUS } from '@eusse/contracts'
import { Inject, Injectable } from '@nestjs/common'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'
import { Account } from '../domain/account.entity'
import {
  ACCOUNT_REPOSITORY,
  type AccountRepositoryPort,
} from '../domain/ports/account.repository.port'
import {
  ACCOUNT_ID_GENERATOR,
  type AccountIdGeneratorPort,
} from '../domain/ports/id-generator.port'
import { TENANT, type TenantPort } from '../domain/ports/tenant.port'

import type { AccountSummary, AccountsPort } from '../public/accounts.port'

/**
 * Implementación de la fachada que consume Identity.
 *
 * Cada método es un caso de uso pequeño; el agregado sigue siendo quien decide. La fachada
 * no toma decisiones de negocio: si aquí apareciera un `if` sobre estados, la máquina de
 * estados del agregado habría dejado de ser la única fuente de verdad.
 */
@Injectable()
export class AccountsFacade implements AccountsPort {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accounts: AccountRepositoryPort,
    @Inject(ACCOUNT_ID_GENERATOR) private readonly ids: AccountIdGeneratorPort,
    @Inject(TENANT) private readonly tenant: TenantPort,
  ) {}

  async provisionAccount(input: {
    ownerUserId: string
    legalName: string
    taxId: string
    phone: string
  }): Promise<{ accountId: string }> {
    const account = Account.register({
      id: this.ids.newId(),
      tenantId: this.tenant.tenantId,
      legalName: input.legalName,
      taxId: input.taxId,
      phone: input.phone,
      ownerUserId: input.ownerUserId,
      currency: this.tenant.defaultCurrency,
    })

    // La unicidad de `taxId` por tenant la impone la base de datos. Comprobarla antes con
    // un SELECT no serviría: dos registros simultáneos la pasarían los dos.
    await this.accounts.create(account)

    return { accountId: account.id }
  }

  membershipsOf(userId: string): Promise<readonly AccountSummary[]> {
    return this.accounts.membershipsOf(userId)
  }

  membershipOf(userId: string, accountId: string): Promise<AccountSummary | null> {
    return this.accounts.membershipOf(userId, accountId)
  }

  async submitForApproval(accountId: string): Promise<void> {
    const account = await this.accounts.findById(accountId)
    if (!account) throw new NotFoundError('Cuenta')

    // El agregado valida la transición. Si la cuenta ya estaba aprobada, esto lanza en vez
    // de devolverla en silencio a la cola del staff.
    account.transitionTo(ACCOUNT_STATUS.PENDING_APPROVAL)
    await this.accounts.save(account)
  }
}
