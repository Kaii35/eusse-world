# RFC-0005 — Catálogo, búsqueda y filtrado

| Campo         | Valor                                                               |
| ------------- | ------------------------------------------------------------------- |
| **Estado**    | Borrador · **Autor** Arquitecto + Productos · **Creado** 2026-08-06 |
| **Revisores** | Catálogo · Base de Datos · SEO · Performance · UX · Product Owner   |
| **Bloque**    | D · Sprints 4–5                                                     |

---

## 1. Problema

El comprador B2B llega buscando algo concreto y normalmente **conoce el SKU**. Si no lo
encuentra en 10 segundos, llama por teléfono y el canal digital ha fracasado.

Hay que modelar un catálogo con variantes y atributos filtrables, hacerlo buscable con
facetas, respetar la visibilidad por cuenta y mantenerlo indexable por buscadores — sin
introducir un motor de búsqueda dedicado en la Fase 1.

## 2. Objetivos y no-objetivos

**Objetivos:** modelo producto/variante con atributos tipados · búsqueda por texto y por
SKU · facetas con conteo · visibilidad por cuenta · listados e ISR indexables · admin de
catálogo · importación CSV · p95 de búsqueda < 150 ms con 20 000 SKUs.

**No-objetivos:** motor de búsqueda dedicado (se deja el puerto) · recomendaciones ·
reseñas · comparador · stock real (F2).

## 3. Alternativas consideradas

**Motor de búsqueda**

| Alternativa                                                      | Descarte                                                                                                                      |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| A. Meilisearch/Typesense desde el día 1                          | Un servicio más que desplegar, operar y sincronizar, para un catálogo que cabe en PostgreSQL                                  |
| **B. PostgreSQL FTS (`tsvector` + `pg_trgm`) tras `SearchPort`** | **Elegida.** Suficiente hasta ~50 000 SKUs; cero infraestructura adicional; el puerto permite cambiar sin tocar dominio ni UI |

**Atributos**

| Alternativa                                               | Descarte                                              |
| --------------------------------------------------------- | ----------------------------------------------------- |
| A. Columnas por atributo                                  | Cada categoría nueva es una migración                 |
| B. EAV                                                    | Consultas imposibles, sin tipos                       |
| **C. JSONB con diccionario de definiciones + índice GIN** | **Elegida.** Flexible, validado, filtrable con índice |

## 4. Diseño

### 4.1 Modelo

```
Product   { id, tenantId, slug, name, description, brand, categoryIds[], status }
Variant   { id, productId, sku, attributes: jsonb, unitOfMeasure,
            minOrderQty, qtyIncrement, visibility, media[], searchVector }
Category  { id, parentId, slug, name, position }
AttributeDefinition { key, label, type, options[], unit, filterable, facetable }
Media     { id, variantId, url, alt, position, type }
```

Invariantes: producto con ≥ 1 variante · SKU único e inmutable · una variante por
combinación de atributos · `minOrderQty` múltiplo de `qtyIncrement` · categorías sin ciclos.

### 4.2 Búsqueda

Vector ponderado: SKU (A) · nombre (B) · marca (C) · descripción (D), en columna generada
con índice GIN.

Orden: **coincidencia exacta de SKU primero**, luego `ts_rank`, luego novedad. Si la
búsqueda de texto no devuelve nada, fallback por similitud de trigramas (tolerancia a
errores tipográficos).

### 4.3 Facetas

Se calculan aplicando todos los filtros **excepto el propio**, para que los conteos no
mientan. Vista materializada para las facetas de categoría, refrescada por el evento
`catalog.ProductPublished.v1`.

### 4.4 Visibilidad

`PUBLIC` · `AUTHENTICATED` · `ACCOUNT_RESTRICTED`. **Se aplica como condición en la
consulta SQL**, nunca filtrando en memoria.

### 4.5 Endpoints

```
GET /api/v1/catalog/products?categoryId=&q=&attrs[key]=&sort=&cursor=&limit=
GET /api/v1/catalog/products/:slug
GET /api/v1/catalog/categories
GET /api/v1/catalog/facets?categoryId=&<filtros aplicados>
POST/PATCH/DELETE /api/v1/admin/catalog/*        (permisos de staff)
POST /api/v1/admin/catalog/import                 (CSV, asíncrono)
```

**Ninguna respuesta de catálogo incluye precios.** Los precios se piden por separado
([RFC-0006](RFC-0006-cart-and-b2b-pricing.md) §4.3).

### 4.6 Renderizado y SEO

Listados y fichas: estático + ISR, revalidados por evento de publicación. Sin precio en el
HTML. JSON-LD `Product` sin `price`. Slug con historial y redirección 301.

### 4.7 Importación CSV

Validación completa **antes** de escribir nada · informe por fila con el motivo del rechazo ·
transaccional o reversible · asíncrona por cola para archivos grandes.

## 5. Impacto

Contextos Catalog y Search (nuevos). Bloquea E (precios y carrito). Índices GIN con impacto
en el coste de escritura, medido y aceptado.

## 6. Riesgos

| Riesgo                                          | Prob. | Impacto | Mitigación                                                                         |
| ----------------------------------------------- | ----- | ------- | ---------------------------------------------------------------------------------- |
| Listado lento con filtros multi-atributo (R-07) | Media | Alto    | Índices GIN + `EXPLAIN ANALYZE` en cada PR + prueba de carga con 50 000 SKUs       |
| Facetas con conteos incorrectos                 | Media | Medio   | Test que compara el conteo de la faceta con el resultado real de aplicar el filtro |
| Búsqueda que no encuentra por SKU               | Media | Alto    | SKU con peso máximo + test con 20 búsquedas reales del negocio                     |
| Fuga de catálogo restringido                    | Baja  | Alto    | Visibilidad en la consulta + test por nivel de visibilidad                         |

## 7. Criterios de aceptación

```gherkin
Escenario: Búsqueda exacta por SKU
  Dado un catálogo con 20.000 variantes
  Cuando se busca "TAL-500"
  Entonces el primer resultado es la variante con SKU TAL-500
  Y la respuesta tarda menos de 150 ms en p95

Escenario: Facetas con conteo correcto
  Dado el listado de "Herramientas eléctricas" filtrado por marca Bosch
  Cuando se muestra la faceta de voltaje
  Entonces cada conteo coincide con el número real de resultados al aplicar ese filtro

Escenario: Visibilidad restringida
  Dada una variante con visibilidad ACCOUNT_RESTRICTED para la cuenta A
  Cuando la cuenta B navega el catálogo
  Entonces esa variante no aparece en ningún listado ni búsqueda

Escenario: El catálogo público no expone precios
  Cuando un visitante sin sesión consulta el listado
  Entonces ninguna respuesta contiene importes
```

## 8. Plan de implementación

Pasos D1–D12 de [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).

## 9. Preparación para fases futuras

**Hueco:** `SearchPort` con un segundo adaptador de prueba, demostrando que es sustituible ·
`InventoryPort` consultado para `availability` (adaptador trivial en F1) · `AttributeDefinition`
admite tipos nuevos sin migración.
**No se construye:** motor dedicado, recomendaciones, inventario real.

## 10. Preguntas abiertas

| #   | Pregunta                                    | Bloquea | Resuelta                                                                                                                |
| --- | ------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | ¿Se indexan las URLs con facetas aplicadas? | D10     | **No** por defecto: canonizan a la categoría. Se decidirá caso a caso si alguna faceta tiene volumen de búsqueda propio |

## 11. Enlaces

[RFC-0006](RFC-0006-cart-and-b2b-pricing.md) · [`skills/catalog-products.md`](../skills/catalog-products.md) ·
[`skills/search.md`](../skills/search.md) · [`skills/seo.md`](../skills/seo.md)
