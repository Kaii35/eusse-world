import { type Brand, brandValue } from '@eusse/utils'

/**
 * Identificadores tipados por marca (docs/03-conventions.md §5).
 *
 * Impiden pasar un `AccountId` donde se espera un `UserId`. El compilador previene una
 * clase entera de bugs que en tiempo de ejecución serían fugas de datos entre cuentas.
 *
 * Todos son UUID v7: ordenables en el tiempo, no enumerables y sin filtrar volumen de
 * negocio, a diferencia de los autoincrementales.
 */

export type TenantId = Brand<string, 'TenantId'>
export type UserId = Brand<string, 'UserId'>
export type AccountId = Brand<string, 'AccountId'>
export type MembershipId = Brand<string, 'MembershipId'>
export type SessionId = Brand<string, 'SessionId'>
export type ProductId = Brand<string, 'ProductId'>
export type VariantId = Brand<string, 'VariantId'>
export type CategoryId = Brand<string, 'CategoryId'>
export type PriceListId = Brand<string, 'PriceListId'>
export type CartId = Brand<string, 'CartId'>
export type CartLineId = Brand<string, 'CartLineId'>
export type OrderId = Brand<string, 'OrderId'>
export type OrderLineId = Brand<string, 'OrderLineId'>
export type AddressId = Brand<string, 'AddressId'>
export type EventId = Brand<string, 'EventId'>

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Comprueba la forma de un UUID con variante RFC 4122 (cubre v4 y v7). */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

/** Convierte un string ya validado en un identificador con marca. */
export function toId<T extends string>(value: string): Brand<string, T> {
  return brandValue<string, T>(value)
}
