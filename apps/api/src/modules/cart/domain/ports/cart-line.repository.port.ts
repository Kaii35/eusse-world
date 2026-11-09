import type { CartLine } from '../cart-line'

/** Puerto de persistencia del carrito. Todas las consultas van filtradas por dueño. */
export type CartLineRepository = {
  listByOwner(ownerUserId: string): Promise<CartLine[]>

  /** Devuelve la línea sólo si pertenece a ese dueño. Si es ajena, `null`. */
  findOwned(lineId: string, ownerUserId: string): Promise<CartLine | null>

  insert(line: CartLine): Promise<void>

  delete(lineId: string): Promise<void>
}

export const CART_LINE_REPOSITORY = Symbol('CART_LINE_REPOSITORY')
