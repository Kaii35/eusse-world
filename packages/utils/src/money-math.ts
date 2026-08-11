import { InvariantViolationError } from './invariant'

/**
 * Redondeo HALF_UP sobre enteros.
 *
 * Es la ÚNICA regla de redondeo del sistema y ocurre una sola vez, al final
 * (docs/03-conventions.md §5, skills/pricing.md).
 */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value)) {
    throw new InvariantViolationError(`No se puede redondear un valor no finito: ${value}`)
  }
  return value < 0 ? -Math.round(-value) : Math.round(value)
}

/** Verifica que un número sea un entero seguro. Los importes SIEMPRE lo son. */
export function assertSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new InvariantViolationError(
      `${label} debe ser un entero seguro (recibido: ${value}). El dinero nunca usa float.`,
    )
  }
}
