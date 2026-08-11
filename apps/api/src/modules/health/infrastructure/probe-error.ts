/**
 * Clasifica el fallo de una sonda para exponerlo sin filtrar información sensible.
 *
 * `/health/ready` es consultable desde fuera y el MENSAJE de un error de Prisma o de
 * ioredis puede contener la cadena de conexión con credenciales. Por eso esta función
 * **nunca devuelve el mensaje del error**: sólo constantes de esta lista.
 *
 * Es una lista blanca a propósito. Una lista negra siempre deja pasar un caso
 * (skills/security.md).
 */
export const PROBE_ERROR = {
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  CONNECTION_CLOSED: 'CONNECTION_CLOSED',
  TIMEOUT: 'TIMEOUT',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  AUTH_FAILED: 'AUTH_FAILED',
  UNAVAILABLE: 'UNAVAILABLE',
} as const

export type ProbeError = (typeof PROBE_ERROR)[keyof typeof PROBE_ERROR]

/** Patrones conocidos → código seguro. El orden importa: el primero que encaja gana. */
const PATTERNS: readonly (readonly [RegExp, ProbeError])[] = [
  [/ECONNREFUSED|connection refused/i, PROBE_ERROR.CONNECTION_REFUSED],
  [/ETIMEDOUT|ProbeTimeout|timed? ?out/i, PROBE_ERROR.TIMEOUT],
  [/ENOTFOUND|EAI_AGAIN|getaddrinfo/i, PROBE_ERROR.HOST_NOT_FOUND],
  [/Connection is closed|ECONNRESET|EPIPE|Stream isn't writeable/i, PROBE_ERROR.CONNECTION_CLOSED],
  [/authentication|NOAUTH|WRONGPASS|password/i, PROBE_ERROR.AUTH_FAILED],
]

export function describeProbeError(error: unknown): ProbeError {
  if (!(error instanceof Error)) return PROBE_ERROR.UNAVAILABLE

  const code = (error as NodeJS.ErrnoException).code
  const haystack = `${code ?? ''} ${error.name} ${error.message}`

  for (const [pattern, result] of PATTERNS) {
    if (pattern.test(haystack)) return result
  }

  return PROBE_ERROR.UNAVAILABLE
}
