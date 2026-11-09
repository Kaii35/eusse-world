import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'

import type { SupplierRegistrationRequest } from '@eusse/contracts'

import { DomainError } from '../../../shared-kernel/domain/domain-error'
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'
import { Supplier } from '../domain/supplier.entity'

/**
 * Alta de proveedor. El usuario que lo registra queda como administrador y el proveedor
 * nace pendiente de revisión (P3).
 */
@Injectable()
export class RegisterSupplierUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository) {}

  async execute(userId: string, input: SupplierRegistrationRequest): Promise<Supplier> {
    if (await this.suppliers.findByMemberUserId(userId)) {
      throw new DomainError('SUPPLIER_ALREADY_REGISTERED', 'Este usuario ya tiene un proveedor')
    }
    if (await this.suppliers.findByTaxId(input.taxId)) {
      throw new DomainError('SUPPLIER_TAX_ID_TAKEN', 'Este documento tributario ya está registrado')
    }

    const supplier = Supplier.register({
      id: randomUUID(),
      legalName: input.legalName,
      taxId: input.taxId,
    })
    await this.suppliers.insertWithMember(supplier, userId)
    return supplier
  }
}
