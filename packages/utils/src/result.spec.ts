import { describe, expect, it } from 'vitest'

import { Result } from './result'

type PricingError = { code: 'PRICING_NO_PRICE_FOR_ACCOUNT' }

describe('Result', () => {
  it('debería construir un Ok que se reconoce como tal', () => {
    const result = Result.ok(42)
    expect(Result.isOk(result)).toBe(true)
    expect(Result.isErr(result)).toBe(false)
  })

  it('debería construir un Err que se reconoce como tal', () => {
    const result = Result.err<PricingError>({ code: 'PRICING_NO_PRICE_FOR_ACCOUNT' })
    expect(Result.isErr(result)).toBe(true)
    expect(Result.isOk(result)).toBe(false)
  })

  it('debería estrechar el tipo tras comprobar isOk', () => {
    const result: Result<number, PricingError> = Result.ok(10)
    if (Result.isOk(result)) {
      // Si esto compila, el estrechamiento funciona.
      expect(result.value + 1).toBe(11)
    }
  })

  describe('map', () => {
    it('debería transformar el valor de un Ok', () => {
      expect(Result.map(Result.ok(2), (n) => n * 3)).toEqual(Result.ok(6))
    })

    it('debería dejar intacto un Err', () => {
      const error = Result.err<PricingError>({ code: 'PRICING_NO_PRICE_FOR_ACCOUNT' })
      expect(Result.map(error, (n: number) => n * 3)).toBe(error)
    })
  })

  describe('mapErr', () => {
    it('debería transformar el error de un Err', () => {
      const mapped = Result.mapErr(Result.err('boom'), (e) => `${e}!`)
      expect(mapped).toEqual(Result.err('boom!'))
    })

    it('debería dejar intacto un Ok', () => {
      const ok = Result.ok(1)
      expect(Result.mapErr(ok, (e: string) => e)).toBe(ok)
    })
  })

  describe('flatMap', () => {
    it('debería encadenar operaciones que pueden fallar', () => {
      const half = (n: number): Result<number, string> =>
        n % 2 === 0 ? Result.ok(n / 2) : Result.err('impar')

      expect(Result.flatMap(Result.ok(8), half)).toEqual(Result.ok(4))
      expect(Result.flatMap(Result.ok(7), half)).toEqual(Result.err('impar'))
    })

    it('debería cortocircuitar sobre un Err', () => {
      const err = Result.err<string>('previo')
      expect(Result.flatMap(err, () => Result.ok(1))).toBe(err)
    })
  })

  describe('unwrap', () => {
    it('debería devolver el valor de un Ok', () => {
      expect(Result.unwrap(Result.ok('valor'))).toBe('valor')
    })

    it('debería lanzar sobre un Err', () => {
      expect(() => Result.unwrap(Result.err('boom'))).toThrow(/desempaquetar un Err/)
    })

    it('debería devolver el fallback sobre un Err', () => {
      expect(Result.unwrapOr(Result.err<string>('boom'), 0)).toBe(0)
    })
  })

  describe('match', () => {
    it('debería colapsar ambos lados a un mismo tipo', () => {
      const describe_ = (r: Result<number, string>): string =>
        Result.match(r, { ok: (v) => `ok:${v}`, err: (e) => `err:${e}` })

      expect(describe_(Result.ok(1))).toBe('ok:1')
      expect(describe_(Result.err('x'))).toBe('err:x')
    })
  })

  describe('all', () => {
    it('debería combinar todos los valores cuando no hay errores', () => {
      expect(Result.all([Result.ok(1), Result.ok(2), Result.ok(3)])).toEqual(Result.ok([1, 2, 3]))
    })

    it('debería devolver el primer Err', () => {
      const results: Result<number, string>[] = [
        Result.ok(1),
        Result.err('primero'),
        Result.err('segundo'),
      ]
      expect(Result.all(results)).toEqual(Result.err('primero'))
    })

    it('debería devolver Ok con lista vacía para una entrada vacía', () => {
      expect(Result.all([])).toEqual(Result.ok([]))
    })
  })
})
