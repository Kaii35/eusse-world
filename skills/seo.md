# Skill — SEO

## Objetivo

Que el catálogo público se encuentre en buscadores y que **nada privado se indexe jamás**.

## Buenas prácticas

- **Renderizado en servidor para todo lo indexable.** Estático + ISR en landing, categorías
  y fichas de producto.
- **`noindex` en todo lo privado**: carrito, checkout, portal, admin. Verificado por test.
- **Datos estructurados coherentes con lo visible.** JSON-LD que contradice la página es
  motivo de penalización.
- **Un `h1` por página**, con jerarquía sin saltos.
- **Canónica en toda página.**
- **Redirección 301 ante cualquier cambio de slug**, con historial.
- **Core Web Vitals** dentro de objetivo: el rendimiento es factor de ranking.
- **`hreflang` recíproco** entre `es` y `en`, con `x-default`.

## Errores comunes

| Error                                              | Consecuencia                                           |
| -------------------------------------------------- | ------------------------------------------------------ |
| Contenido sólo en cliente                          | El buscador no lo ve                                   |
| Portal o admin indexable                           | Datos de clientes en Google: incidente                 |
| **Precios de cuenta en JSON-LD**                   | Fuga de acuerdos comerciales                           |
| Datos estructurados que no coinciden con la página | Penalización                                           |
| Slug cambiado sin 301                              | Se pierde el posicionamiento acumulado                 |
| Título duplicado en todo el catálogo               | Canibalización                                         |
| Sin canónica en páginas con filtros                | Contenido duplicado masivo                             |
| Sitemap con URLs `noindex`                         | Señales contradictorias                                |
| Imágenes sin `alt`                                 | Se pierde tráfico de imágenes y falla la accesibilidad |
| Paginación sin URLs rastreables                    | Sólo se indexa la primera página                       |

## Patrones

**Metadatos por ruta**

```
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await sdk.catalog.getProduct({ slug })
  return {
    title: `${product.name} · ${product.brand} | Eusse World`,
    description: truncate(product.shortDescription, 160),
    alternates: {
      canonical: `/es/p/${product.slug}`,
      languages: { es: `/es/p/${product.slug}`, en: `/en/p/${product.slug}` },
    },
    openGraph: { images: [{ url: product.image, width: 1200, height: 630 }] },
  }
}
```

**JSON-LD de producto sin precio** — en B2B el precio depende de la cuenta:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Taladro percutor industrial X",
  "sku": "TAL-500",
  "brand": { "@type": "Brand", "name": "Eusse" },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "url": "https://eusse.world/es/p/taladro-percutor-x"
  }
}
```

Sin `price`. Publicar un precio que el cliente no verá es incoherente y penalizable.

**`noindex` verificado por test**

```
it('las rutas privadas no son indexables', async () => {
  for (const path of ['/es/cart', '/es/checkout', '/es/dashboard']) {
    const res = await fetch(base + path)
    expect(await res.text()).toContain('noindex')
  }
})
```

**Canónica en páginas filtradas** — `/c/herramientas?brand=bosch` canoniza a
`/c/herramientas`, salvo que la faceta tenga valor de búsqueda propio y se decida
explícitamente indexarla.

**Sitemap dinámico** — sólo URLs indexables, con `lastmod` real, regenerado por el evento
`catalog.ProductPublished.v1`.

## Antipatrones

- **Cloaking**: mostrar al buscador algo distinto que al usuario.
- **Datos estructurados falsos**: valoraciones o precios inventados.
- **Relleno de palabras clave**: contraproducente desde hace más de una década.
- **Bloquear CSS y JS en `robots.txt`**: el buscador no puede renderizar.
- **Cadenas de redirección** de tres o más saltos.
- **Sitemap estático** que se olvida de actualizar.
- **Indexar facetas combinadas**: explosión de URLs de bajo valor.

## Convenciones

- Título ≤ 60 caracteres, descripción ≤ 160.
- URLs `kebab-case`, estables, sin IDs.
- `/[locale]/p/[slug]` productos, `/[locale]/c/[slug]` categorías.
- Imágenes OpenGraph 1200×630.
- Sitemap segmentado si supera 50 000 URLs.
- Historial de slugs con 301 permanente.

## Checklist

- [ ] Título y descripción únicos por página
- [ ] Un `h1`, jerarquía sin saltos
- [ ] Canónica en toda página
- [ ] `hreflang` recíproco con `x-default`
- [ ] Sitemap dinámico, sólo indexables, con `lastmod` real
- [ ] `robots.txt` correcto, con referencia al sitemap
- [ ] **`noindex` verificado en carrito, checkout, portal y admin**
- [ ] **Sin precios de cuenta en JSON-LD ni en HTML cacheado**
- [ ] JSON-LD válido y coherente con lo visible
- [ ] OpenGraph con imagen correcta
- [ ] 301 ante cambio de slug
- [ ] Sin enlaces rotos ni cadenas de redirección
- [ ] `alt` significativo en imágenes de producto
- [ ] Core Web Vitals dentro de objetivo
- [ ] Migas de pan con datos estructurados
- [ ] Paginación con URLs rastreables

## Plantillas

[`rfcs/RFC-0009-landing-and-brand.md`](../rfcs/RFC-0009-landing-and-brand.md) ·
[`skills/performance.md`](performance.md)
