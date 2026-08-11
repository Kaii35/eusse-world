# Skill — Domain-Driven Design

## Objetivo

Modelar el negocio de forma que las reglas vivan en un solo sitio, sean testeables sin
base de datos y el código se lea con las palabras que usa el negocio.

## Buenas prácticas

- **El dominio no importa nada.** Ni NestJS, ni Prisma, ni Zod. Si tu entidad necesita el
  framework, no es una entidad de dominio.
- **Los invariantes se protegen en el constructor y en los métodos**, no en la validación
  de entrada. Una `Order` no puede existir en estado inválido, ni siquiera un instante.
- **Un agregado por transacción.** Si necesitas modificar dos, uno emite un evento y el
  otro reacciona.
- **Value objects para todo concepto con reglas propias.** `Money`, `Sku`, `Email`,
  `Quantity`. Un `number` no sabe que no puede ser negativo.
- **Métodos con nombre del negocio**: `order.approve(approver)`, no `order.setStatus('APPROVED')`.
- **Factorías estáticas con nombre**: `Cart.createFor(accountId)`, `Order.placeFrom(cart)`.
- **Errores de dominio tipados**, con código estable del catálogo.
- **Test unitario por invariante.** Es la parte del sistema que más barato es probar y más
  caro es equivocarse.

## Errores comunes

| Error                                             | Por qué es malo                                           |
| ------------------------------------------------- | --------------------------------------------------------- |
| Entidad con `set` públicos                        | Cualquiera puede romper el invariante                     |
| Lógica de negocio en el caso de uso               | El dominio queda anémico y la regla se duplica            |
| Lógica de negocio en el controller                | Imposible de reutilizar y de testear                      |
| Un agregado gigante (`Order` con todo dentro)     | Contención, bloqueos, transacciones lentas                |
| Referenciar entidades de otro agregado por objeto | Acoplamiento y transacciones que abarcan dos agregados    |
| `throw new Error('algo falló')`                   | El frontend no puede reaccionar; el mensaje no se traduce |
| Usar el modelo de Prisma como entidad de dominio  | El esquema de base de datos dicta las reglas de negocio   |

## Patrones

**Entidad** — identidad estable en el tiempo. `Order`, `Account`, `Product`.

**Value object** — definido por sus valores, inmutable, comparable. `Money`, `Address`,
`Quantity`. Sin identidad.

**Agregado** — frontera transaccional. Se accede sólo por la raíz. Se referencian **por ID**,
nunca por objeto.

**Repositorio** — colección de agregados. Interfaz en `domain/ports`, implementación en
`infrastructure/`. Un repositorio por agregado, no por tabla.

**Servicio de dominio** — lógica que no pertenece a ninguna entidad concreta. Ejemplo:
`PriceResolver` necesita cuenta, catálogo y lista de precios. Es la excepción, no la norma.

**Evento de dominio** — hecho ocurrido, en pasado, inmutable. `OrderPlaced`, no `PlaceOrder`.

**Specification** — regla compleja y reutilizable como objeto: `account.satisfies(new CanPlaceOrderSpec())`.

## Antipatrones

- **Modelo anémico**: entidades sin comportamiento + servicios con toda la lógica.
- **Agregado que abarca todo el módulo**: máxima contención, mínima concurrencia.
- **Entidades de Prisma como dominio**: la base de datos define el negocio.
- **Repositorio genérico** (`Repository<T>` con `findAll`, `save`, `delete`): oculta las
  consultas reales y siempre acaba en `findAll().filter()`.
- **Eventos en presente** (`OrderPlace`): un evento es algo que ya ocurrió.
- **Lógica en getters**: `get total()` que consulta a la base de datos.

## Ejemplos

**Bien**

```
class CartLine {
  private constructor(
    readonly sku: Sku,
    readonly quantity: Quantity,
    readonly unitPrice: Money,
    readonly pricedAt: Date,
  ) {}

  static create(sku, quantity, unitPrice, pricedAt, rules: SkuSalesRules) {
    // Regla CRT-02 — ver RFC-0006
    if (quantity.isBelow(rules.minOrderQty))  throw new CartQtyBelowMinimumError(...)
    if (!quantity.isMultipleOf(rules.qtyIncrement)) throw new CartQtyNotMultipleError(...)
    return new CartLine(sku, quantity, unitPrice, pricedAt)
  }

  increaseBy(quantity: Quantity, rules: SkuSalesRules): CartLine { ... }
  lineTotal(): Money { return this.unitPrice.multiply(this.quantity.value) }
}
```

Imposible construir una línea inválida. La regla vive en un solo sitio. Se testea sin base
de datos.

**Mal**

```
class CartLine {
  sku: string
  quantity: number
  price: number   // ← ¿en qué moneda? ¿centavos o unidades?
}
// La validación vive en el DTO. El servicio calcula el total. Otro servicio también.
```

## Convenciones

- `kebab-case.entity.ts` · `kebab-case.vo.ts` · `kebab-case.event.ts` · `kebab-case.port.ts`
- Constructores privados + factoría estática con nombre.
- Propiedades `readonly` por defecto; mutación mediante métodos con nombre de negocio.
- Errores extienden `DomainError` y llevan `code` del catálogo.
- Los agregados se referencian por ID tipado (`OrderId`, `AccountId`), nunca por objeto.
- Cada regla de negocio lleva su identificador en un comentario: `// Regla CRT-02 — RFC-0006`.

## Checklist

- [ ] `domain/` sin imports de framework, verificado por lint
- [ ] Imposible construir una entidad en estado inválido
- [ ] Un agregado por transacción
- [ ] Referencias entre agregados por ID
- [ ] Value objects donde hay reglas (`Money`, `Quantity`, `Sku`, `Email`)
- [ ] Métodos con nombre del negocio, no `setX`
- [ ] Errores de dominio con código del catálogo
- [ ] Eventos en pasado, con esquema versionado
- [ ] Un test unitario por invariante
- [ ] Cobertura de dominio ≥ 90%
- [ ] Sin dependencia del esquema de base de datos

## Plantillas

[`templates/domain-model.md`](../templates/domain-model.md) ·
[`templates/use-case.md`](../templates/use-case.md) ·
[`templates/event.md`](../templates/event.md)
