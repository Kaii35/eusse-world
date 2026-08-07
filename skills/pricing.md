# Skill — Precios

## Objetivo

Que el precio mostrado sea **siempre** el precio correcto para esa cuenta, esa cantidad y
ese momento. Un error aquí es el riesgo R-01, el más crítico del proyecto.

## Buenas prácticas

- **Aritmética entera.** `Money.amount` en la menor unidad (centavos). El binario no
  representa 0.1 exactamente, y los céntimos se acumulan.
- **Toda cantidad monetaria lleva moneda.** Sumar dos monedas distintas es un error de
  dominio, no un caso a resolver con una tasa de cambio implícita.
- **Redondea una sola vez, al final**, con regla explícita y documentada (`HALF_UP`).
- **Resolución determinista y documentada**: mismos datos de entrada, mismo resultado,
  siempre.
- **Prioridad explícita** cuando varias listas aplican. Si no hay prioridad definida, es
  un error de configuración, no algo a resolver en silencio.
- **Resolución en lote** para listados: un endpoint, N SKUs, N precios.
- **Congela el precio en el carrito** con su `pricedAt` y revalídalo antes de confirmar.
- **Prueba los bordes de las escalas** explícitamente: 9, 10, 49, 50.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| `float` para dinero | Descuadres de céntimos imposibles de conciliar |
| Redondear en cada paso | El total no coincide con la suma de las líneas |
| Precio sin moneda | Se suman pesos con dólares |
| Precio por defecto si no hay lista | Se vende al precio equivocado |
| Componer el precio en el cliente | El número mostrado no es el cobrado |
| Escalas con solape | Dos precios válidos para la misma cantidad |
| Escalas con hueco | Cantidades sin precio |
| No revalidar antes de confirmar | Se cobra un precio distinto al mostrado |
| Cachear precios en capa compartida | Un cliente ve el precio de otro |
| Impuesto calculado en el frontend | Total incorrecto, riesgo fiscal |

## Patrones

**Value object `Money`**

```
class Money {
  private constructor(readonly amount: number, readonly currency: Currency) {}
  static of(amount: number, currency: Currency) {
    if (!Number.isInteger(amount)) throw new MoneyMustBeIntegerError()
    return new Money(amount, currency)
  }
  add(other: Money): Money {
    if (this.currency !== other.currency) throw new CurrencyMismatchError()
    return new Money(this.amount + other.amount, this.currency)
  }
  multiply(factor: number): Money { return new Money(roundHalfUp(this.amount * factor), this.currency) }
}
```

**Escalas sin solape ni hueco** — invariante del agregado, verificado al construir la lista:

```
[ { minQty: 1,   unitPrice: 104166 },
  { minQty: 50,  unitPrice: 98500  },
  { minQty: 100, unitPrice: 94200  } ]
// resolver(qty) = la escala con mayor minQty ≤ qty
```

**Resolución en lote**

```
POST /api/v1/pricing/resolve
{ "items": [{ "sku": "TAL-500", "quantity": 12 }, ...] }   // hasta 100
→ { "prices": [{ "sku": "TAL-500", "unitPrice": {...}, "tiers": [...] }, ...] }
```

**Revalidación en checkout** — si algún precio cambió, se devuelve `PRICING_PRICE_CHANGED`
con `meta.changes` para que la UI muestre exactamente qué cambió.

**Cabeceras correctas**

```
Cache-Control: private, no-store
Vary: Cookie
```

## Antipatrones

- **Precio como columna en `variants`**: hace imposible el modelo B2B desde el primer día.
- **Descuentos en cascada** (10% + 5% + 3%): ambigüo, irreproducible e imposible de auditar.
- **Precio calculado en un getter** que consulta la base de datos.
- **Redondeo distinto en frontend y backend**: descuadres de un céntimo que erosionan la
  confianza.
- **Tasas de cambio en el modelo de precios**: es otro contexto.
- **Precio negativo permitido**: bloquéalo en el value object.

## Ejemplos

**Bien**

```
const unit  = priceList.resolve(sku, quantity)          // Money
const total = unit.multiply(quantity)                    // redondeo controlado
const tax   = taxPolicy.compute(total, account.taxProfile)
const grand = total.add(tax)                             // error si difieren monedas
```

**Mal**

```
const total = product.price * qty * 1.19    // float, sin moneda, impuesto codificado
```

## Convenciones

- `Money` en `@eusse/domain`, usado por dominio y contratos.
- API: `{ amount: 104166, currency: "COP" }` — entero en centavos.
- Base de datos: `numeric(18,4)` + `char(3)`.
- Redondeo `HALF_UP` en un único helper compartido.
- Reglas numeradas `PRC-01`…`PRC-06`, referenciadas en código y tests.

## Checklist

- [ ] `Money` con enteros; `float` prohibido
- [ ] Moneda obligatoria en todo importe
- [ ] Error de dominio al sumar monedas distintas
- [ ] Redondeo una sola vez, con regla documentada
- [ ] Escalas sin solape ni hueco (invariante probado)
- [ ] Bordes de escala probados (9, 10, 49, 50)
- [ ] Prioridad definida si varias listas aplican
- [ ] Sin precio por defecto ante ausencia de lista
- [ ] Resolución en lote sin N+1
- [ ] Vigencia (`validFrom`/`validTo`) respetada
- [ ] `Cache-Control: private, no-store` + `Vary: Cookie`
- [ ] Test de aislamiento entre cuentas
- [ ] Revalidación antes de confirmar la orden
- [ ] Cobertura de dominio ≥ 95%

## Plantillas

[`rfcs/RFC-0006-cart-and-b2b-pricing.md`](../rfcs/RFC-0006-cart-and-b2b-pricing.md) ·
[`skills/ecommerce-b2b.md`](ecommerce-b2b.md)
