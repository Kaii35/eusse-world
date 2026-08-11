/**
 * Detección de servicios para tests de integración.
 *
 * REGLA: un test de integración que se salta EN SILENCIO es peor que uno que falla —
 * da confianza falsa. Estas utilidades hacen visible el salto y permiten exigir los
 * servicios en CI.
 */

export type ServiceConfig = {
  readonly databaseUrl: string
  readonly redisUrl: string
}

/** Devuelve la configuración si ambos servicios están declarados; si no, `null`. */
export function serviceConfig(): ServiceConfig | null {
  const databaseUrl = process.env.DATABASE_URL
  const redisUrl = process.env.REDIS_URL
  if (!databaseUrl || !redisUrl) return null
  return { databaseUrl, redisUrl }
}

/**
 * Exige los servicios cuando corresponde.
 *
 * En CI (`CI=true`) faltar servicios es un ERROR, no un motivo para saltar: si los
 * tests de integración no corren en CI, no existen.
 */
export function requireServices(): ServiceConfig {
  const config = serviceConfig()
  if (config) return config

  const message = 'Faltan DATABASE_URL y/o REDIS_URL. Levanta los servicios con `pnpm db:up`.'

  if (process.env.CI === 'true') throw new Error(`${message} En CI esto es un fallo.`)

  console.warn(`[testing] ${message} Los tests de integración se saltan.`)
  throw new Error(message)
}

/** `true` si hay servicios disponibles. Para `describe.runIf(...)`. */
export function hasServices(): boolean {
  return serviceConfig() !== null
}
