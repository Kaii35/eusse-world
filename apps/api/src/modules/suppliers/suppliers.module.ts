import { Module } from '@nestjs/common'

import { CreateProductUseCase } from './application/create-product.use-case'
import { DecideSupplierUseCase } from './application/decide-supplier.use-case'
import { GetMySupplierUseCase } from './application/get-my-supplier.use-case'
import { ListActiveSuppliersUseCase } from './application/list-active-suppliers.use-case'
import { ListOwnProductsUseCase } from './application/list-own-products.use-case'
import { ListSupplierProductsUseCase } from './application/list-supplier-products.use-case'
import { PublishProductUseCase } from './application/publish-product.use-case'
import { RegisterSupplierUseCase } from './application/register-supplier.use-case'
import { SuppliersCatalogFacade } from './application/suppliers-catalog.facade'
import { SUPPLIER_PRODUCT_REPOSITORY } from './domain/ports/supplier-product.repository.port'
import { SUPPLIER_REPOSITORY } from './domain/ports/supplier.repository.port'
import { PrismaSupplierProductRepository } from './infrastructure/persistence/prisma-supplier-product.repository'
import { PrismaSupplierRepository } from './infrastructure/persistence/prisma-supplier.repository'
import { AdminSupplierController } from './interface/http/admin-supplier.controller'
import { PublicSupplierController } from './interface/http/public-supplier.controller'
import { SupplierController } from './interface/http/supplier.controller'
import { SUPPLIERS_CATALOG_PORT } from './public/suppliers-catalog.port'

/**
 * Módulo Suppliers (RFC-0016). No exporta nada todavía: ningún otro módulo lo necesita
 * hoy. Cuando Cart o Orders lo necesiten, se expone sólo su `public/`.
 */
@Module({
  controllers: [SupplierController, PublicSupplierController, AdminSupplierController],
  providers: [
    RegisterSupplierUseCase,
    GetMySupplierUseCase,
    DecideSupplierUseCase,
    ListActiveSuppliersUseCase,
    CreateProductUseCase,
    PublishProductUseCase,
    ListSupplierProductsUseCase,
    ListOwnProductsUseCase,
    { provide: SUPPLIER_REPOSITORY, useClass: PrismaSupplierRepository },
    { provide: SUPPLIER_PRODUCT_REPOSITORY, useClass: PrismaSupplierProductRepository },
    { provide: SUPPLIERS_CATALOG_PORT, useExisting: SuppliersCatalogFacade },
    SuppliersCatalogFacade,
  ],
  exports: [SUPPLIERS_CATALOG_PORT],
})
export class SuppliersModule {}
