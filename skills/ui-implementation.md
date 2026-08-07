# Skill — Implementación de UI

## Objetivo

Convertir un diseño en interfaz real que funcione en ambos temas, en cuatro anchos, con
teclado, con lector de pantalla y sin superar el presupuesto de rendimiento.

> **Invoca la skill `ui-ux-pro-max` antes de construir.**

## Buenas prácticas

- **Empieza por los estados, no por el camino feliz.** Loading, empty y error son la mitad
  del trabajo real y donde se nota la calidad.
- **Móvil primero** en la implementación, aunque el diseño priorice escritorio.
- **Reserva el espacio antes de tener el dato.** El skeleton tiene el tamaño exacto del
  contenido final. Así CLS = 0.
- **Composición sobre configuración.** Mejor `<Card><CardHeader/>…</Card>` que
  `<Card title header footer badge>`.
- **`cn()` siempre** para componer clases, para que el consumidor pueda sobrescribir.
- **Números tabulares** en precios, cantidades y tablas: si no alinean, se ve amateur.
- **Imágenes con `next/image`**, dimensiones explícitas y `alt` significativo.
- **Comprueba en oscuro mientras construyes**, no al final.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Sólo el estado con datos | Se descubren los vacíos y errores en producción |
| Skeleton de tamaño distinto al contenido | Salto de layout; CLS alto |
| Spinner centrado en vez de skeleton | Se percibe más lento de lo que es |
| Valores mágicos de Tailwind | Deriva del sistema |
| Modo oscuro al final | Se rehace la mitad |
| `div` con `onClick` | Sin teclado, sin rol, sin foco |
| `alt=""` en imagen de producto | Inaccesible y peor SEO |
| Animar `width`/`height`/`top` | Reflow y jank |
| Componente de 400 líneas | Imposible de revisar y de reutilizar |
| Texto escrito directamente en el JSX | Bloquea i18n desde el minuto uno |

## Patrones

**Los cinco estados**

```
if (isLoading) return <ProductGridSkeleton count={12} />
if (isError)   return <ErrorState onRetry={refetch} error={error} />
if (!data?.items.length) return <EmptyState title={t('catalog.empty.title')}
                                            action={<ClearFiltersButton />} />
return <ProductGrid items={data.items} />
```

**Skeleton que coincide con el layout real** — mismas dimensiones, mismo grid, mismos
espacios. Sin saltos.

**Composición**

```
<ProductCard>
  <ProductCard.Media src={p.image} alt={p.name} />
  <ProductCard.Body>
    <ProductCard.Title>{p.name}</ProductCard.Title>
    <ProductCard.Sku>{p.sku}</ProductCard.Sku>
    <PriceZone sku={p.sku} />
  </ProductCard.Body>
  <ProductCard.Actions><AddToCartButton sku={p.sku} /></ProductCard.Actions>
</ProductCard>
```

**Zona de precio con sus estados** — el componente más delicado del sistema:

```
if (!session)          return <SignInToSeePrice />     // sin número, nunca
if (isLoading)         return <PriceSkeleton />        // tamaño exacto
if (error?.code === 'PRICING_NO_PRICE_FOR_ACCOUNT') return <ContactAdvisor />
return <Price value={price.unit} tiers={price.tiers} />
```

**Vidrio con fallback**

```
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--surface-solid-fallback); }
}
```

## Antipatrones

- **Componente que hace fetch, calcula y renderiza**: tres responsabilidades.
- **Estilos en línea** en vez de tokens.
- **`useEffect` para medir y posicionar** lo que CSS resuelve.
- **Animar en el hilo principal** propiedades que provocan layout.
- **Duplicar un componente para cambiar un detalle**: se añade una variante.
- **Mostrar datos sin diseñar el caso de "no hay datos"**.

## Ejemplos

**Bien**

```
<button
  type="button"
  onClick={handleAdd}
  disabled={isPending}
  className={cn(button({ variant: 'primary', size: 'md' }), className)}
>
  {isPending ? <Spinner className="mr-2 size-4" /> : <PlusIcon className="mr-2 size-4" />}
  {t('product.addToCart')}
</button>
```

**Mal**

```
<div className="bg-blue-600 text-white p-2 rounded" onClick={handleAdd}>
  Añadir al carrito
</div>
```

Ni es botón, ni tiene estado de carga, ni token, ni traducción.

## Convenciones

- Un componente por archivo, `PascalCase.tsx`.
- ≤ 150 líneas; si crece, se descompone.
- Props con `type`; nombres de handlers `onX` en props, `handleX` en implementación.
- Clases ordenadas automáticamente por Prettier.
- Iconos importados uno a uno, nunca el paquete completo.
- Motion cargado dinámicamente en secciones no críticas.

## Checklist

- [ ] Los cinco estados implementados
- [ ] Skeleton con dimensiones del contenido real
- [ ] Sólo tokens: cero valores mágicos
- [ ] Claro y oscuro verificados
- [ ] Estados de interacción: hover, focus-visible, active, disabled, loading
- [ ] Teclado completo, foco visible
- [ ] Contraste AA en ambos temas
- [ ] `prefers-reduced-motion` respetado
- [ ] Sólo `transform` y `opacity` animados
- [ ] Imágenes con dimensiones y `alt`
- [ ] Números tabulares en precios y cantidades
- [ ] Probado en 375, 768, 1280, 1920 px
- [ ] Sin literales de texto
- [ ] Presupuesto de bundle respetado
- [ ] Story publicada

## Plantillas

[`templates/component.md`](../templates/component.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) ·
[`skills/motion-animation.md`](motion-animation.md)
