import { cartLineAddRequest } from '@eusse/contracts'
import { Money } from '@eusse/domain'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'

import { AuthGuard, userIdOf, type AuthedRequest } from '../../../../common/auth.guard'
import { parseBody } from '../../../../common/parse-body'
import { AddCartLineUseCase } from '../../application/add-cart-line.use-case'
import { GetCartUseCase, type CartView } from '../../application/get-cart.use-case'
import { RemoveCartLineUseCase } from '../../application/remove-cart-line.use-case'
import { lineTotal, type CartLine } from '../../domain/cart-line'

/** Carrito del comerciante. Todo sale de la sesión: ninguna ruta recibe un `ownerId`. */
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(
    @Inject(GetCartUseCase) private readonly getCart: GetCartUseCase,
    @Inject(AddCartLineUseCase) private readonly addLine: AddCartLineUseCase,
    @Inject(RemoveCartLineUseCase) private readonly removeLine: RemoveCartLineUseCase,
  ) {}

  @Get()
  async show(@Req() request: AuthedRequest) {
    const view = await this.getCart.execute(userIdOf(request))
    return toCartDto(view)
  }

  @Post('lines')
  async add(@Req() request: AuthedRequest, @Body() body: unknown) {
    const input = parseBody(cartLineAddRequest, body)
    const line = await this.addLine.execute(userIdOf(request), input)
    return toLineDto(line)
  }

  @Delete('lines/:id')
  @HttpCode(204)
  async remove(@Req() request: AuthedRequest, @Param('id') id: string): Promise<void> {
    await this.removeLine.execute(userIdOf(request), id)
  }
}

function toLineDto(line: CartLine) {
  const total = lineTotal(line)
  return {
    id: line.id,
    productId: line.productId,
    supplierId: line.supplierId,
    color: line.color,
    qtyBySize: { ...line.qtyBySize },
    print: line.print,
    unitPrice: { amount: line.unitPrice.amount, currency: line.unitPrice.currency },
    lineTotal: { amount: total.amount, currency: total.currency },
    pricedAt: line.pricedAt.toISOString(),
  }
}

/**
 * Subtotal por proveedor calculado en el servidor. La interfaz lo muestra tal cual: ningún
 * total se calcula en el navegador (CLAUDE.md).
 */
function toCartDto(view: CartView) {
  return {
    lines: view.lines.map(toLineDto),
    suppliers: view.suppliers.map((supplier) => {
      const own = view.lines.filter((line) => line.supplierId === supplier.supplierId)
      const currency = own[0]?.unitPrice.currency ?? 'COP'
      const subtotal = Money.sum(
        own.map((line) => lineTotal(line)),
        currency,
      )
      return {
        ...supplier,
        subtotal: { amount: subtotal.amount, currency: subtotal.currency },
      }
    }),
  }
}
