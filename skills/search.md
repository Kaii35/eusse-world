# Skill — Búsqueda

## Objetivo

Que el comprador encuentre lo que busca en el primer intento, con PostgreSQL en Fase 1 y
sin quedar atado a él.

## Buenas prácticas

- **Todo pasa por `SearchPort`.** Ningún consumidor conoce el motor. Cambiar a Meilisearch
  debe ser cambiar un adaptador.
- **El SKU manda.** Una coincidencia exacta de SKU va primero, siempre, por encima de
  cualquier puntuación de relevancia.
- **Facetas con conteo real**, calculadas tras aplicar los demás filtros.
- **Tolerancia a errores tipográficos** con trigramas (`pg_trgm`), pero sin sacrificar la
  precisión de la coincidencia exacta.
- **Estado de búsqueda en la URL**: compartible, navegable, recuperable.
- **Paginación por cursor**, estable ante inserciones.
- **Índices GIN** sobre `tsvector` y sobre atributos JSONB.
- **Mide la relevancia con búsquedas reales del negocio**, no con las tuyas.

## Errores comunes

| Error                                           | Consecuencia                                          |
| ----------------------------------------------- | ----------------------------------------------------- |
| Buscar sólo por nombre                          | El comprador B2B busca por SKU y no encuentra nada    |
| `ILIKE '%texto%'`                               | Sin índice utilizable; escaneo completo               |
| Facetas sin conteo                              | El usuario aplica un filtro y obtiene cero resultados |
| Conteo de facetas sin aplicar los otros filtros | Números que mienten                                   |
| Paginación por offset                           | Duplicados y saltos al insertarse filas               |
| Estado sólo en React                            | Enlace no compartible; botón atrás roto               |
| Reindexar todo en cada cambio                   | Coste absurdo                                         |
| Reindexación no idempotente                     | Duplicados en el índice                               |
| Filtrar la visibilidad después de consultar     | Se traen productos que el usuario no puede ver        |
| Sin estado vacío accionable                     | Callejón sin salida                                   |

## Patrones

**Vector de búsqueda ponderado**

```sql
setweight(to_tsvector('spanish', sku), 'A') ||
setweight(to_tsvector('spanish', name), 'B') ||
setweight(to_tsvector('spanish', brand), 'C') ||
setweight(to_tsvector('spanish', description), 'D')
```

Almacenado en columna generada, con índice GIN.

**Coincidencia exacta de SKU primero**

```sql
ORDER BY (v.sku = $query) DESC,          -- exacta primero, siempre
         ts_rank(v.search_vector, q) DESC,
         v.created_at DESC
```

**Facetas con conteo**

```sql
-- para cada faceta: contar aplicando TODOS los filtros MENOS el propio
SELECT attributes->>'brand' AS value, count(*)
FROM catalog.variants
WHERE <filtros excepto marca> AND <visibilidad de la cuenta>
GROUP BY 1 ORDER BY 2 DESC
```

**Reindexación por evento, idempotente** — `catalog.ProductPublished.v1` dispara
reindexación de ese producto, deduplicada por `eventId`.

**Fallback por trigramas** — si la búsqueda de texto completo no devuelve nada, se intenta
por similitud:

```sql
WHERE similarity(v.name, $query) > 0.3 ORDER BY similarity DESC
```

## Antipatrones

- **`SELECT *` con `ILIKE`** en tabla grande.
- **Reconstruir el índice completo en cada publicación.**
- **Motor de búsqueda dedicado en Fase 1**: PostgreSQL basta hasta ~50 000 SKUs y evita un
  servicio más que operar.
- **Búsqueda que ignora la visibilidad por cuenta**: fuga de catálogo restringido.
- **Autocompletado que dispara una petición por tecla** sin debounce.
- **Ordenar por precio en el listado público**: el precio depende de la cuenta.

## Ejemplos

**Bien — estado vacío accionable**

> **Sin resultados para "taladro percutor 220v"**
> con los filtros: Marca: Bosch · Disponibilidad: inmediata
> [Quitar filtros] · [Buscar sólo "taladro"] · [Contactar a un asesor]

**Mal**

> No se encontraron resultados.

## Convenciones

- `SearchPort` en `catalog/domain/ports/search.port.ts`.
- Adaptador Fase 1: `infrastructure/search/postgres-search.adapter.ts`.
- Parámetros: `q`, `categoryId`, `attrs[<key>]`, `sort`, `cursor`, `limit`.
- Orden por defecto: relevancia; sin `q`, por novedad.
- Debounce de 300 ms en la entrada de búsqueda.
- Límite máximo de 100 resultados por página.

## Checklist

- [ ] Búsqueda por nombre, SKU, marca y atributos
- [ ] SKU exacto con prioridad máxima
- [ ] Tolerancia a errores tipográficos
- [ ] Facetas con conteo correcto
- [ ] Filtros combinables, con chips eliminables
- [ ] Estado completo en la URL
- [ ] Paginación por cursor
- [ ] Índices GIN verificados con `EXPLAIN ANALYZE`
- [ ] Visibilidad por cuenta en la consulta
- [ ] Reindexación por evento, idempotente
- [ ] Estado vacío accionable
- [ ] p95 < 150 ms con ≥ 20 000 SKUs
- [ ] Relevancia validada con 20 búsquedas reales
- [ ] `SearchPort` demostradamente sustituible

## Plantillas

[`rfcs/RFC-0005-catalog-and-search.md`](../rfcs/RFC-0005-catalog-and-search.md) ·
[`skills/database-prisma.md`](database-prisma.md)
