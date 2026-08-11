import { describe, expect, it } from 'vitest'

import { CurrencyMismatchError, Money, NegativeMoneyError } from './money'

describe('Money', () => {
  describe('creación', () => {
    it('debería crear un importe con enteros en la menor unidad', () => {
      const money = Money.of(104_166, 'COP')
      expect(money.amount).toBe(104_166)
      expect(money.currency).toBe('COP')
    })

    it('debería rechazar un importe con decimales', () => {
      expect(() => Money.of(104_166.5, 'COP')).toThrow(/entero seguro/)
    })

    it('debería rechazar un importe negativo', () => {
      expect(() => Money.of(-1, 'COP')).toThrow(NegativeMoneyError)
    })

    it('debería convertir desde unidades mayores redondeando HALF_UP', () => {
      expect(Money.fromMajorUnits(1041.665, 'COP').amount).toBe(104_167)
      expect(Money.fromMajorUnits(1041.664, 'COP').amount).toBe(104_166)
    })

    it('debería crear el importe cero', () => {
      expect(Money.zero('COP').isZero()).toBe(true)
    })
  })

  describe('aritmética', () => {
    it('debería sumar importes de la misma moneda', () => {
      const total = Money.of(100_000, 'COP').add(Money.of(4_166, 'COP'))
      expect(total.amount).toBe(104_166)
    })

    it('debería lanzar un error de dominio al sumar monedas distintas', () => {
      expect(() => Money.of(100, 'COP').add(Money.of(100, 'USD'))).toThrow(CurrencyMismatchError)
    })

    it('debería lanzar un error de dominio al comparar monedas distintas', () => {
      expect(() => Money.of(100, 'COP').isGreaterThan(Money.of(100, 'USD'))).toThrow(
        CurrencyMismatchError,
      )
    })

    it('debería rechazar una resta que produzca un importe negativo', () => {
      expect(() => Money.of(100, 'COP').subtract(Money.of(200, 'COP'))).toThrow(NegativeMoneyError)
    })

    it('debería multiplicar redondeando una sola vez', () => {
      // 104166 × 12 = 1_249_992 exacto
      expect(Money.of(104_166, 'COP').multiply(12).amount).toBe(1_249_992)
    })

    it('debería aplicar un porcentaje', () => {
      // IVA del 19% sobre 1.000.000
      expect(Money.of(1_000_000, 'COP').percentage(19).amount).toBe(190_000)
    })

    it('debería rechazar un factor negativo', () => {
      expect(() => Money.of(100, 'COP').multiply(-1)).toThrow(/no puede ser negativo/)
    })

    it('debería sumar una lista vacía como cero', () => {
      expect(Money.sum([], 'COP').isZero()).toBe(true)
    })

    it('debería sumar una lista de importes', () => {
      const lines = [Money.of(1000, 'COP'), Money.of(2000, 'COP'), Money.of(3000, 'COP')]
      expect(Money.sum(lines, 'COP').amount).toBe(6000)
    })
  })

  describe('redondeo — el caso que produce descuadres si se hace mal', () => {
    it('debería dar el mismo total sumando líneas que multiplicando el total', () => {
      // Regla PRC: el redondeo ocurre UNA sola vez, al final.
      const unitPrice = Money.of(104_166, 'COP')
      const quantity = 12

      const viaMultiply = unitPrice.multiply(quantity)
      const viaSum = Money.sum(
        Array.from({ length: quantity }, () => unitPrice),
        'COP',
      )

      expect(viaMultiply.equals(viaSum)).toBe(true)
    })

    it('debería redondear .5 hacia arriba', () => {
      // 101 × 1.5 = 151.5, exactamente representable en binario.
      expect(Money.of(101, 'COP').multiply(1.5).amount).toBe(152)
    })

    it('debería usar percentage() en vez de multiply() para porcentajes', () => {
      // 100 × 1.005 da 100.49999999999999 en IEEE-754, no 100.5: multiply redondea a 100.
      expect(Money.of(100, 'COP').multiply(1.005).amount).toBe(100)
      // percentage multiplica antes de dividir, así que el cálculo es exacto: 101.
      expect(Money.of(100, 'COP').percentage(100.5).amount).toBe(101)
    })

    it('debería calcular el IVA sin descuadres sobre importes grandes', () => {
      const subtotal = Money.of(1_249_992, 'COP')
      const iva = subtotal.percentage(19)
      expect(iva.amount).toBe(237_498)
      expect(subtotal.add(iva).amount).toBe(1_487_490)
    })

    it('debería rechazar un porcentaje negativo', () => {
      expect(() => Money.of(100, 'COP').percentage(-5)).toThrow(/no puede ser negativo/)
    })
  })

  describe('serialización', () => {
    it('debería producir la forma que viaja por la API', () => {
      expect(Money.of(104_166, 'COP').toJSON()).toEqual({ amount: 104_166, currency: 'COP' })
    })

    it('debería reconstruirse desde su forma serializada', () => {
      const original = Money.of(104_166, 'COP')
      expect(Money.fromJSON(original.toJSON()).equals(original)).toBe(true)
    })
  })

  describe('igualdad', () => {
    it('debería considerar distintos dos importes iguales en monedas distintas', () => {
      expect(Money.of(100, 'COP').equals(Money.of(100, 'USD'))).toBe(false)
    })
  })
})
