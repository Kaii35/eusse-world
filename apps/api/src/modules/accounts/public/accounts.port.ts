import type { AccountRole, AccountStatus } from '@eusse/contracts'

/**
 * Fachada pública del módulo Accounts.
 *
 * Es lo **único** que otros módulos pueden importar de Accounts (regla de fronteras,
 * docs/07-module-dependencies.md). Identity la necesita porque en B2B registrarse crea a
 * la vez una persona y una empresa, y porque la cuenta activa de la sesión sale de aquí.
 *
 * Devuelve datos planos, nunca el agregado `Account`: exponer el agregado convertiría la
 * fachada en una puerta trasera al dominio ajeno.
 */
export type AccountSummary = {
  readonly accountId: string
  readonly legalName: string
  readonly status: AccountStatus
  readonly role: AccountRole
  /** Monto por encima del cual el pedido requiere aprobación. `null` = sin límite. */
  readonly approvalThreshold: number | null
}

export type AccountsPort = {
  /** Crea la cuenta con su registrante como OWNER, en `PENDING_VERIFICATION`. */
  provisionAccount(input: {
    ownerUserId: string
    legalName: string
    taxId: string
    phone: string
  }): Promise<{ accountId: string }>

  membershipsOf(userId: string): Promise<readonly AccountSummary[]>
  membershipOf(userId: string, accountId: string): Promise<AccountSummary | null>

  /** Email verificado: la cuenta pasa a la cola de aprobación del staff (RFC-0003 §4.4). */
  submitForApproval(accountId: string): Promise<void>
}

export const ACCOUNTS_PORT = Symbol('ACCOUNTS_PORT')
