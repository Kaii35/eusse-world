import { describe, expect, it, vi } from 'vitest'

import { resolveOverallStatus } from '../domain/health-result'

import { CheckReadinessUseCase } from './check-readiness.use-case'

import type { Env } from '../../../config/env.schema'
import type { HealthProbePort, ProbeResult } from '../domain/ports/health-probe.port'

function probe(name: string, result: ProbeResult): HealthProbePort {
  return { name, check: () => Promise.resolve(result) }
}

const UP: ProbeResult = { status: 'up', latencyMs: 3 }
const DOWN: ProbeResult = { status: 'down', latencyMs: 2000, error: 'ProbeTimeout' }

const env = { APP_ENV: 'local' } as Env

describe('resolveOverallStatus', () => {
  it('debería estar listo sólo si todas las dependencias responden', () => {
    expect(resolveOverallStatus([UP, UP])).toBe('ok')
  })

  it('debería estar degradado si alguna dependencia está caída', () => {
    expect(resolveOverallStatus([UP, DOWN])).toBe('degraded')
    expect(resolveOverallStatus([DOWN, DOWN])).toBe('degraded')
  })

  it('debería considerar listo un servicio sin dependencias', () => {
    expect(resolveOverallStatus([])).toBe('ok')
  })
})

describe('CheckReadinessUseCase', () => {
  it('debería reportar ok cuando ambas dependencias responden', async () => {
    const useCase = new CheckReadinessUseCase(probe('postgres', UP), probe('redis', UP), env)

    const result = await useCase.execute()

    expect(result.status).toBe('ok')
    expect(result.dependencies.postgres.status).toBe('up')
    expect(result.dependencies.redis.status).toBe('up')
    expect(result.environment).toBe('local')
  })

  it('debería reportar degradado cuando PostgreSQL está caído', async () => {
    const useCase = new CheckReadinessUseCase(probe('postgres', DOWN), probe('redis', UP), env)

    const result = await useCase.execute()

    expect(result.status).toBe('degraded')
    expect(result.dependencies.postgres.error).toBe('ProbeTimeout')
  })

  it('debería ejecutar las sondas en paralelo, no en serie', async () => {
    // Comprobar dos dependencias en serie duplicaría la latencia del endpoint que más
    // se consulta del sistema.
    const slow = (name: string): HealthProbePort => ({
      name,
      check: () =>
        new Promise<ProbeResult>((resolve) => {
          setTimeout(() => {
            resolve(UP)
          }, 50)
        }),
    })

    const useCase = new CheckReadinessUseCase(slow('postgres'), slow('redis'), env)

    const startedAt = Date.now()
    await useCase.execute()
    const elapsed = Date.now() - startedAt

    // En serie serían ≥ 100 ms. Se deja margen amplio para no volverlo inestable.
    expect(elapsed).toBeLessThan(90)
  })

  it('no debería filtrar detalles internos en el error de una sonda', async () => {
    const leaky = probe('postgres', {
      status: 'down',
      latencyMs: 5,
      error: 'PrismaClientInitializationError',
    })
    const useCase = new CheckReadinessUseCase(leaky, probe('redis', UP), env)

    const result = await useCase.execute()

    // El adaptador expone el NOMBRE del error, nunca el mensaje: el mensaje de Prisma
    // puede contener la cadena de conexión y este endpoint es público.
    expect(result.dependencies.postgres.error).not.toMatch(/postgresql:\/\//)
  })

  it('debería devolver una marca de tiempo ISO en UTC', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-07T10:00:00.000Z'))

    const useCase = new CheckReadinessUseCase(probe('postgres', UP), probe('redis', UP), env)
    const result = await useCase.execute()

    expect(result.timestamp).toBe('2026-08-07T10:00:00.000Z')
    vi.useRealTimers()
  })
})
