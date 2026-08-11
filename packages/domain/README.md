# @eusse/domain

Tipos, value objects y reglas puras compartidas por backend, frontend y —en Fase 4— móvil.

## Cuándo usarlo

`Money` para cualquier importe · identificadores tipados por marca · `Sku` · reglas de
cantidad (mínimos y múltiplos de venta).

## Cuándo NO usarlo

- **No metas aquí la lógica de un contexto acotado.** El agregado `Order` vive en
  `apps/api/src/modules/orders/domain/`, no aquí. Aquí sólo va lo que **de verdad** se
  comparte entre capas y plataformas.
- **Sin dependencias de runtime salvo `@eusse/utils`.** Es lo que permite reutilizarlo en
  la app móvil sin arrastrar el backend ([docs/07-module-dependencies.md](../../docs/07-module-dependencies.md)).

## Lo más delicado: `Money`

```ts
Money.of(104_166, 'COP') // entero en centavos. NUNCA float
price.multiply(12) // redondeo HALF_UP, una sola vez
price.add(otraMoneda) // lanza CurrencyMismatchError
```

Un error aquí es el riesgo [R-01](../../docs/08-technical-risks.md), el más crítico del
proyecto. Cobertura exigida: **≥ 95%**.

## Reglas de cantidad

`checkQuantity` devuelve `suggested` para que la interfaz pueda ofrecer la corrección
concreta ("Ajustar a 12") en lugar de un mensaje genérico. Es lo que convierte un error
en una acción ([skills/ux-design.md](../../skills/ux-design.md)).
