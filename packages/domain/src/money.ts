import { assertSafeInteger, invariant, roundHalfUp } from '@eusse/utils'

/**
 * `Money` — el value object más crítico del sistema.
 *
 * Reglas (docs/03-conventions.md §5, skills/pricing.md):
 *   · `amount` es un ENTERO en la menor unidad de la moneda (centavos). Nunca float.
 *   · Todo importe lleva moneda. Sumar monedas distintas es un error de dominio.
 *   · El redondeo ocurre una sola vez, al final, con regla explícita (HALF_UP).
 *
 * Un error aquí es el riesgo R-01, el más crítico del proyecto.
 */

export const CURRENCIES = ['COP', 'USD', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

/** Dígitos decimales de cada moneda, según ISO 4217. */
const CURRENCY_MINOR_UNITS: Record<Currency, number> = {
  COP: 2,
  USD: 2,
  EUR: 2,
}

export class CurrencyMismatchError extends Error {
  override readonly name = 'CurrencyMismatchError'
  readonly code = 'DOMAIN_CURRENCY_MISMATCH'

  constructor(
    readonly left: Currency,
    readonly right: Currency,
  ) {
    super(
      `No se pueden operar importes de monedas distintas: ${left} y ${right}. ` +
        `La conversión de divisas es otro contexto.`,
    )
  }
}

export class NegativeMoneyError extends Error {
  override readonly name = 'NegativeMoneyError'
  readonly code = 'DOMAIN_NEGATIVE_MONEY'

  constructor(amount: number) {
    super(`Un importe no puede ser negativo: ${amount}`)
  }
}

export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
  ) {}

  /** Crea un importe. `amount` en la menor unidad (centavos), entero y no negativo. */
  static of(amount: number, currency: Currency): Money {
    assertSafeInteger(amount, 'Money.amount')
    if (amount < 0) throw new NegativeMoneyError(amount)
    return new Money(amount, currency)
  }

  /** Importe cero en la moneda dada. */
  static zero(currency: Currency): Money {
    return new Money(0, currency)
  }

  /**
   * Crea un importe desde unidades mayores (pesos, dólares).
   * Sólo para seeds, tests y entrada humana. **Nunca en cálculo de precios.**
   */
  static fromMajorUnits(major: number, currency: Currency): Money {
    const factor = 10 ** CURRENCY_MINOR_UNITS[currency]
    return Money.of(roundHalfUp(major * factor), currency)
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency)
    }
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other)
    const result = this.amount - other.amount
    if (result < 0) throw new NegativeMoneyError(result)
    return new Money(result, this.currency)
  }

  /** Multiplica por un factor. El redondeo es HALF_UP y ocurre aquí. */
  multiply(factor: number): Money {
    invariant(Number.isFinite(factor), `El factor debe ser finito: ${factor}`)
    invariant(factor >= 0, `El factor no puede ser negativo: ${factor}`)
    return new Money(roundHalfUp(this.amount * factor), this.currency)
  }

  /**
   * Aplica un porcentaje (19 = 19%). Es la forma correcta de calcular impuestos.
   *
   * Multiplica ANTES de dividir. Delegar en `multiply(percent / 100)` introduciría el
   * error de coma flotante de `percent / 100` (1.005 no es exactamente 1.005) y produciría
   * descuadres de un céntimo, que en contabilidad B2B son inaceptables.
   */
  percentage(percent: number): Money {
    invariant(Number.isFinite(percent), `El porcentaje debe ser finito: ${percent}`)
    invariant(percent >= 0, `El porcentaje no puede ser negativo: ${percent}`)
    return new Money(roundHalfUp((this.amount * percent) / 100), this.currency)
  }

  isZero(): boolean {
    return this.amount === 0
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amount > other.amount
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amount >= other.amount
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this.amount < other.amount
  }

  /** Suma una lista. Requiere la moneda por si la lista está vacía. */
  static sum(items: readonly Money[], currency: Currency): Money {
    return items.reduce<Money>((acc, item) => acc.add(item), Money.zero(currency))
  }

  /** Forma serializable, la misma que viaja por la API (RFC-0012 §4.2). */
  toJSON(): { amount: number; currency: Currency } {
    return { amount: this.amount, currency: this.currency }
  }

  static fromJSON(value: { amount: number; currency: Currency }): Money {
    return Money.of(value.amount, value.currency)
  }

  /**
   * Sólo para depuración y logs. **La UI formatea con `Intl`**, usando la moneda del
   * importe y el locale del usuario (skills/i18n.md).
   */
  toString(): string {
    const factor = 10 ** CURRENCY_MINOR_UNITS[this.currency]
    return `${(this.amount / factor).toFixed(CURRENCY_MINOR_UNITS[this.currency])} ${this.currency}`
  }
}
