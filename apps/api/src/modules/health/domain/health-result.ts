import type { ProbeResult } from './ports/health-probe.port'

/** Resultado de la comprobación superficial. */
export type LivenessResult = {
  readonly status: 'ok'
  readonly uptimeSeconds: number
  readonly timestamp: string
}

/** Resultado de la comprobación profunda, con el estado de cada dependencia. */
export type ReadinessResult = {
  readonly status: 'ok' | 'degraded'
  readonly version: string
  readonly environment: 'local' | 'preview' | 'staging' | 'production'
  readonly timestamp: string
  readonly dependencies: {
    readonly postgres: ProbeResult
    readonly redis: ProbeResult
  }
}

/** El servicio está listo sólo si TODAS sus dependencias responden. */
export function resolveOverallStatus(probes: readonly ProbeResult[]): 'ok' | 'degraded' {
  return probes.every((probe) => probe.status === 'up') ? 'ok' : 'degraded'
}
