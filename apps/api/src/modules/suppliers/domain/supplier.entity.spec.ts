import { describe, expect, it } from 'vitest'

import { InvalidSupplierTransitionError, Supplier } from './supplier.entity'

const AT = new Date('2026-11-09T12:00:00Z')
const SUPPLIER_ID = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b'

function newSupplier(): Supplier {
  return Supplier.register({
    id: SUPPLIER_ID,
    legalName: 'Textiles Andinos SAS',
    taxId: '900123456',
  })
}

describe('Supplier · alta', () => {
  it('debería nacer pendiente de revisión y sin poder aceptar pedidos', () => {
    const supplier = newSupplier()

    expect(supplier.status).toBe('PENDING_REVIEW')
    expect(supplier.canAcceptOrders()).toBe(false)
  })

  it('debería rechazar una razón social vacía', () => {
    expect(() =>
      Supplier.register({ id: SUPPLIER_ID, legalName: '   ', taxId: '900123456' }),
    ).toThrow(/Razón social/)
  })

  it('debería rechazar un documento tributario demasiado corto', () => {
    expect(() =>
      Supplier.register({ id: SUPPLIER_ID, legalName: 'Textiles', taxId: '12' }),
    ).toThrow(/Documento tributario/)
  })
})

describe('Supplier · aprobación', () => {
  it('debería activarse al aprobar y registrar quién aprobó', () => {
    const active = newSupplier().approve('ops-user-1', AT)

    expect(active.status).toBe('ACTIVE')
    expect(active.canAcceptOrders()).toBe(true)
    expect(active.approvedBy).toBe('ops-user-1')
    expect(active.approvedAt).toEqual(AT)
  })

  it('debería exigir motivo al rechazar', () => {
    expect(() => newSupplier().reject('  ')).toThrow(/motivo/)
  })

  it('debería guardar el motivo del rechazo', () => {
    const rejected = newSupplier().reject('Documento tributario no coincide')

    expect(rejected.status).toBe('REJECTED')
    expect(rejected.rejectionReason).toBe('Documento tributario no coincide')
  })

  it('no debería reactivar un proveedor rechazado', () => {
    const rejected = newSupplier().reject('Documento no válido')

    expect(() => rejected.approve('ops-user-1', AT)).toThrow(InvalidSupplierTransitionError)
  })
})

describe('Supplier · suspensión', () => {
  const active = () => newSupplier().approve('ops-user-1', AT)

  it('debería dejar de aceptar pedidos al suspender, con motivo', () => {
    const suspended = active().suspend('Entregas tardías repetidas')

    expect(suspended.status).toBe('SUSPENDED')
    expect(suspended.canAcceptOrders()).toBe(false)
    expect(suspended.rejectionReason).toBe('Entregas tardías repetidas')
  })

  it('debería exigir motivo al suspender', () => {
    expect(() => active().suspend('')).toThrow(/motivo/)
  })

  it('debería reactivarse y limpiar el motivo', () => {
    const reactivated = active().suspend('Revisión').reactivate()

    expect(reactivated.status).toBe('ACTIVE')
    expect(reactivated.canAcceptOrders()).toBe(true)
    expect(reactivated.rejectionReason).toBeNull()
  })

  it('no debería suspender un proveedor que aún no está activo', () => {
    expect(() => newSupplier().suspend('Motivo')).toThrow(InvalidSupplierTransitionError)
  })
})

describe('Supplier · inmutabilidad', () => {
  it('no debería modificar la instancia original al cambiar de estado', () => {
    const pending = newSupplier()
    pending.approve('ops-user-1', AT)

    expect(pending.status).toBe('PENDING_REVIEW')
  })
})
