import { Inject, Injectable } from '@nestjs/common'

import { NotFoundError } from '../../../shared-kernel/domain/domain-error'
import {
  CART_LINE_REPOSITORY,
  type CartLineRepository,
} from '../domain/ports/cart-line.repository.port'

/** Quita una línea del carrito. Una línea ajena responde 404. */
@Injectable()
export class RemoveCartLineUseCase {
  constructor(@Inject(CART_LINE_REPOSITORY) private readonly lines: CartLineRepository) {}

  async execute(ownerUserId: string, lineId: string): Promise<void> {
    const line = await this.lines.findOwned(lineId, ownerUserId)
    if (!line) throw new NotFoundError('Línea')
    await this.lines.delete(lineId)
  }
}
