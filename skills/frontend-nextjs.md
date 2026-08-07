# Skill — Frontend con Next.js

## Objetivo

Aplicaciones rápidas, seguras y mantenibles con App Router y React 19, sin que la lógica
de negocio se filtre al cliente.

## Buenas prácticas

- **Server Component por defecto.** `"use client"` sólo donde haya estado, efectos o
  eventos del navegador, y lo más abajo posible en el árbol.
- **Los datos se obtienen donde se usan**, no se pasan por props seis niveles.
- **Estrategia de renderizado explícita por ruta** (ver [`docs/01-architecture.md`](../docs/01-architecture.md) §4.5).
- **Vertical slices**: un feature contiene su UI, sus hooks, su estado y sus tipos.
- **`loading.tsx` y `error.tsx` en cada segmento** que carga datos.
- **`Suspense` con granularidad**: la parte lenta no bloquea la rápida.
- **Route Handlers sólo para sesión y webhooks.** Cero lógica de negocio.
- **Todo texto por `next-intl`.** Sin excepciones.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| `"use client"` en el layout raíz | Toda la app se vuelve cliente; se pierde RSC |
| `useEffect` para obtener datos | Cascadas de peticiones, parpadeos, sin caché |
| Copiar datos del servidor en Zustand | Dos fuentes de verdad que divergen |
| Lógica de negocio en el componente | Se duplica, no se testea, se desincroniza del backend |
| Calcular precios o totales en el cliente | Riesgo R-01: el número mostrado puede no ser el cobrado |
| Datos privados en rutas cacheadas | Fuga entre usuarios |
| `fetch` directo a la API | Sin tipos, sin manejo uniforme de errores |
| Secreto con prefijo `NEXT_PUBLIC_` | Incidente de seguridad |
| Estado de filtros sólo en React | No se puede compartir el enlace; el botón atrás no funciona |

## Patrones

**Server Component que obtiene datos**

```
// app/[locale]/(shop)/c/[slug]/page.tsx  — sin "use client"
export default async function CategoryPage({ params }) {
  const { slug, locale } = await params
  const category = await sdk.catalog.getCategory({ slug })   // en el servidor
  return <CategoryView category={category} />                 // hoja interactiva dentro
}
```

**Hoja interactiva mínima**

```
"use client"
export function AddToCartButton({ sku }: { sku: string }) { ... }
```

La página sigue siendo servidor; sólo el botón es cliente.

**Hidratación de TanStack Query** — se precarga en el servidor y se hidrata en el cliente:
sin parpadeo y sin doble petición.

**Estado en la URL** — filtros, búsqueda y paginación en *search params*: compartible,
navegable con atrás/adelante, y recuperable al recargar.

**BFF de sesión** — el Route Handler intercambia credenciales por cookie httpOnly. El
navegador nunca ve el token.

**Precio pedido en cliente** — la página de producto se cachea sin precio; un componente
cliente pide el precio autenticado. Así la página es rápida y el precio, correcto.

## Antipatrones

- **`"use client"` arriba del todo**: anula el modelo entero.
- **Prop drilling** de seis niveles cuando el hijo podría obtener el dato.
- **Un `context` por cada cosa**: re-renders masivos.
- **Barrels** (`index.ts` de re-export): rompen tree-shaking.
- **Un feature importando de otro**: acoplamiento que crece sin control.
- **`any` en las respuestas de la API**: se pierde toda la ventaja de los contratos.
- **Middleware con lógica pesada**: se ejecuta en cada petición.

## Ejemplos

**Bien — ficha de producto**

```
// Server: contenido estático, cacheable, indexable
export default async function ProductPage({ params }) {
  const product = await sdk.catalog.getProduct({ slug })
  return (
    <>
      <ProductGallery media={product.media} />
      <ProductInfo product={product} />
      <PriceZone sku={product.defaultVariant.sku} />   {/* client: precio por cuenta */}
    </>
  )
}
```

La página se cachea e indexa; el precio nunca entra en el HTML compartido.

**Mal**

```
"use client"
export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  useEffect(() => { fetch(`/api/products/${params.slug}`).then(...) }, [])
  const total = product?.price * qty * 1.19          // ← negocio en el cliente
}
```

Sin SEO, con parpadeo, con impuesto calculado en el navegador.

## Convenciones

- `app/[locale]/(grupo)/ruta/page.tsx`
- Componentes `PascalCase.tsx`, hooks `use-kebab-case.ts`
- Export nombrado, salvo archivos especiales de Next
- Props con `type`, nunca `React.FC`
- `features/<nombre>/{components,hooks,stores,types}`
- Alias `@/` para `src/`
- Sin `index.ts` de re-export dentro de las apps

## Checklist

- [ ] Server Component salvo necesidad demostrada
- [ ] `"use client"` lo más abajo posible
- [ ] Estrategia de renderizado correcta para la ruta
- [ ] `loading.tsx` y `error.tsx` en segmentos con datos
- [ ] Los cinco estados implementados
- [ ] Errores mapeados por `code`
- [ ] Sin lógica de negocio ni cálculo de precios en cliente
- [ ] Datos privados sin caché compartida
- [ ] Estado de filtros en la URL
- [ ] Sin literales de texto
- [ ] Sin secretos en variables `NEXT_PUBLIC_`
- [ ] Presupuesto de bundle respetado
- [ ] Rutas protegidas verificadas en servidor

## Plantillas

[`templates/component.md`](../templates/component.md) ·
[`skills/state-management.md`](state-management.md) ·
[`skills/forms-validation.md`](forms-validation.md)
