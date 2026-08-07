# Checklist — SEO

Para **páginas públicas**. Para páginas privadas, sólo aplica la sección de indexación.

---

## Indexación — **lo primero**

- [ ] **`noindex` verificado en carrito, checkout, portal de cliente y admin**
- [ ] **Ningún precio de cuenta en HTML cacheado, JSON-LD ni metadatos**
- [ ] `robots.txt` correcto, con referencia al sitemap
- [ ] Sin bloquear CSS ni JS en `robots.txt`
- [ ] Sitemap dinámico, sólo con URLs indexables y `lastmod` real
- [ ] Ninguna URL `noindex` aparece en el sitemap

## Metadatos

- [ ] Título único y descriptivo (≤ 60 caracteres)
- [ ] Meta descripción única y útil (≤ 160 caracteres)
- [ ] Canónica en toda página, apuntando a la versión preferida
- [ ] Canónica en páginas filtradas apuntando a la categoría base
- [ ] OpenGraph completo, con imagen 1200×630
- [ ] Twitter Card

## Estructura

- [ ] **Un solo `h1`** por página
- [ ] Jerarquía de encabezados sin saltos
- [ ] HTML semántico
- [ ] Contenido renderizado en servidor, no sólo en cliente
- [ ] Migas de pan con datos estructurados
- [ ] Enlazado interno coherente
- [ ] Paginación con URLs rastreables

## Datos estructurados

- [ ] JSON-LD válido (verificado con el validador de Google)
- [ ] **Coherente con el contenido visible** — nada inventado
- [ ] `Organization` y `WebSite` en la landing
- [ ] `Product` en la ficha (**sin `price`**: depende de la cuenta)
- [ ] `BreadcrumbList` en catálogo
- [ ] `FAQPage` donde hay preguntas frecuentes

## Internacional

- [ ] `hreflang` recíproco entre `es` y `en`
- [ ] `x-default` declarado
- [ ] `lang` correcto en `<html>`
- [ ] Cada locale con su canónica

## URLs

- [ ] `kebab-case`, legibles, sin IDs
- [ ] Estables en el tiempo
- [ ] **Redirección 301 ante cualquier cambio de slug**
- [ ] Sin cadenas de redirección
- [ ] Sin enlaces rotos

## Contenido e imágenes

- [ ] `alt` significativo en imágenes de producto
- [ ] Contenido real y útil, no relleno
- [ ] Sin contenido duplicado entre URLs

## Rendimiento

- [ ] Core Web Vitals dentro de objetivo (es factor de ranking)
- [ ] Lighthouse SEO = 100

## Verificación

- [ ] Rastreo simulado sin bloqueos ni bucles
- [ ] Search Console sin errores de cobertura
- [ ] **Verificado que ninguna página privada es indexable**
- [ ] Sitemap accesible y enviado
