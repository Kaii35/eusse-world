import { supplierProductCreateRequest, supplierRegistrationRequest } from '@eusse/contracts'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'

import { AuthGuard, type AuthedRequest, userIdOf } from '../../../../common/auth.guard'
import { parseBody } from '../../../../common/parse-body'
import { CreateProductUseCase } from '../../application/create-product.use-case'
import { GetMySupplierUseCase } from '../../application/get-my-supplier.use-case'
import { ListOwnProductsUseCase } from '../../application/list-own-products.use-case'
import { PublishProductUseCase } from '../../application/publish-product.use-case'
import { RegisterSupplierUseCase } from '../../application/register-supplier.use-case'

import { toOwnSupplierDto, toProductDto } from './supplier.dto'

/** Panel del proveedor. Todo sale de la sesión: ninguna ruta recibe un `supplierId`. */
@Controller('supplier')
@UseGuards(AuthGuard)
export class SupplierController {
  constructor(
    @Inject(GetMySupplierUseCase) private readonly getMySupplier: GetMySupplierUseCase,
    @Inject(RegisterSupplierUseCase) private readonly registerSupplier: RegisterSupplierUseCase,
    @Inject(CreateProductUseCase) private readonly createProduct: CreateProductUseCase,
    @Inject(PublishProductUseCase) private readonly publishProduct: PublishProductUseCase,
    @Inject(ListOwnProductsUseCase) private readonly listOwn: ListOwnProductsUseCase,
  ) {}

  @Get('me')
  async me(@Req() request: AuthedRequest) {
    const supplier = await this.getMySupplier.execute(userIdOf(request))
    return toOwnSupplierDto(supplier)
  }

  @Post('register')
  async register(@Req() request: AuthedRequest, @Body() body: unknown) {
    const input = parseBody(supplierRegistrationRequest, body)
    const supplier = await this.registerSupplier.execute(userIdOf(request), input)
    return toOwnSupplierDto(supplier)
  }

  @Get('products')
  async listProducts(@Req() request: AuthedRequest) {
    const products = await this.listOwn.execute(userIdOf(request))
    return products.map(toProductDto)
  }

  @Post('products')
  @HttpCode(201)
  async createProductRoute(@Req() request: AuthedRequest, @Body() body: unknown) {
    const input = parseBody(supplierProductCreateRequest, body)
    const product = await this.createProduct.execute(userIdOf(request), input)
    return toProductDto(product)
  }

  @Post('products/:id/publish')
  @HttpCode(200)
  async publish(@Req() request: AuthedRequest, @Param('id') id: string) {
    const product = await this.publishProduct.execute(userIdOf(request), id)
    return toProductDto(product)
  }
}
