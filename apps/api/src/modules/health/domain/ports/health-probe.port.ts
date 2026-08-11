/**
 * Puerto de comprobación de una dependencia externa.
 *
 * El dominio declara lo que necesita; la infraestructura lo satisface. Así el caso de
 * uso se testea sin PostgreSQL ni Redis, y cambiar de cliente no toca la lógica
 * (docs/01-architecture.md §2.2).
 *
 * Este archivo vive en `domain/`: cero imports de framework.
 */
export type ProbeResult = {
  readonly status: 'up' | 'down'
  readonly latencyMs: number
  /**
   * Motivo del fallo, como código estable.
   * NUNCA incluye credenciales ni cadenas de conexión: el adaptador lo clasifica
   * contra una lista blanca antes de exponerlo.
   */
  readonly error?: string
}

export type HealthProbePort = {
  readonly name: string
  check(): Promise<ProbeResult>
}

export const POSTGRES_PROBE = Symbol('POSTGRES_PROBE')
export const REDIS_PROBE = Symbol('REDIS_PROBE')
