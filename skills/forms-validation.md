# Skill — Formularios y validación

## Objetivo

Formularios que no pierden datos, validan igual que el servidor y son accesibles.

## Buenas prácticas

- **El mismo esquema Zod en cliente y servidor.** Importado de `@eusse/contracts`. Si
  divergen, hay dos verdades.
- **La validación del cliente es comodidad; la del servidor es la que manda.** Nunca se
  confía en la primera.
- **Validar en `blur`, revalidar en `change` sólo tras el primer error.** Validar en cada
  tecla es hostil.
- **Componentes no controlados** por defecto (React Hook Form): menos re-renders.
- **Nunca se pierden los datos.** Ante error de red, sesión expirada o navegación
  accidental, el formulario conserva lo escrito.
- **Errores junto al campo**, no sólo en un resumen arriba.
- **Deshabilitar el botón mientras se envía** y mostrar estado de carga.
- **Mensajes específicos**: "La cantidad mínima es 12 (cajas de 6)", no "Valor inválido".

## Errores comunes

| Error                                  | Consecuencia                                        |
| -------------------------------------- | --------------------------------------------------- |
| Esquema distinto en cliente y servidor | El usuario pasa el cliente y el servidor lo rechaza |
| Validar en cada pulsación              | Errores en rojo mientras el usuario escribe: hostil |
| Sólo resumen de errores arriba         | En formularios largos no se encuentra el campo      |
| Perder los datos ante un error         | El usuario abandona; con 15 campos, no vuelve       |
| Sin estado de envío                    | Doble envío                                         |
| `placeholder` como etiqueta            | Desaparece al escribir; inaccesible                 |
| Mensajes genéricos                     | El usuario no sabe qué corregir                     |
| Sin `autocomplete`                     | El gestor de contraseñas no funciona                |

## Patrones

**Formulario con esquema compartido**

```
const form = useForm<AddItemToCartRequest>({
  resolver: zodResolver(addItemToCartRequest),   // el mismo del backend
  mode: 'onBlur',
  reValidateMode: 'onChange',
})
```

**Errores del servidor mapeados a campos**

```
onError: (error) => {
  if (error.code === 'CART_QTY_BELOW_MINIMUM') {
    form.setError('quantity', {
      message: t('cart.errors.belowMinimum', { min: error.meta.minOrderQty }),
    })
    return
  }
  toast.error(t('common.unexpectedError'))
}
```

El error del servidor aterriza en el campo correcto, con el dato de `meta`.

**Formulario multi-paso con estado persistido** — cada paso valida su porción del esquema;
el estado se guarda para que recargar no lo destruya.

**Aviso al salir con cambios sin guardar** — `beforeunload` + interceptación de navegación.

**Campo accesible**

```
<label htmlFor={id}>{label}</label>
<input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : hintId} />
{error && <p id={errorId} role="alert">{error.message}</p>}
```

## Antipatrones

- **Validación sólo en el cliente**: se salta con `curl` en cinco segundos.
- **Un `useState` por campo**: re-render en cada tecla.
- **Validación en `useEffect`**: temporización impredecible.
- **`disabled` en un campo requerido**: no se envía y el usuario no entiende por qué.
- **Reset del formulario ante error de servidor**: se pierde todo lo escrito.
- **Formulario de 30 campos en una sola pantalla** sin agrupar ni guardar por pasos.

## Ejemplos

**Bien — checkout con revalidación de precio**

```
const confirm = useMutation({
  mutationFn: (data) => sdk.checkout.confirm(data, { idempotencyKey }),
  onError: (error) => {
    if (error.code === 'PRICING_PRICE_CHANGED') {
      setPriceChanges(error.meta.changes)     // se muestran y se pide confirmar
      return
    }
    ...
  },
})
```

El usuario ve exactamente qué cambió antes de confirmar. Nada se cobra en silencio.

**Mal**

```
<input onChange={(e) => setQty(Number(e.target.value))} />
{qty < 12 && <span style={{color:'red'}}>Inválido</span>}
<button onClick={() => api.addToCart({ qty })}>Añadir</button>
```

Sin etiqueta, sin `aria`, mensaje inútil, sin estado de envío, mínimo codificado a mano.

## Convenciones

- Un esquema por operación, en `@eusse/contracts`.
- `mode: 'onBlur'`, `reValidateMode: 'onChange'`.
- Componente `FormField` de `@eusse/ui` para etiqueta, error y ayuda.
- Mensajes de error en `messages/*.json`, con claves por campo y regla.
- `Idempotency-Key` generada al montar el formulario, no al pulsar enviar.
- `autocomplete` correcto en email, nombre, teléfono y dirección.

## Checklist

- [ ] El mismo esquema Zod en cliente y servidor
- [ ] Validación en `blur`, revalidación en `change` tras el primer error
- [ ] Errores junto al campo, con `aria-describedby` y `role="alert"`
- [ ] `<label>` real en todo campo
- [ ] Mensajes específicos y accionables
- [ ] Botón deshabilitado durante el envío, con estado de carga
- [ ] Datos preservados ante error o navegación
- [ ] Errores del servidor mapeados al campo correcto
- [ ] `autocomplete` configurado
- [ ] Navegable y enviable sólo con teclado
- [ ] Multi-paso: progreso visible y estado persistido
- [ ] `Idempotency-Key` en envíos que crean recursos
- [ ] Textos por `next-intl`

## Plantillas

[`templates/component.md`](../templates/component.md) ·
[`skills/accessibility.md`](accessibility.md)
