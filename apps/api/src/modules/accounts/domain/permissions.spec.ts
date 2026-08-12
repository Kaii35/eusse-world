import { ACCOUNT_ROLE } from '@eusse/contracts'
import { describe, expect, it } from 'vitest'

import { PERMISSION, permissionsFor, roleHas } from './permissions'

describe('matriz de permisos', () => {
  it('debería dar al OWNER todo, incluida la cesión de propiedad', () => {
    const owner = permissionsFor(ACCOUNT_ROLE.OWNER)

    expect(owner).toEqual(expect.arrayContaining(Object.values(PERMISSION)))
  })

  it('debería reservar la cesión de propiedad al OWNER', () => {
    // Lo único que un ADMIN no puede hacer.
    for (const role of [
      ACCOUNT_ROLE.ADMIN,
      ACCOUNT_ROLE.BUYER,
      ACCOUNT_ROLE.APPROVER,
      ACCOUNT_ROLE.VIEWER,
    ]) {
      expect(roleHas(role, PERMISSION.ACCOUNT_TRANSFER_OWNERSHIP)).toBe(false)
    }
  })

  it('debería impedir que el APPROVER cree pedidos', () => {
    // Separación de funciones: quien aprueba no compra. Si hace falta que sea la misma
    // persona, la respuesta es darle rol ADMIN, no ampliar APPROVER.
    expect(roleHas(ACCOUNT_ROLE.APPROVER, PERMISSION.ORDER_CREATE)).toBe(false)
    expect(roleHas(ACCOUNT_ROLE.APPROVER, PERMISSION.ORDER_APPROVE)).toBe(true)
  })

  it('debería impedir que el BUYER apruebe sus propios pedidos', () => {
    // Es el motivo de que exista el umbral de aprobación.
    expect(roleHas(ACCOUNT_ROLE.BUYER, PERMISSION.ORDER_CREATE)).toBe(true)
    expect(roleHas(ACCOUNT_ROLE.BUYER, PERMISSION.ORDER_APPROVE)).toBe(false)
  })

  it('debería dejar al VIEWER en sólo lectura', () => {
    const viewer = permissionsFor(ACCOUNT_ROLE.VIEWER)

    expect(viewer).toContain(PERMISSION.ORDER_READ)
    expect(viewer).toContain(PERMISSION.PRICE_READ)
    for (const escritura of [
      PERMISSION.CART_MANAGE,
      PERMISSION.ORDER_CREATE,
      PERMISSION.ORDER_APPROVE,
      PERMISSION.ORDER_CANCEL,
      PERMISSION.ACCOUNT_MANAGE,
      PERMISSION.ACCOUNT_MANAGE_USERS,
    ]) {
      expect(viewer).not.toContain(escritura)
    }
  })

  it('debería dejar gestionar usuarios sólo a OWNER y ADMIN', () => {
    expect(roleHas(ACCOUNT_ROLE.OWNER, PERMISSION.ACCOUNT_MANAGE_USERS)).toBe(true)
    expect(roleHas(ACCOUNT_ROLE.ADMIN, PERMISSION.ACCOUNT_MANAGE_USERS)).toBe(true)
    expect(roleHas(ACCOUNT_ROLE.BUYER, PERMISSION.ACCOUNT_MANAGE_USERS)).toBe(false)
    expect(roleHas(ACCOUNT_ROLE.APPROVER, PERMISSION.ACCOUNT_MANAGE_USERS)).toBe(false)
  })

  it('debería dar a todo miembro lectura de catálogo, precios, pedidos y cuenta', () => {
    for (const role of Object.values(ACCOUNT_ROLE)) {
      const permissions = permissionsFor(role)
      expect(permissions).toContain(PERMISSION.CATALOG_READ)
      expect(permissions).toContain(PERMISSION.PRICE_READ)
      expect(permissions).toContain(PERMISSION.ORDER_READ)
      expect(permissions).toContain(PERMISSION.ACCOUNT_READ)
    }
  })

  it('no debería repetir permisos en ningún rol', () => {
    // Un duplicado saldría tal cual en `/me` y en la UI.
    for (const role of Object.values(ACCOUNT_ROLE)) {
      const permissions = permissionsFor(role)
      expect(new Set(permissions).size).toBe(permissions.length)
    }
  })
})
