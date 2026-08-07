# Skill — Testing

## Objetivo

Tests que detecten bugs reales, corran rápido y no fallen sin motivo. La suite tiene que
ser algo en lo que el equipo confíe; si no, deja de servir.

## Buenas prácticas

- **Prueba comportamiento, no implementación.** Si refactorizar rompe los tests sin cambiar
  el comportamiento, los tests estaban mal.
- **Mockea la frontera, no el interior.** Nunca mockees el módulo bajo prueba.
- **Integración con PostgreSQL y Redis reales** (Testcontainers). Un mock de Prisma no
  detecta un índice ausente ni una restricción violada.
- **Consulta por rol accesible** (`getByRole`), no por clase ni `data-testid` arbitrario.
  Así el test verifica accesibilidad de paso.
- **Cada test es independiente** y puede correr en paralelo, en cualquier orden.
- **Sin esperas fijas en E2E.** Siempre por condición.
- **Un test inestable se arregla o se borra.** Nunca `skip` y a otra cosa.
- **Los contract tests se escriben antes de la implementación**, en rojo.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Mockear lo que se está probando | El test verifica el mock, no el código |
| Mockear Prisma en tests de integración | No detecta índices, restricciones ni transacciones |
| `data-testid` en todo | Tests acoplados al DOM; no verifican accesibilidad |
| `waitForTimeout(2000)` | Lento y aun así inestable |
| Tests que dependen del orden | Fallan en paralelo y no se sabe por qué |
| Datos compartidos entre tests | Contaminación cruzada |
| Sólo el camino feliz | Los bugs viven en los caminos alternos |
| Test que replica la implementación | Se rompe con cualquier refactor |
| Marcar como `skip` un test inestable | La cobertura miente |
| Perseguir el 100% de cobertura | Tests inútiles de getters y setters |

## Patrones

**Pirámide adaptada al proyecto**

```
        E2E (7 recorridos críticos)          lentos, frágiles, altísimo valor
     Integración (casos de uso)              PostgreSQL + Redis reales
   Contrato (Zod ⟷ handler ⟷ SDK)           rápidos, previenen divergencia
  Unitarios (dominio: invariantes)           milisegundos, cobertura ≥ 90%
```

**Test de invariante**

```
it('debería rechazar una cantidad que no es múltiplo del incremento de venta', () => {
  const rules = SkuSalesRules.of({ minOrderQty: 12, qtyIncrement: 6 })
  expect(() => CartLine.create(sku, Quantity.of(7), price, now, rules))
    .toThrow(CartQtyNotMultipleError)
})
```

**Test de aislamiento entre cuentas** — uno por endpoint privado:

```
it('debería devolver 404 cuando la orden pertenece a otra cuenta', async () => {
  const order = await factory.order({ accountId: accountB.id })
  await api.get(`/orders/${order.id}`).withSession(accountA).expect(404)
})
```

**Test de idempotencia real**

```
it('debería crear una sola orden con 10 confirmaciones concurrentes', async () => {
  const key = uuid()
  const responses = await Promise.all(
    Array.from({ length: 10 }, () => api.post('/checkout/confirm').idempotencyKey(key)),
  )
  expect(new Set(responses.map((r) => r.body.orderId)).size).toBe(1)
})
```

**Fábricas, no fixtures compartidos**

```
const account = await factory.account({ creditLimit: money(5_000_000, 'COP') })
```

Cada test crea lo que necesita, con valores por defecto sensatos y sobrescritura explícita.

**E2E por condición**

```
await page.getByRole('button', { name: /añadir al carrito/i }).click()
await expect(page.getByRole('status')).toContainText('Añadido')   // sin timeouts
```

## Antipatrones

- **Tests de UI acoplados al DOM**: se rompen con cualquier cambio visual.
- **Un E2E por cada caso**: la suite tarda una hora. E2E sólo para recorridos críticos.
- **Snapshots de árboles enormes**: nadie los revisa, se aprueban a ciegas.
- **Aserciones vagas** (`expect(result).toBeTruthy()`).
- **Setup gigante compartido**: cada test arrastra estado ajeno.
- **Cobertura como objetivo en sí mismo.**

## Convenciones

- Nombre: `debería <comportamiento> cuando <condición>`.
- Unitarios junto al archivo (`*.spec.ts`); integración en `test/integration/`; E2E en `e2e/`.
- Fábricas en `@eusse/testing`.
- Cobertura: dominio ≥ 90%, aplicación ≥ 80%. El resto, criterio.
- Presupuesto: unitarios < 60 s, E2E < 10 min.
- MSW sólo para terceros, nunca para la propia API en integración.

## Recorridos críticos (E2E obligatorio)

1. Landing → catálogo
2. Buscar → filtrar → abrir producto
3. **Invitado añade al carrito → login → vuelve al producto → carrito con su precio**
4. Carrito de 10 líneas → checkout completo
5. Recompra en < 90 s
6. Pedido sobre umbral → aprobación
7. Staff: aprobar cuenta → asignar precios → publicar producto

## Checklist

- [ ] Cada invariante con test unitario
- [ ] Cada caso de uso con test de integración (feliz y error)
- [ ] Contract tests escritos antes de implementar
- [ ] Los siete recorridos críticos automatizados
- [ ] Casos borde: vacío, uno, muchos, máximo, nulo, negativo, concurrente
- [ ] Idempotencia probada con concurrencia real
- [ ] Aislamiento entre cuentas probado por endpoint
- [ ] axe integrado en E2E
- [ ] Snapshots visuales en ambos temas
- [ ] Tests independientes y paralelizables
- [ ] Sin esperas fijas
- [ ] Cero tests inestables en 20 ejecuciones
- [ ] Cobertura dentro de umbral
- [ ] Tiempos dentro de presupuesto

## Plantillas

[`templates/test-plan.md`](../templates/test-plan.md) ·
[`skills/qa.md`](qa.md)
