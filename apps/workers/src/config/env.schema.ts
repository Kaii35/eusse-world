import { z } from 'zod'

/** Configuración de los workers, validada al arrancar (docs/03-conventions.md §15). */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'preview', 'staging', 'production']).default('local'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  REDIS_PREFIX: z.string().default('eusse'),

  /** Cada cuánto busca el relay eventos pendientes en el outbox. */
  OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(1000),
  /** Cuántos publica por vuelta. Con SKIP LOCKED, varias réplicas no se pisan. */
  OUTBOX_BATCH_SIZE: z.coerce.number().int().positive().max(500).default(100),
  JOB_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(
      `Configuración de entorno no válida. El proceso no puede arrancar.\n\n${issues}`,
    )
  }
  return result.data
}
