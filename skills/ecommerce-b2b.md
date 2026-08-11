# Skill — Ecommerce B2B

## Objetivo

Construir comercio mayorista, que **no es comercio minorista con descuentos**. Casi todos
los errores en este proyecto vendrán de aplicar intuiciones de B2C.

## Las diferencias que importan

| B2C                  | B2B (Eusse World)                     | Consecuencia técnica                                 |
| -------------------- | ------------------------------------- | ---------------------------------------------------- |
| Un precio para todos | Precio por cuenta y por volumen       | El precio no puede cachearse en capa compartida      |
| Compra el usuario    | Compra la **cuenta**                  | El carrito y las órdenes pertenecen a la cuenta      |
| Pago inmediato       | Crédito, plazos, transferencia        | El checkout no depende de una pasarela               |
| Carrito de 1–3 ítems | Carrito de 40+ SKUs                   | Tabla, no tarjetas; edición en línea; añadir por SKU |
| Descubrimiento       | **Recompra**                          | El portal se organiza alrededor de repetir pedidos   |
| Catálogo público     | Visibilidad por cuenta                | El filtro de visibilidad va en la consulta           |
| Checkout de 1 paso   | Aprobador, orden de compra, dirección | Estado `PENDING_APPROVAL` desde el día 1             |
| Busca por nombre     | Busca por **SKU**                     | El SKU pesa más que el nombre en el ranking          |
| Compra emocional     | Compra planificada                    | Sin urgencia falsa, sin escasez artificial           |

## Buenas prácticas

- **El precio se resuelve en el servidor, siempre.** El cliente muestra un número que
  recibió; nunca lo compone.
- **Sin sesión, no hay precio de cuenta.** "Inicia sesión para ver tu precio" es una
  respuesta correcta; un precio inventado no lo es.
- **La cuenta es la unidad de todo**: carrito, precios, crédito, direcciones, órdenes.
- **Cantidades con mínimos y múltiplos.** Si se vende en cajas de 6, el sistema no acepta 7.
- **El SKU es de primera clase** en la UI y en la búsqueda: el comprador lo conoce de memoria.
- **La recompra es la función principal.** Optimiza ese camino por encima de todos.
- **Todo importe lleva moneda.** Siempre.
- **Transparencia total en el precio.** Nada cambia entre la ficha y el checkout sin aviso
  explícito.

## Errores comunes

| Error                                      | Consecuencia                                         |
| ------------------------------------------ | ---------------------------------------------------- |
| Cachear la ficha de producto con el precio | Un cliente ve el precio de otro (riesgo R-01)        |
| Carrito por usuario y no por cuenta        | Dos compradores de la misma empresa se pisan         |
| Ignorar múltiplos de venta                 | Pedidos imposibles de despachar                      |
| Buscar sólo por nombre                     | El comprador no encuentra nada                       |
| Checkout de un paso                        | Falta la orden de compra, el aprobador, la dirección |
| Mostrar precio tachado o "desde"           | En B2B es engañoso y destruye la confianza           |
| Calcular el total en el cliente            | El número mostrado puede no ser el cobrado           |
| Diseñar el carrito con tarjetas            | 40 líneas en tarjetas es inmanejable                 |
| Asumir pago con tarjeta                    | La mayoría paga a crédito o por transferencia        |
| Urgencia falsa ("¡Sólo quedan 3!")         | Un comprador profesional lo detecta y desconfía      |

## Patrones

**Resolución de precio**

```
cuenta → lista de precios asignada (vigente) → entrada del SKU → escala por cantidad → Money
```

Sin lista aplicable → `PRICING_NO_PRICE_FOR_ACCOUNT`. **Nunca un precio por defecto.**

**Ficha de producto cacheada + precio en cliente** — la página se cachea e indexa sin
precio; un componente cliente pide el precio autenticado. Rápida y correcta a la vez.

**Resolución en lote** — 60 tarjetas en pantalla = **una** petición de precios con 60 SKUs,
no 60 peticiones.

**Congelado de precio en el carrito** — la línea guarda el precio y su `pricedAt`. Al
confirmar, se revalida; si cambió, se avisa y se pide confirmación.

**Aprobación por umbral** — si el total supera el umbral del comprador, la orden nace en
`PENDING_APPROVAL` y no se cursa hasta que el aprobador actúe.

**Añadir por lista de SKUs** — el comprador pega 30 códigos y cantidades y arma el carrito
en segundos. Es la función que más tiempo ahorra.

## Antipatrones

- **Cupones y promociones de B2C**: el acuerdo comercial ya está en la lista de precios.
- **Escasez artificial y contadores**: el comprador profesional desconfía.
- **Ocultar el coste de envío hasta el final**: motivo número uno de abandono.
- **Registro obligatorio para ver el catálogo**: mata la captación. Explorar es libre.
- **Un solo precio en la base de datos**: el modelo B2B necesita listas desde el día 1.
- **"Productos recomendados" por popularidad general**: al comprador le importa **su**
  histórico.

## Ejemplos

**Bien — zona de precio**

```
Sin sesión:  "Inicia sesión para ver tu precio"  [Iniciar sesión] [Solicitar cuenta]
Con sesión:  $104.166 / unidad
             Desde 50 uds: $98.500   Desde 100 uds: $94.200
             Mínimo: 12 uds (cajas de 6)
```

**Mal**

```
$129.900  ~~$149.900~~   ¡13% de descuento!   ⏰ Oferta por 2 horas
```

Precio de B2C, con descuento falso y urgencia inventada. En B2B destruye credibilidad.

## Convenciones

- `Money = { amount: number (entero, menor unidad), currency: string }`.
- Precios en `numeric(18,4)` + moneda en base de datos.
- Redondeo `HALF_UP`, una sola vez, al final.
- Respuestas con precio: `Cache-Control: private, no-store` + `Vary: Cookie`.
- Reglas numeradas (`PRC-01`, `CRT-02`) referenciadas desde el código y los tests.

## Checklist

- [ ] Precio resuelto sólo en el servidor
- [ ] Sin sesión, sin precio de cuenta
- [ ] Respuestas con precio no cacheables en capa compartida
- [ ] Test: dos cuentas, mismo SKU, precios distintos
- [ ] Carrito de la cuenta, no del usuario
- [ ] Mínimos y múltiplos validados en dominio
- [ ] Búsqueda exacta por SKU con prioridad máxima
- [ ] Resolución de precios en lote (sin N+1)
- [ ] Precio congelado con `pricedAt` y revalidado antes de confirmar
- [ ] Aprobación por umbral implementada
- [ ] Recompra en < 90 s
- [ ] Sin patrones de urgencia o escasez artificial
- [ ] Coste de envío visible antes del último paso

## Plantillas

[`rfcs/RFC-0006-cart-and-b2b-pricing.md`](../rfcs/RFC-0006-cart-and-b2b-pricing.md) ·
[`skills/pricing.md`](pricing.md) · [`skills/cart.md`](cart.md) ·
[`skills/checkout-orders.md`](checkout-orders.md)
