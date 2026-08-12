import { ACCOUNT_ROLE, type AccountRole } from '@eusse/contracts'

/**
 * Permisos efectivos por rol (RFC-0003 §4.5).
 *
 * Se evalúan **en el servidor y por operación**, nunca en el token: revocar un permiso
 * tiene que surtir efecto ya, no cuando caduque el access token.
 *
 * Un permiso autoriza la *operación*; que el recurso concreto pertenezca a la cuenta de la
 * sesión es una comprobación **aparte** que hace el repositorio. Las dos hacen falta: un
 * `ADMIN` de la cuenta A con `order:read` no puede leer las órdenes de la cuenta B.
 *
 * Este archivo vive en `domain/`: cero framework.
 */

export const PERMISSION = {
  CATALOG_READ: 'catalog:read',
  /** Ver precios de la cuenta. Sin cuenta activa no hay precios que enseñar. */
  PRICE_READ: 'price:read',
  CART_MANAGE: 'cart:manage',
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_APPROVE: 'order:approve',
  ORDER_CANCEL: 'order:cancel',
  ACCOUNT_READ: 'account:read',
  /** Datos de la empresa, direcciones, datos de facturación. */
  ACCOUNT_MANAGE: 'account:manage',
  ACCOUNT_MANAGE_USERS: 'account:manage-users',
  /** Ceder la propiedad de la cuenta. Sólo el OWNER. */
  ACCOUNT_TRANSFER_OWNERSHIP: 'account:transfer-ownership',
} as const

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION]

/** Lo que puede hacer cualquiera que pertenezca a la cuenta, sea cual sea su rol. */
const BASE: readonly Permission[] = [
  PERMISSION.CATALOG_READ,
  PERMISSION.PRICE_READ,
  PERMISSION.ORDER_READ,
  PERMISSION.ACCOUNT_READ,
]

const ADMIN: readonly Permission[] = [
  ...BASE,
  PERMISSION.CART_MANAGE,
  PERMISSION.ORDER_CREATE,
  PERMISSION.ORDER_APPROVE,
  PERMISSION.ORDER_CANCEL,
  PERMISSION.ACCOUNT_MANAGE,
  PERMISSION.ACCOUNT_MANAGE_USERS,
]

/**
 * Matriz rol → permisos.
 *
 * Dos decisiones que conviene confirmar con negocio, porque son política de empresa y no
 * restricciones técnicas:
 *
 *   1. **`APPROVER` no crea pedidos.** Separación de funciones: quien aprueba no es quien
 *      compra. Si en la práctica la misma persona hace ambas cosas, la respuesta correcta
 *      es darle rol `ADMIN`, no ampliar `APPROVER` — porque entonces habría que impedir
 *      además que apruebe sus propios pedidos, y esa regla vive en Orders (RFC-0007).
 *   2. **`ADMIN` puede todo salvo ceder la propiedad.** Es lo único reservado al `OWNER`.
 */
const BY_ROLE: Readonly<Record<AccountRole, readonly Permission[]>> = {
  [ACCOUNT_ROLE.OWNER]: [...ADMIN, PERMISSION.ACCOUNT_TRANSFER_OWNERSHIP],
  [ACCOUNT_ROLE.ADMIN]: ADMIN,
  [ACCOUNT_ROLE.BUYER]: [...BASE, PERMISSION.CART_MANAGE, PERMISSION.ORDER_CREATE],
  [ACCOUNT_ROLE.APPROVER]: [...BASE, PERMISSION.ORDER_APPROVE, PERMISSION.ORDER_CANCEL],
  [ACCOUNT_ROLE.VIEWER]: BASE,
}

export function permissionsFor(role: AccountRole): readonly Permission[] {
  return BY_ROLE[role]
}

export function roleHas(role: AccountRole, permission: Permission): boolean {
  return BY_ROLE[role].includes(permission)
}
