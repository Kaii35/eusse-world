import { describe, expect, it } from 'vitest'

import { PROBE_ERROR, describeProbeError } from './probe-error'

describe('describeProbeError', () => {
  it('debería clasificar una conexión rechazada', () => {
    const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:6399'), {
      code: 'ECONNREFUSED',
    })
    expect(describeProbeError(error)).toBe(PROBE_ERROR.CONNECTION_REFUSED)
  })

  it('debería clasificar un timeout', () => {
    expect(describeProbeError(new Error('ProbeTimeout'))).toBe(PROBE_ERROR.TIMEOUT)
    expect(describeProbeError(new Error('Command timed out'))).toBe(PROBE_ERROR.TIMEOUT)
  })

  it('debería clasificar una conexión cerrada', () => {
    expect(describeProbeError(new Error('Connection is closed.'))).toBe(
      PROBE_ERROR.CONNECTION_CLOSED,
    )
  })

  it('debería clasificar un host no resuelto', () => {
    expect(describeProbeError(new Error('getaddrinfo ENOTFOUND redis-prod'))).toBe(
      PROBE_ERROR.HOST_NOT_FOUND,
    )
  })

  it('debería clasificar un fallo de autenticación', () => {
    expect(describeProbeError(new Error('NOAUTH Authentication required'))).toBe(
      PROBE_ERROR.AUTH_FAILED,
    )
  })

  it('debería devolver UNAVAILABLE para un error desconocido', () => {
    expect(describeProbeError(new Error('algo raro'))).toBe(PROBE_ERROR.UNAVAILABLE)
    expect(describeProbeError('no es un Error')).toBe(PROBE_ERROR.UNAVAILABLE)
    expect(describeProbeError(undefined)).toBe(PROBE_ERROR.UNAVAILABLE)
  })

  it('NUNCA debería filtrar la cadena de conexión ni credenciales', () => {
    // El caso que motiva esta función: el mensaje de Prisma lleva la URL completa.
    const leaky = new Error(
      "Can't reach database server at postgresql://eusse:s3cr3t@db.prod:5432/eusse",
    )
    const result = describeProbeError(leaky)

    expect(result).not.toMatch(/postgresql:\/\//)
    expect(result).not.toMatch(/s3cr3t/)
    expect(result).not.toMatch(/db\.prod/)
    // Sólo puede devolver constantes de la lista blanca.
    expect(Object.values(PROBE_ERROR)).toContain(result)
  })

  it('debería devolver siempre un valor de la lista blanca', () => {
    const inputs: unknown[] = [
      new Error('ECONNREFUSED'),
      new Error(''),
      new TypeError('boom'),
      { message: 'no soy un Error' },
      null,
      42,
    ]

    for (const input of inputs) {
      expect(Object.values(PROBE_ERROR)).toContain(describeProbeError(input))
    }
  })
})
