import { Inject, Injectable } from '@nestjs/common'

import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../domain/ports/supplier.repository.port'

import type { Supplier } from '../domain/supplier.entity'

/** Proveedores que un comerciante puede ver: solo los activos. */
@Injectable()
export class ListActiveSuppliersUseCase {
  constructor(@Inject(SUPPLIER_REPOSITORY) private readonly suppliers: SupplierRepository) {}

  execute(): Promise<Supplier[]> {
    return this.suppliers.listActive()
  }
}
