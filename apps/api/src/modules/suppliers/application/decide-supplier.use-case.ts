import { Inject, Injectable } from '@nestjs/common'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'

import type { Supplier } from '../domain/supplier.entity'

export type SupplierDecision =
  | { readonly action: 'APPROVE' }
  | { readonly action: 'REJECT'; readonly reason: string }
  | { readonly action: 'SUSPEND'; readonly reason: string }
  | { readonly action: 'REACTIVATE' }

/**
 * Decisión de Operaciones sobre un proveedor. El actor se registra en la aprobación para
 * auditoría. La autorización de quien decide la hace el guard del controlador, no este caso.
 */
@Injectable()
export class DecideSupplierUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository) {}

  async execute(
    actorId: string,
    supplierId: string,
    decision: SupplierDecision,
  ): Promise<Supplier> {
    const supplier = await this.suppliers.findById(supplierId)
    if (!supplier) throw new NotFoundError('Proveedor')

    const next = (() => {
      switch (decision.action) {
        case 'APPROVE':
          return supplier.approve(actorId, new Date())
        case 'REJECT':
          return supplier.reject(decision.reason)
        case 'SUSPEND':
          return supplier.suspend(decision.reason)
        case 'REACTIVATE':
          return supplier.reactivate()
      }
    })()

    await this.suppliers.update(next)
    return next
  }
}
