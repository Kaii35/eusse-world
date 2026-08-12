import { ACCOUNT_ROLE, ACCOUNT_STATUS } from '@eusse/contracts'
import { Money } from '@eusse/domain'
import { describe, expect, it } from 'vitest'

import {
  Account,
  AccountNotActiveError,
  InvalidAccountTransitionError,
  LastOwnerError,
  type Membership,
} from './account.entity'

function member(userId: string, role: Membership['role']): Membership {
  return { userId, role, approvalThreshold: null }
}

function anAccount(overrides: Partial<Parameters<typeof Account.fromSnapshot>[0]> = {}): Account {
  return Account.fromSnapshot({
    id: 'acc-1',
    tenantId: 'eusse',
    legalName: 'Ferretería Acme S.A.S.',
    taxId: '900123456-7',
    status: ACCOUNT_STATUS.ACTIVE,
    creditLimit: Money.of(5_000_000, 'COP'),
    memberships: [member('u-owner', ACCOUNT_ROLE.OWNER)],
    ...overrides,
  })
}

describe('registro', () => {
  it('debería nacer pendiente de verificación, con su creador como OWNER', () => {
    const account = Account.register({
      id: 'acc-2',
      tenantId: 'eusse',
      legalName: 'Nueva S.A.S.',
      taxId: '901000000-1',
      ownerUserId: 'u-1',
      currency: 'COP',
    })

    expect(account.currentStatus).toBe(ACCOUNT_STATUS.PENDING_VERIFICATION)
    expect(account.memberOf('u-1')?.role).toBe(ACCOUNT_ROLE.OWNER)
    expect(account.availableCredit.isZero()).toBe(true)
  })

  it('no debería poder comprar recién registrada', () => {
    // Regla IDN-04: una cuenta nueva no compra hasta que el staff la aprueba.
    const account = Account.register({
      id: 'acc-3',
      tenantId: 'eusse',
      legalName: 'Nueva S.A.S.',
      taxId: '901000000-2',
      ownerUserId: 'u-1',
      currency: 'COP',
    })

    expect(account.canPurchase()).toBe(false)
    expect(() => {
      account.assertCanPurchase()
    }).toThrow(AccountNotActiveError)
  })
})

describe('invariante: la cuenta nunca se queda sin OWNER', () => {
  it('debería impedir eliminar al último OWNER', () => {
    // Sin esto la cuenta queda huérfana y sólo se arregla desde la base de datos,
    // que es justo lo que el back-office existe para evitar.
    const account = anAccount()

    expect(() => {
      account.removeMember('u-owner')
    }).toThrow(LastOwnerError)
    expect(account.members).toHaveLength(1)
  })

  it('debería impedir degradar al último OWNER', () => {
    const account = anAccount()

    expect(() => {
      account.changeRole('u-owner', ACCOUNT_ROLE.BUYER)
    }).toThrow(LastOwnerError)
    expect(account.memberOf('u-owner')?.role).toBe(ACCOUNT_ROLE.OWNER)
  })

  it('debería permitir eliminar un OWNER si queda otro', () => {
    const account = anAccount({
      memberships: [member('u-owner', ACCOUNT_ROLE.OWNER), member('u-2', ACCOUNT_ROLE.OWNER)],
    })

    account.removeMember('u-owner')

    expect(account.members).toHaveLength(1)
    expect(account.memberOf('u-2')?.role).toBe(ACCOUNT_ROLE.OWNER)
  })

  it('debería rechazar reconstruir desde persistencia una cuenta sin OWNER', () => {
    // Si la base de datos tiene una cuenta inválida, debe saltar al cargarla, no tres
    // pantallas después.
    expect(() => anAccount({ memberships: [member('u-2', ACCOUNT_ROLE.BUYER)] })).toThrow(
      LastOwnerError,
    )
  })
})

describe('miembros', () => {
  it('debería añadir un comprador', () => {
    const account = anAccount()
    account.addMember(member('u-buyer', ACCOUNT_ROLE.BUYER))

    expect(account.memberOf('u-buyer')?.role).toBe(ACCOUNT_ROLE.BUYER)
  })

  it('debería rechazar añadir dos veces al mismo usuario', () => {
    const account = anAccount()
    expect(() => {
      account.addMember(member('u-owner', ACCOUNT_ROLE.BUYER))
    }).toThrow(/ya pertenece/)
  })

  it('debería permitir cambiar el rol de un miembro que no es el último OWNER', () => {
    const account = anAccount({
      memberships: [member('u-owner', ACCOUNT_ROLE.OWNER), member('u-2', ACCOUNT_ROLE.BUYER)],
    })

    account.changeRole('u-2', ACCOUNT_ROLE.APPROVER)

    expect(account.memberOf('u-2')?.role).toBe(ACCOUNT_ROLE.APPROVER)
  })
})

describe('máquina de estados', () => {
  it('debería recorrer el camino de aprobación', () => {
    const account = anAccount({ status: ACCOUNT_STATUS.PENDING_VERIFICATION })

    account.transitionTo(ACCOUNT_STATUS.PENDING_APPROVAL)
    account.transitionTo(ACCOUNT_STATUS.ACTIVE)

    expect(account.canPurchase()).toBe(true)
  })

  it('debería permitir suspender y reactivar', () => {
    const account = anAccount()

    account.transitionTo(ACCOUNT_STATUS.SUSPENDED)
    expect(account.canPurchase()).toBe(false)

    account.transitionTo(ACCOUNT_STATUS.ACTIVE)
    expect(account.canPurchase()).toBe(true)
  })

  it('debería rechazar saltarse la aprobación', () => {
    const account = anAccount({ status: ACCOUNT_STATUS.PENDING_VERIFICATION })

    expect(() => {
      account.transitionTo(ACCOUNT_STATUS.ACTIVE)
    }).toThrow(InvalidAccountTransitionError)
  })

  it('debería tratar CLOSED como estado final', () => {
    const account = anAccount({ status: ACCOUNT_STATUS.CLOSED })

    for (const status of [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.SUSPENDED]) {
      expect(() => {
        account.transitionTo(status)
      }).toThrow(InvalidAccountTransitionError)
    }
  })

  it('debería impedir comprar en cualquier estado que no sea ACTIVE', () => {
    for (const status of [
      ACCOUNT_STATUS.PENDING_VERIFICATION,
      ACCOUNT_STATUS.PENDING_APPROVAL,
      ACCOUNT_STATUS.SUSPENDED,
      ACCOUNT_STATUS.REJECTED,
      ACCOUNT_STATUS.CLOSED,
    ]) {
      expect(anAccount({ status }).canPurchase()).toBe(false)
    }
  })
})

describe('crédito', () => {
  it('debería actualizar el límite', () => {
    const account = anAccount()
    account.setCreditLimit(Money.of(10_000_000, 'COP'))

    expect(account.availableCredit.amount).toBe(10_000_000)
  })

  it('debería impedir un límite negativo desde el value object', () => {
    // El invariante vive en Money, no repetido en el agregado.
    expect(() => Money.of(-1, 'COP')).toThrow()
  })
})
