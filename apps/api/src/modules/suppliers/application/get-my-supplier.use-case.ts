import { Inject, Injectable } from '@nestjs/common'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'

import type { Supplier } from '../domain/supplier.entity'

/** Proveedor del usuario de la sesión. Sin proveedor, 404: no hay nada que mostrar. */
@Injectable()
export class GetMySupplierUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository) {}

  async execute(userId: string): Promise<Supplier> {
    const supplier = await this.suppliers.findByMemberUserId(userId)
    if (!supplier) throw new NotFoundError('Proveedor')
    return supplier
  }
}
