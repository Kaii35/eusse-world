import { z } from 'zod'

import { isoDateTimeSchema } from '../shared/primitives'

/**
 * Contrato de salud del servicio.
 *
 * Lo consumen los health checks del PaaS y del despliegue (ADR-0020). Es el primer
 * contrato del sistema y el que verifica la Puerta A: si `/health` responde, el
 * esqueleto está en pie.
 */

export const DEPENDENCY_STATUS = {
  UP: 'up',
  DOWN: 'down',
} as const

export type DependencyStatus = (typeof DEPENDENCY_STATUS)[keyof typeof DEPENDENCY_STATUS]

export const dependencyHealthSchema = z.object({
  status: z.enum([DEPENDENCY_STATUS.UP, DEPENDENCY_STATUS.DOWN]),
  latencyMs: z.number().nonnegative().optional(),
  /** Motivo del fallo. Nunca incluye credenciales ni cadenas de conexión. */
  error: z.string().optional(),
})

export type DependencyHealth = z.infer<typeof dependencyHealthSchema>

/**
 * Comprobación superficial: el proceso responde.
 *
 * No consulta dependencias, así que un fallo aquí significa que el proceso está muerto.
 * Es lo que debe usar el balanceador para enrutar tráfico.
 */
export const livenessResponseSchema = z.object({
  status: z.literal('ok'),
  uptimeSeconds: z.number().nonnegative(),
  timestamp: isoDateTimeSchema,
})

export type LivenessResponse = z.infer<typeof livenessResponseSchema>

/**
 * Comprobación profunda: el servicio puede atender peticiones.
 *
 * Consulta PostgreSQL y Redis. Devuelve 503 si alguna dependencia está caída, para que
 * el despliegue no enrute tráfico a una instancia que aún no puede servir.
 */
export const readinessResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  environment: z.enum(['local', 'preview', 'staging', 'production']),
  timestamp: isoDateTimeSchema,
  dependencies: z.object({
    postgres: dependencyHealthSchema,
    redis: dependencyHealthSchema,
  }),
})

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>
