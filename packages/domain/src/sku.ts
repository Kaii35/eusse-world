import { type Brand, brandValue } from '@eusse/utils'

/**
 * SKU — el código que el comprador B2B conoce de memoria y por el que busca.
 *
 * Único, inmutable y **nunca reutilizado**, ni siquiera tras despublicar el producto:
 * aparece en órdenes históricas y en la contabilidad del cliente
 * (skills/catalog-products.md).
 */
export type Sku = Brand<string, 'Sku'>

const SKU_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,31}$/

export class InvalidSkuError extends Error {
  override readonly name = 'InvalidSkuError'
  readonly code = 'CATALOG_INVALID_SKU'

  constructor(value: string) {
    super(
      `SKU no valido: "${value}". Debe ser mayusculas, digitos y guiones, de 2 a 32 caracteres.`,
    )
  }
}

export function createSku(value: string): Sku {
  const normalized = value.trim().toUpperCase()
  if (!SKU_PATTERN.test(normalized)) throw new InvalidSkuError(value)
  return brandValue<string, 'Sku'>(normalized)
}

export function isValidSku(value: string): boolean {
  return SKU_PATTERN.test(value.trim().toUpperCase())
}
