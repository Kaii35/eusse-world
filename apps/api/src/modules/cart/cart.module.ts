import { Module } from '@nestjs/common'

import { SuppliersModule } from '../suppliers/suppliers.module'

import { AddCartLineUseCase } from './application/add-cart-line.use-case'
import { GetCartUseCase } from './application/get-cart.use-case'
import { RemoveCartLineUseCase } from './application/remove-cart-line.use-case'
import { CART_LINE_REPOSITORY } from './domain/ports/cart-line.repository.port'
import { PrismaCartLineRepository } from './infrastructure/persistence/prisma-cart-line.repository'
import { CartController } from './interface/http/cart.controller'

/**
 * Módulo Cart (RFC-0006, RFC-0016). Sólo importa el `public/` de Suppliers, nunca su dominio.
 */
@Module({
  imports: [SuppliersModule],
  controllers: [CartController],
  providers: [
    AddCartLineUseCase,
    GetCartUseCase,
    RemoveCartLineUseCase,
    { provide: CART_LINE_REPOSITORY, useClass: PrismaCartLineRepository },
  ],
})
export class CartModule {}
