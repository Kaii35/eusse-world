import { describe, expect, it } from 'vitest'

import { InvariantViolationError, assertNever, invariant } from './invariant'
import { assertSafeInteger, roundHalfUp } from './money-math'

describe('roundHalfUp', () => {
  it('debería redondear .5 hacia arriba', () => {
    expect(roundHalfUp(0.5)).toBe(1)
    expect(roundHalfUp(1.5)).toBe(2)
    expect(roundHalfUp(2.5)).toBe(3)
  })

  it('debería redondear por debajo de .5 hacia abajo', () => {
    expect(roundHalfUp(0.49)).toBe(0)
    expect(roundHalfUp(2.4999)).toBe(2)
  })

  it('debería ser simétrico con valores negativos', () => {
    // Math.round(-0.5) es -0, que rompe la simetría. HALF_UP debe dar -1.
    expect(roundHalfUp(-0.5)).toBe(-1)
    expect(roundHalfUp(-1.5)).toBe(-2)
    expect(roundHalfUp(-2.5)).toBe(-3)
  })

  it('debería dejar los enteros intactos', () => {
    expect(roundHalfUp(42)).toBe(42)
    expect(roundHalfUp(0)).toBe(0)
  })

  it('debería rechazar valores no finitos', () => {
    expect(() => roundHalfUp(Number.NaN)).toThrow(InvariantViolationError)
    expect(() => roundHalfUp(Number.POSITIVE_INFINITY)).toThrow(InvariantViolationError)
  })
})

describe('assertSafeInteger', () => {
  it('debería aceptar enteros seguros', () => {
    expect(() => {
      assertSafeInteger(104_166, 'importe')
    }).not.toThrow()
  })

  it('debería rechazar decimales, con un mensaje que explique el motivo', () => {
    expect(() => {
      assertSafeInteger(1.5, 'importe')
    }).toThrow(/nunca usa float/)
  })

  it('debería rechazar valores fuera del rango seguro', () => {
    expect(() => {
      assertSafeInteger(Number.MAX_SAFE_INTEGER + 2, 'importe')
    }).toThrow(InvariantViolationError)
  })
})

describe('invariant', () => {
  it('debería no hacer nada cuando la condición es cierta', () => {
    expect(() => {
      invariant(true, 'no debería lanzar')
    }).not.toThrow()
  })

  it('debería lanzar con el mensaje dado cuando la condición es falsa', () => {
    expect(() => {
      invariant(false, 'la cuenta debe tener un OWNER')
    }).toThrow('la cuenta debe tener un OWNER')
  })

  it('debería estrechar el tipo tras la aserción', () => {
    const value: string | null = 'presente'
    invariant(value, 'value no puede ser null')
    // Si esto compila, el estrechamiento funciona.
    expect(value.length).toBe(8)
  })
})

describe('assertNever', () => {
  it('debería lanzar al alcanzarse una rama supuestamente inalcanzable', () => {
    const value = 'inesperado' as never
    expect(() => assertNever(value)).toThrow(InvariantViolationError)
  })
})
