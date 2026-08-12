import { z } from 'zod'

/**
 * Configuración del proceso, validada al arrancar.
 *
 * REGLA: si falta una variable obligatoria, el proceso NO arranca
 * (docs/03-conventions.md §15). Es deliberado: mejor fallar al arrancar, con un mensaje
 * claro, que a las tres de la mañana con una petición de un cliente.
 *
 * Sin valores por defecto silenciosos para secretos. Un secreto con valor por defecto es
 * un secreto que alguien va a desplegar en producción.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'preview', 'staging', 'production']).default('local'),
  TENANT_ID: z.string().min(1).default('eusse'),
  /** Moneda con la que nace una cuenta nueva. Debe existir en `CURRENCIES` de @eusse/domain. */
  DEFAULT_CURRENCY: z.enum(['COP', 'USD', 'EUR']).default('COP'),

  API_PORT: z.coerce.number().int().positive().default(3001),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),

  /** Orígenes permitidos, separados por coma. Sin comodines (skills/security.md). */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3002')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

  REDIS_URL: z.string().url(),
  REDIS_PREFIX: z.string().default('eusse'),

  /**
   * Firma del access token (HS256, ADR-0008). Sin valor por defecto: un secreto con
   * valor por defecto es un secreto que alguien acaba desplegando en producción.
   *
   * 32 caracteres mínimo. Con menos, la clave tiene menos entropía que la etiqueta de
   * HS256 promete y el token se vuelve falsificable por fuerza bruta.
   */
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Valida el entorno. Lanza con un mensaje legible si falta algo.
 *
 * Nunca imprime el VALOR de una variable: sólo su nombre. Un mensaje de error que
 * revela una cadena de conexión es una fuga de credenciales.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(
      `Configuración de entorno no válida. El proceso no puede arrancar.\n\n${issues}\n\n` +
        `Revisa .env.example para ver qué se espera de cada variable.`,
    )
  }

  return result.data
}
