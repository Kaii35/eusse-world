/**
 * `Result` — errores esperados como valor, no como excepción.
 *
 * Un SKU sin precio para una cuenta no es excepcional: es un caso de negocio.
 * Las excepciones se reservan para lo imprevisto (skills/backend-nestjs.md).
 */

export type Ok<T> = { readonly ok: true; readonly value: T }
export type Err<E> = { readonly ok: false; readonly error: E }
export type Result<T, E> = Ok<T> | Err<E>

export const Result = {
  ok<T>(value: T): Ok<T> {
    return { ok: true, value }
  },

  err<E>(error: E): Err<E> {
    return { ok: false, error }
  },

  isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.ok
  },

  isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return !result.ok
  },

  /** Transforma el valor de un `Ok`, deja el `Err` intacto. */
  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.ok ? Result.ok(fn(result.value)) : result
  },

  /** Transforma el error de un `Err`, deja el `Ok` intacto. */
  mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    return result.ok ? result : Result.err(fn(result.error))
  },

  /** Encadena operaciones que pueden fallar. */
  flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
    return result.ok ? fn(result.value) : result
  },

  /** Devuelve el valor, o el que se pase por defecto si es `Err`. */
  unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
    return result.ok ? result.value : fallback
  },

  /** Devuelve el valor o lanza. Sólo para tests y para el límite de la aplicación. */
  unwrap<T, E>(result: Result<T, E>): T {
    if (!result.ok) {
      throw new Error(`Se intentó desempaquetar un Err: ${JSON.stringify(result.error)}`)
    }
    return result.value
  },

  /** Colapsa ambos lados a un único tipo. */
  match<T, E, U>(result: Result<T, E>, handlers: { ok: (v: T) => U; err: (e: E) => U }): U {
    return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
  },

  /** Combina varios resultados: `Ok` con todos los valores, o el primer `Err`. */
  all<T, E>(results: readonly Result<T, E>[]): Result<T[], E> {
    const values: T[] = []
    for (const result of results) {
      if (!result.ok) return result
      values.push(result.value)
    }
    return Result.ok(values)
  },
} as const
