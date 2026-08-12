import { describe, expect, it } from 'vitest'

import { QUEUE_FOR_EVENT } from './queues'
import { REDACT_PAYLOAD_ON_SEND, partitionForRedaction, redactsPayload } from './sensitive-events'

describe('eventos con secreto en el payload', () => {
  it('debería borrar el payload de los enlaces de verificación y recuperación', () => {
    expect(redactsPayload('identity.EmailVerificationRequested.v1')).toBe(true)
    expect(redactsPayload('identity.PasswordResetRequested.v1')).toBe(true)
  })

  it('no debería tocar el payload de un evento de negocio', () => {
    // Notifications, CRM y Analítica los necesitan enteros.
    expect(redactsPayload('orders.OrderPlaced.v1')).toBe(false)
    expect(redactsPayload('identity.UserRegistered.v1')).toBe(false)
  })

  it('no debería borrar el aviso de cambio de contraseña', () => {
    // No lleva token: sólo dice que la contraseña cambió.
    expect(redactsPayload('identity.PasswordChanged.v1')).toBe(false)
  })

  it('debería separar la tanda en dos grupos', () => {
    const { keep, redact } = partitionForRedaction([
      { id: 'a', type: 'orders.OrderPlaced.v1' },
      { id: 'b', type: 'identity.PasswordResetRequested.v1' },
      { id: 'c', type: 'identity.UserRegistered.v1' },
      { id: 'd', type: 'identity.EmailVerificationRequested.v1' },
    ])

    expect(keep).toEqual(['a', 'c'])
    expect(redact).toEqual(['b', 'd'])
  })

  it('debería devolver grupos vacíos con una tanda vacía', () => {
    expect(partitionForRedaction([])).toEqual({ keep: [], redact: [] })
  })

  it('debería tener cola asignada todo evento que se redacta', () => {
    // Un evento que se redacta pero no se enruta acabaría en la cola por defecto con el
    // payload ya borrado: nadie podría componer el correo.
    for (const type of REDACT_PAYLOAD_ON_SEND) {
      expect(QUEUE_FOR_EVENT[type]).toBeDefined()
    }
  })
})
