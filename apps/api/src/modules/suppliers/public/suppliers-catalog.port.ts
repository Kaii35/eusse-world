import type { PrintTechnique } from '@eusse/contracts'
import type { Money } from '@eusse/domain'

/**
 * Fachada pública del contexto Suppliers para el carrito (RFC-0016 §4.4).
 *
 * Es lo único que otros módulos pueden importar de Suppliers. Devuelve datos planos y el
 * precio que calcula el servidor: el carrito nunca recibe un agregado ni calcula precios.
 */
export type PrintChoice = {
  readonly technique: PrintTechnique
  readonly size: string
  readonly placement: string
}

export type LineQuoteRequest = {
  readonly productId: string
  readonly color: string
  /** Tallas con cantidad mayor que cero. */
  readonly sizes: readonly string[]
  readonly print: PrintChoice | null
}

export type LineQuote = {
  readonly productId: string
  readonly supplierId: string
  /** Precio por unidad, con el estampado incluido si lo hay. Lo calcula el servidor. */
  readonly unitPrice: Money
}

export type SuppliersCatalogPort = {
  /**
   * Cotiza una línea del carrito. Si el producto no está a la venta (no publicado, o su
   * proveedor no está activo) responde 404, igual que si no existiera.
   */
  quoteLine(request: LineQuoteRequest): Promise<LineQuote>
}

export const SUPPLIERS_CATALOG_PORT = Symbol('SUPPLIERS_CATALOG_PORT')
