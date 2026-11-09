import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common'

import { AuthGuard } from '../../../../common/auth.guard'
import { ListActiveSuppliersUseCase } from '../../application/list-active-suppliers.use-case'
import { ListSupplierProductsUseCase } from '../../application/list-supplier-products.use-case'

import { toProductDto, toPublicSupplierDto } from './supplier.dto'

/** Vista de los comerciantes. Requiere sesión: el catálogo y sus precios no son públicos. */
@Controller('suppliers')
@UseGuards(AuthGuard)
export class PublicSupplierController {
  constructor(
    @Inject(ListActiveSuppliersUseCase) private readonly listActive: ListActiveSuppliersUseCase,
    @Inject(ListSupplierProductsUseCase) private readonly listProducts: ListSupplierProductsUseCase,
  ) {}

  @Get()
  async list() {
    const suppliers = await this.listActive.execute()
    return suppliers.map(toPublicSupplierDto)
  }

  @Get(':id/products')
  async products(@Param('id') id: string) {
    const products = await this.listProducts.execute(id)
    return products.map(toProductDto)
  }
}
