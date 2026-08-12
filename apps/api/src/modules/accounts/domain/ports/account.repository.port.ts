import type { Account, AccountSummary } from '../account.entity'

/**
 * Repositorio de cuentas.
 *
 * Las consultas por usuario (`membershipsOf`, `membershipOf`) devuelven la vista plana, no
 * el agregado: quien pregunta es Identity para componer la sesión, y no necesita —ni debe
 * tener— el agregado completo de otro contexto.
 */
export type AccountRepositoryPort = {
  create(account: Account): Promise<void>
  findById(accountId: string): Promise<Account | null>
  save(account: Account): Promise<void>
  membershipsOf(userId: string): Promise<readonly AccountSummary[]>
  membershipOf(userId: string, accountId: string): Promise<AccountSummary | null>
}

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY')
