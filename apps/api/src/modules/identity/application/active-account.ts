import { ACCOUNT_STATUS } from '@eusse/contracts'

import type { AccountSummary } from '../../accounts/public/accounts.port'

/**
 * Elige la cuenta activa de una sesión.
 *
 * Sólo una cuenta `ACTIVE` puede ser la cuenta activa. Si ninguna lo es, la sesión se abre
 * **sin** cuenta: el usuario navega el catálogo sin precios hasta que el staff apruebe su
 * empresa (RFC-0003 §4.4).
 *
 * Elegir aquí una cuenta pendiente parecería más amable, pero pondría un `accountId` en el
 * claim `acc` que el resto del sistema interpreta como "puede operar". Es preferible fallar
 * cerrado: sin cuenta, no hay precios que filtrar.
 */
export function pickActiveAccount(memberships: readonly AccountSummary[]): string | null {
  const active = memberships.find((m) => m.status === ACCOUNT_STATUS.ACTIVE)
  return active?.accountId ?? null
}

export function isStillActive(
  memberships: readonly AccountSummary[],
  accountId: string | null,
): boolean {
  if (accountId === null) return false
  return memberships.some((m) => m.accountId === accountId && m.status === ACCOUNT_STATUS.ACTIVE)
}
