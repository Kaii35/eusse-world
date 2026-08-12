import {
  ACCOUNT_ROLE,
  ACCOUNT_STATUS,
  type AccountRole,
  type AccountStatus,
} from '@eusse/contracts'
import { Money } from '@eusse/domain'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Agregado `Account`: la empresa cliente (docs/02-domain-model.md §2).
 *
 * En B2B la cuenta —no el usuario— es quien compra, quien tiene precios y crédito.
 * Casi todas las decisiones del sistema se derivan de eso.
 *
 * Este archivo vive en `domain/`: cero NestJS, cero Prisma. Se testea sin base de datos.
 */

export type Membership = {
  readonly userId: string
  readonly role: AccountRole
  /** Monto sobre el que el pedido requiere aprobación. `null` = sin límite. */
  readonly approvalThreshold: Money | null
}

export class LastOwnerError extends DomainError {
  override readonly name = 'LastOwnerError'

  constructor() {
    super(
      'AUTH_FORBIDDEN',
      'La cuenta debe conservar al menos un OWNER. Asigna otro antes de continuar.',
    )
  }
}

export class AccountNotActiveError extends DomainError {
  override readonly name = 'AccountNotActiveError'

  constructor(status: AccountStatus) {
    super('ACCOUNT_NOT_ACTIVE', `La cuenta está en estado ${status} y no puede comprar`, {
      status,
    })
  }
}

export class InvalidAccountTransitionError extends DomainError {
  override readonly name = 'InvalidAccountTransitionError'

  constructor(from: AccountStatus, to: AccountStatus) {
    super('ORDER_INVALID_TRANSITION', `Una cuenta no puede pasar de ${from} a ${to}`, {
      from,
      to,
    })
  }
}

/** Transiciones permitidas (docs/02-domain-model.md §4). Lo no listado es un error. */
const ALLOWED_TRANSITIONS: Readonly<Record<AccountStatus, readonly AccountStatus[]>> = {
  PENDING_VERIFICATION: [ACCOUNT_STATUS.PENDING_APPROVAL, ACCOUNT_STATUS.CLOSED],
  PENDING_APPROVAL: [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.REJECTED, ACCOUNT_STATUS.CLOSED],
  ACTIVE: [ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.CLOSED],
  SUSPENDED: [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.CLOSED],
  REJECTED: [ACCOUNT_STATUS.CLOSED],
  CLOSED: [],
}

export type AccountSnapshot = {
  readonly id: string
  readonly tenantId: string
  readonly legalName: string
  readonly taxId: string
  readonly status: AccountStatus
  readonly creditLimit: Money
  readonly memberships: readonly Membership[]
}

export class Account {
  private constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly legalName: string,
    readonly taxId: string,
    private status: AccountStatus,
    private creditLimit: Money,
    private memberships: readonly Membership[],
  ) {}

  /**
   * Reconstruye desde persistencia.
   *
   * Valida los invariantes también aquí: si la base de datos tiene una cuenta sin
   * OWNER, es un bug que debe salir a la luz al cargarla, no tres pantallas después.
   */
  static fromSnapshot(snapshot: AccountSnapshot): Account {
    assertHasOwner(snapshot.memberships)
    return new Account(
      snapshot.id,
      snapshot.tenantId,
      snapshot.legalName,
      snapshot.taxId,
      snapshot.status,
      snapshot.creditLimit,
      snapshot.memberships,
    )
  }

  /** Una cuenta nueva nace pendiente de verificar y con su creador como OWNER. */
  static register(params: {
    id: string
    tenantId: string
    legalName: string
    taxId: string
    ownerUserId: string
    currency: Money['currency']
  }): Account {
    return new Account(
      params.id,
      params.tenantId,
      params.legalName,
      params.taxId,
      ACCOUNT_STATUS.PENDING_VERIFICATION,
      Money.zero(params.currency),
      [{ userId: params.ownerUserId, role: ACCOUNT_ROLE.OWNER, approvalThreshold: null }],
    )
  }

  get currentStatus(): AccountStatus {
    return this.status
  }

  get members(): readonly Membership[] {
    return this.memberships
  }

  get availableCredit(): Money {
    return this.creditLimit
  }

  /** Sólo una cuenta ACTIVE puede comprar (regla CHK-01). */
  canPurchase(): boolean {
    return this.status === ACCOUNT_STATUS.ACTIVE
  }

  assertCanPurchase(): void {
    if (!this.canPurchase()) throw new AccountNotActiveError(this.status)
  }

  transitionTo(next: AccountStatus): void {
    if (!ALLOWED_TRANSITIONS[this.status].includes(next)) {
      throw new InvalidAccountTransitionError(this.status, next)
    }
    this.status = next
  }

  memberOf(userId: string): Membership | undefined {
    return this.memberships.find((member) => member.userId === userId)
  }

  addMember(member: Membership): void {
    if (this.memberOf(member.userId)) {
      throw new DomainError('AUTH_FORBIDDEN', 'El usuario ya pertenece a esta cuenta')
    }
    this.memberships = [...this.memberships, member]
  }

  /**
   * Elimina un miembro.
   *
   * Invariante: la cuenta nunca se queda sin OWNER. Sin esto, una cuenta puede quedar
   * huérfana y nadie podría volver a administrarla — sólo se arregla desde la base de
   * datos, que es exactamente lo que el back-office existe para evitar.
   */
  removeMember(userId: string): void {
    const remaining = this.memberships.filter((member) => member.userId !== userId)
    assertHasOwner(remaining)
    this.memberships = remaining
  }

  /** Cambia el rol de un miembro, sin dejar la cuenta sin OWNER. */
  changeRole(userId: string, role: AccountRole): void {
    const updated = this.memberships.map((member) =>
      member.userId === userId ? { ...member, role } : member,
    )
    assertHasOwner(updated)
    this.memberships = updated
  }

  setCreditLimit(limit: Money): void {
    // `Money` ya impide importes negativos: el invariante vive en el value object,
    // no repetido aquí (skills/domain-driven-design.md).
    this.creditLimit = limit
  }

  toSnapshot(): AccountSnapshot {
    return {
      id: this.id,
      tenantId: this.tenantId,
      legalName: this.legalName,
      taxId: this.taxId,
      status: this.status,
      creditLimit: this.creditLimit,
      memberships: this.memberships,
    }
  }
}

function assertHasOwner(memberships: readonly Membership[]): void {
  if (!memberships.some((member) => member.role === ACCOUNT_ROLE.OWNER)) {
    throw new LastOwnerError()
  }
}
