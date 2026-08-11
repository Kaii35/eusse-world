/** Error lanzado cuando se viola una invariante del código (no del dominio). */
export class InvariantViolationError extends Error {
  override readonly name = 'InvariantViolationError'
}

/**
 * Afirma una condición que debe ser cierta siempre.
 *
 * NO se usa para reglas de negocio: esas van en el dominio con su error tipado y su
 * código del catálogo. Esto es para condiciones que, de fallar, indican un bug.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvariantViolationError(message)
}

/** Marca una rama como inalcanzable. El compilador verifica la exhaustividad. */
export function assertNever(value: never, message?: string): never {
  throw new InvariantViolationError(message ?? `Caso no contemplado: ${JSON.stringify(value)}`)
}
