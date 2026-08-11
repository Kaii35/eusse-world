declare const brand: unique symbol

/**
 * Tipo con marca: impide pasar un `AccountId` donde se espera un `UserId`,
 * aunque ambos sean `string` en tiempo de ejecución (docs/03-conventions.md §5).
 *
 * ```ts
 * type OrderId = Brand<string, 'OrderId'>
 * ```
 */
export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand }

/** Construye un valor con marca. La validación es responsabilidad de quien llama. */
export function brandValue<T, TBrand extends string>(value: T): Brand<T, TBrand> {
  return value as Brand<T, TBrand>
}
