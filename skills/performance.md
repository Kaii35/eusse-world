# Skill — Rendimiento

## Objetivo

Que el sistema sea rápido y **se perciba** rápido, con presupuestos que rompen el build
cuando se superan.

## Buenas prácticas

- **Mide antes de optimizar.** Sin perfil, no hay optimización: hay superstición.
- **Optimiza lo que el usuario sufre**, no lo que parece lento en el código.
- **Presupuestos en CI.** Un número que rompe el build es la única defensa contra la
  degradación gradual.
- **Mide en p75/p95, en móvil y red realista.** El portátil del desarrollador miente.
- **Reserva el espacio antes de tener el dato**: CLS = 0.
- **Trabajo pesado a colas.** La petición HTTP no espera a generar un PDF.
- **Consultas en lote.** N+1 es la causa número uno de endpoints lentos.
- **Caché con política de invalidación escrita**, o no hay caché.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Optimizar sin medir | Se complica el código sin ganar nada |
| Medir en local con datos de juguete | Todo parece rápido hasta producción |
| N+1 en un listado | 60 tarjetas = 61 consultas |
| Cargar todo el bundle en la primera visita | LCP arruinado |
| Imagen sin dimensiones | CLS alto |
| Fuente sin `swap` | Texto invisible durante la carga |
| Cachear respuestas privadas en capa compartida | Fuga de datos entre usuarios |
| `useEffect` en cascada | Peticiones en serie en vez de en paralelo |
| Animar propiedades que provocan layout | Jank |
| Índice ausente | Funciona con 100 filas, muere con 100 000 |

## Patrones

**Resolución en lote en vez de N+1**

```
// Mal: 60 peticiones
products.map((p) => usePrice(p.sku))
// Bien: 1 petición
usePrices(products.map((p) => p.sku))
```

**Skeleton que reserva el espacio exacto**

```
<div className="h-7 w-32 animate-pulse rounded bg-muted" />   {/* mismo tamaño que el precio */}
```

**Carga diferida de lo no crítico**

```
const Testimonials = dynamic(() => import('./testimonials'))
const Chart = dynamic(() => import('./chart'), { ssr: false })
```

**Presupuesto en CI**

```
// size-limit
[{ "path": ".next/static/chunks/app/[locale]/page-*.js", "limit": "120 KB" }]
```

**Caché por evento**

```
// invalidación dirigida, no por tiempo
revalidateTag(`product:${productId}`)   // al consumir catalog.ProductPublished.v1
```

**Consulta verificada**

```sql
EXPLAIN ANALYZE
SELECT ... FROM catalog.variants v WHERE v.category_id = $1 AND v.attributes @> $2
ORDER BY v.created_at DESC LIMIT 21;
-- Index Scan using idx_variants_category_created  (actual time=0.08..1.2 rows=21)
```

Adjunta al PR. Si aparece `Seq Scan` en una tabla grande, no se mergea.

## Antipatrones

- **`useMemo` y `useCallback` en todo**: coste sin beneficio, ruido en el código.
- **Optimización prematura del render** antes de haber resuelto la red y las consultas.
- **Caché sin invalidación**: datos obsoletos indefinidamente.
- **Cachear en capa compartida cualquier respuesta con `Set-Cookie`.**
- **Virtualizar una lista de 30 elementos.**
- **Subir el presupuesto porque "no cabe"**: se investiga por qué creció.
- **Micro-optimizar JavaScript** cuando el cuello de botella es una consulta de 800 ms.

## Ejemplos

**Bien — listado de catálogo**

```
// Servidor: productos + medios en una consulta
const { items, nextCursor } = await sdk.catalog.list({ categoryId, cursor })
// Cliente: precios de los 20 SKUs visibles en una sola petición
const prices = usePrices(items.map((i) => i.sku))
```

Dos peticiones para 20 productos con precio por cuenta.

**Mal**

```
{items.map((item) => <ProductCard key={item.id} sku={item.sku} />)}
// cada ProductCard hace su propio usePrice(sku) → 20 peticiones
```

## Convenciones

- Presupuestos en [`docs/04-standards.md`](../docs/04-standards.md) §6.
- `size-limit` por ruta, activo en CI.
- Lighthouse CI en cada PR sobre las rutas públicas.
- `EXPLAIN ANALYZE` adjunto en todo PR con consulta de listado.
- Medición en p75 móvil, red 4G simulada.
- Subir un presupuesto requiere RFC con motivo.

## Checklist

- [ ] Presupuesto de la ruta definido y activo en CI
- [ ] LCP, INP y CLS dentro de objetivo (p75 móvil)
- [ ] JS inicial dentro de presupuesto
- [ ] Sin N+1, verificado con logs de consultas
- [ ] Índices verificados con `EXPLAIN ANALYZE`
- [ ] Caché con política de invalidación escrita
- [ ] Ninguna respuesta privada en caché compartida
- [ ] Imágenes con dimensiones y formatos modernos
- [ ] Fuentes autoalojadas con `swap` y subconjunto
- [ ] Sin recursos bloqueantes en la ruta crítica
- [ ] Trabajo pesado fuera de la petición
- [ ] Sólo `transform` y `opacity` animados
- [ ] Prueba de carga con volumen del año 1
- [ ] Sin regresión frente al despliegue anterior
- [ ] Mejoras documentadas con números antes/después

## Plantillas

[`docs/04-standards.md`](../docs/04-standards.md) §6 ·
[`docs/09-scalability.md`](../docs/09-scalability.md)
