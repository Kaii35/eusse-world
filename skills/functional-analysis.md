# Skill — Análisis funcional

## Objetivo

Eliminar la ambigüedad antes de que llegue al código. Un caso de uso bien escrito ahorra
tres días de ida y vuelta.

## Buenas prácticas

- **Enumera; no digas "etcétera".** "Y casos similares" es una bomba de relojería.
- **Todo caso de uso incluye sus flujos alternos y de error**, no sólo el feliz.
- **Criterios verificables objetivamente.** "Rápido", "intuitivo" y "fácil" no son
  criterios.
- **Numera las reglas** (`PRC-01`, `CRT-02`) para referenciarlas desde el código y los tests.
- **Ejemplo y contraejemplo** por regla. El contraejemplo aclara más que la definición.
- **Define el comportamiento concurrente.** Dos usuarios de la misma cuenta, el mismo
  carrito, a la vez: ¿qué pasa?
- **Especifica permisos por operación y por rol.**
- **Usa el glosario.** Si falta un término, añádelo.
- **Valida con el negocio.** Escribirlo no es validarlo.

## Errores comunes

| Error                               | Consecuencia                                     |
| ----------------------------------- | ------------------------------------------------ |
| Sólo el camino feliz                | El desarrollador improvisa el resto              |
| "El sistema debe validar los datos" | ¿Qué datos? ¿qué validación? ¿qué pasa si falla? |
| Criterios subjetivos                | Imposible verificar; discusión en la aceptación  |
| Reglas sin identificador            | No se pueden referenciar ni rastrear             |
| No definir la concurrencia          | Bugs de corrupción de datos                      |
| Omitir permisos                     | Cualquiera hace cualquier cosa                   |
| Términos ambiguos ("cliente")       | Se implementa lo que no era                      |
| Proponer la solución técnica        | Se cierra el espacio de diseño prematuramente    |
| No validar con el negocio           | Se construye lo que nadie pidió                  |

## Patrones

**Caso de uso completo**

```
CU-012 · Añadir producto al carrito

Actor:          Comprador autenticado con permiso cart:write
Precondiciones: Cuenta ACTIVE · variante visible para la cuenta · lista de precios vigente
Disparador:     El usuario pulsa "Añadir al carrito"

Flujo principal
 1. El sistema resuelve el precio para la cuenta, el SKU y la cantidad
 2. Valida cantidad ≥ minOrderQty y múltiplo de qtyIncrement          [CRT-02]
 3. Si el SKU ya está en el carrito, suma la cantidad                 [CRT-03]
 4. Congela precio y pricedAt en la línea                             [PRC-03]
 5. Devuelve el carrito actualizado
 6. La UI muestra confirmación y actualiza el contador

Flujos alternos
 A1. Usuario sin sesión → guardar intención firmada → login → revalidar → aplicar  [RFC-0004]
 A2. SKU ya presente    → sumar cantidad, no duplicar línea
 A3. Cantidad ajustable → ofrecer el múltiplo válido más cercano

Flujos de error
 E1. Variante no visible para la cuenta   → CATALOG_VARIANT_NOT_VISIBLE (403)
 E2. Sin lista de precios aplicable       → PRICING_NO_PRICE_FOR_ACCOUNT (422)
 E3. Cantidad < mínimo                    → CART_QTY_BELOW_MINIMUM (422) + meta
 E4. Cantidad no múltiplo                 → CART_QTY_NOT_MULTIPLE (422) + meta
 E5. Cuenta no ACTIVE                     → ACCOUNT_NOT_ACTIVE (403)

Postcondiciones: carrito con la línea, precio congelado, evento cart.ItemAdded.v1 emitido
Concurrencia:    dos usuarios de la misma cuenta añadiendo el mismo SKU → las cantidades
                 se suman; sin pérdida de actualizaciones (bloqueo optimista por versión)
```

**Criterios en Gherkin**

```gherkin
Escenario: Cantidad que no es múltiplo del incremento de venta
  Dado que TAL-500 se vende en cajas de 6 unidades con mínimo 12
  Cuando el comprador intenta añadir 7 unidades
  Entonces el sistema rechaza la operación con CART_QTY_NOT_MULTIPLE
  Y la respuesta incluye qtyIncrement=6 y suggested=12
  Y el carrito no se modifica
```

**Tabla de decisión** — para combinaciones de condiciones:

| Cuenta activa | Crédito suficiente | Total > umbral | Resultado                 |
| ------------- | ------------------ | -------------- | ------------------------- |
| No            | —                  | —              | `ACCOUNT_NOT_ACTIVE`      |
| Sí            | No                 | —              | `ACCOUNT_CREDIT_EXCEEDED` |
| Sí            | Sí                 | No             | Orden `PENDING_PAYMENT`   |
| Sí            | Sí                 | Sí             | Orden `PENDING_APPROVAL`  |

**Casos borde sistemáticos:** vacío · uno · muchos · máximo · nulo · negativo · cero ·
texto muy largo · caracteres especiales · expirado · concurrente.

## Antipatrones

- **Especificación que describe la interfaz** en vez del comportamiento.
- **"El sistema debe ser rápido"**: sin número, no es un requisito.
- **Casos de uso de 15 páginas**: nadie los lee. Divide.
- **Reglas escondidas en prosa** en vez de numeradas.
- **Copiar el proceso manual actual** sin cuestionarlo.
- **Decidir la solución técnica** desde el análisis funcional.

## Convenciones

- `CU-NNN` para casos de uso; `<CTX>-NN` para reglas (`PRC-01`, `CRT-02`, `CHK-03`).
- Criterios en Gherkin, en español.
- Todo término del glosario; los nuevos se añaden.
- Errores referenciados por su código del catálogo.
- Los casos de uso viven en el RFC de su feature.

## Checklist

- [ ] Actor y objetivo claros
- [ ] Precondiciones y postcondiciones explícitas
- [ ] Flujo principal paso a paso, sin saltos
- [ ] Todos los flujos alternos enumerados
- [ ] Todos los flujos de error, con su código
- [ ] Reglas numeradas, con ejemplo y contraejemplo
- [ ] Criterios en Gherkin, verificables
- [ ] Casos borde cubiertos
- [ ] Comportamiento concurrente definido
- [ ] Permisos por rol y por operación
- [ ] Sin ambigüedad ni "etcétera"
- [ ] Lenguaje del glosario
- [ ] Validado con el negocio
- [ ] Arquitecto confirma que es implementable sin preguntas

## Plantillas

[`templates/use-case.md`](../templates/use-case.md) ·
[`docs/13-glossary.md`](../docs/13-glossary.md)
