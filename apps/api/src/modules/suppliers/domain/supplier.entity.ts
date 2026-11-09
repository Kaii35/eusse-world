import { SUPPLIER_STATUS, SUPPLIER_TEXT_LIMITS, type SupplierStatus } from '@eusse/contracts'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Agregado `Supplier`: el proveedor que vende prendas al por mayor (RFC-0016 §4.1, §4.6).
 *
 * Invariantes:
 *   · Nace en `PENDING_REVIEW`. Nada de lo que hace un proveedor sin aprobación es válido.
 *   · Solo `ACTIVE` puede publicar productos o recibir pedidos (I-4).
 *   · Rechazar y suspender exigen motivo, para poder explicarlo y auditarlo.
 *
 * Este archivo vive en `domain/`: sin NestJS, sin Prisma, sin HTTP.
 */

/** Transiciones permitidas. Cualquier otra se rechaza con `SUPPLIER_INVALID_TRANSITION`. */
const ALLOWED_TRANSITIONS: Readonly<Record<SupplierStatus, readonly SupplierStatus[]>> = {
  PENDING_REVIEW: [SUPPLIER_STATUS.ACTIVE, SUPPLIER_STATUS.REJECTED],
  ACTIVE: [SUPPLIER_STATUS.SUSPENDED],
  SUSPENDED: [SUPPLIER_STATUS.ACTIVE],
  REJECTED: [],
}

export class InvalidSupplierTransitionError extends DomainError {
  override readonly name = 'InvalidSupplierTransitionError'

  constructor(from: SupplierStatus, to: SupplierStatus) {
    super('SUPPLIER_INVALID_TRANSITION', `Un proveedor no puede pasar de ${from} a ${to}`, {
      from,
      to,
    })
  }
}

export class SupplierReasonRequiredError extends DomainError {
  override readonly name = 'SupplierReasonRequiredError'

  constructor(action: string) {
    super('COMMON_VALIDATION_FAILED', `Para ${action} hace falta indicar el motivo`, {
      field: 'reason',
    })
  }
}

export type SupplierProps = {
  readonly id: string
  readonly legalName: string
  readonly taxId: string
  readonly status: SupplierStatus
  readonly rejectionReason: string | null
  readonly approvedBy: string | null
  readonly approvedAt: Date | null
}

export class Supplier {
  private constructor(private props: SupplierProps) {}

  /** Alta de un proveedor. Queda pendiente de revisión por Operaciones (P3). */
  static register(input: { id: string; legalName: string; taxId: string }): Supplier {
    const legalName = input.legalName.trim()
    const taxId = input.taxId.trim()
    if (legalName.length === 0 || legalName.length > SUPPLIER_TEXT_LIMITS.legalName) {
      throw new DomainError('COMMON_VALIDATION_FAILED', 'Razón social no válida', {
        field: 'legalName',
      })
    }
    if (taxId.length < 3 || taxId.length > SUPPLIER_TEXT_LIMITS.taxId) {
      throw new DomainError('COMMON_VALIDATION_FAILED', 'Documento tributario no válido', {
        field: 'taxId',
      })
    }
    return new Supplier({
      id: input.id,
      legalName,
      taxId,
      status: SUPPLIER_STATUS.PENDING_REVIEW,
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
    })
  }

  /** Reconstruye un proveedor desde persistencia. No valida transiciones: el dato ya es válido. */
  static restore(props: SupplierProps): Supplier {
    return new Supplier({ ...props })
  }

  get id(): string {
    return this.props.id
  }

  get legalName(): string {
    return this.props.legalName
  }

  get taxId(): string {
    return this.props.taxId
  }

  get status(): SupplierStatus {
    return this.props.status
  }

  get rejectionReason(): string | null {
    return this.props.rejectionReason
  }

  get approvedBy(): string | null {
    return this.props.approvedBy
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt
  }

  /** Única puerta para publicar productos y recibir pedidos (I-4). */
  canAcceptOrders(): boolean {
    return this.props.status === SUPPLIER_STATUS.ACTIVE
  }

  /** Operaciones aprueba el proveedor. `actorId` queda registrado para auditoría. */
  approve(actorId: string, at: Date): Supplier {
    this.transitionTo(SUPPLIER_STATUS.ACTIVE)
    return this.with({ status: SUPPLIER_STATUS.ACTIVE, approvedBy: actorId, approvedAt: at })
  }

  reject(reason: string): Supplier {
    const trimmed = requireReason(reason, 'rechazar')
    this.transitionTo(SUPPLIER_STATUS.REJECTED)
    return this.with({ status: SUPPLIER_STATUS.REJECTED, rejectionReason: trimmed })
  }

  /** Suspende al proveedor: deja de aceptar pedidos nuevos; los abiertos siguen. */
  suspend(reason: string): Supplier {
    const trimmed = requireReason(reason, 'suspender')
    this.transitionTo(SUPPLIER_STATUS.SUSPENDED)
    return this.with({ status: SUPPLIER_STATUS.SUSPENDED, rejectionReason: trimmed })
  }

  reactivate(): Supplier {
    this.transitionTo(SUPPLIER_STATUS.ACTIVE)
    return this.with({ status: SUPPLIER_STATUS.ACTIVE, rejectionReason: null })
  }

  private transitionTo(next: SupplierStatus): void {
    if (!ALLOWED_TRANSITIONS[this.props.status].includes(next)) {
      throw new InvalidSupplierTransitionError(this.props.status, next)
    }
  }

  private with(patch: Partial<SupplierProps>): Supplier {
    return new Supplier({ ...this.props, ...patch })
  }
}

function requireReason(reason: string, action: string): string {
  const trimmed = reason.trim()
  if (trimmed.length === 0) throw new SupplierReasonRequiredError(action)
  return trimmed
}
