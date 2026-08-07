# Skill — Catálogo y productos

## Objetivo

Modelar el catálogo de forma que soporte variantes, atributos filtrables, visibilidad por
cuenta y reglas de venta mayorista, sin romperse cuando el negocio añada una categoría
nueva.

## Buenas prácticas

- **El producto es un concepto comercial; la variante es lo que se vende.** El modelo debe
  hacer imposible vender un producto.
- **SKU único, inmutable y nunca reutilizado**, ni tras borrar. Aparece en órdenes
  históricas y en la contabilidad del cliente.
- **Atributos tipados y declarados en un diccionario**, no texto libre. Sin diccionario no
  hay facetas fiables.
- **Reglas de venta en la variante**: `minOrderQty`, `qtyIncrement`, `unitOfMeasure`. Son
  parte del producto, no del carrito.
- **Publicar es explícito.** Un producto nace en borrador.
- **Slug estable, con historial y redirección 301** si cambia.
- **Medios por puerto** (`StoragePort`), con derivados generados y `alt` obligatorio.
- **Visibilidad aplicada en la consulta**, no filtrando después de traer todo.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Vender el producto y no la variante | Imposible modelar tallas, colores o presentaciones |
| Reutilizar un SKU | Órdenes históricas apuntan a otro producto |
| Atributos como texto libre | Facetas inútiles: "Rojo", "rojo", "ROJO" |
| Precio como columna de la variante | Impide el modelo B2B de listas |
| Stock en el catálogo en Fase 1 | Se duplica cuando llegue Inventario |
| Imágenes en la base de datos | Base inflada, consultas lentas |
| Categorías con ciclos | Bucles infinitos al recorrer el árbol |
| Borrar un producto con órdenes | Rompe el histórico |
| Slug cambiado sin redirección | Se pierde el posicionamiento |
| Filtrar visibilidad en memoria | Se traen productos que el usuario no puede ver |

## Patrones

**Producto → variante**

```
Product  { id, slug, name, description, categoryIds[], brand, status }
Variant  { id, productId, sku, attributes{}, unitOfMeasure,
           minOrderQty, qtyIncrement, visibility, media[] }
```

Invariante: `Product` con ≥ 1 variante; una variante por combinación de atributos.

**Diccionario de atributos**

```
AttributeDefinition { key: 'voltage', label, type: 'enum'|'number'|'text'|'boolean',
                      options?, unit?, filterable: boolean, facetable: boolean }
```

Los valores se validan contra la definición antes de guardarse.

**Visibilidad por cuenta**

```
PUBLIC              visible sin sesión
AUTHENTICATED       visible con cualquier sesión
ACCOUNT_RESTRICTED  visible sólo para las cuentas listadas
```

Se traduce a una condición en la consulta SQL, siempre.

**Medios con derivados** — al subir, se generan tamaños y formatos modernos; se guarda la
URL canónica y las variantes. `next/image` sirve el correcto.

**Importación CSV** — validación completa antes de escribir nada, informe por fila, y
transacción o reversión. Nunca "importó la mitad".

**Publicación como evento** — `catalog.ProductPublished.v1` dispara reindexación,
invalidación de ISR y analítica.

## Antipatrones

- **EAV puro**: consultas imposibles y sin tipos. JSONB con esquema validado es mejor.
- **Una tabla por categoría de producto**: no escala.
- **Campo `extra` de texto libre** para lo que no encaja: acaba conteniendo todo.
- **Categoría como string** en el producto: sin jerarquía y con errores de tecleo.
- **Borrado físico**: rompe órdenes históricas. Se despublica.
- **Miniaturas generadas al vuelo en cada petición**: coste y latencia.

## Ejemplos

**Bien**

```
Product  "Taladro percutor industrial X"
  Variant TAL-500-110V  { voltage: 110, power: 500, color: 'azul' }
                        minOrderQty 12, qtyIncrement 6, unitOfMeasure BOX
  Variant TAL-500-220V  { voltage: 220, power: 500, color: 'azul' }
```

**Mal**

```
Product { name: "Taladro 110V azul", sku: "TAL-500", price: 129900,
          stock: 45, extra: "min 12 unidades, cajas de 6" }
```

Sin variantes, con precio único, con stock prematuro y con reglas de venta en texto libre.

## Convenciones

- Esquema `catalog` de PostgreSQL.
- SKU en mayúsculas, con formato validado.
- Slug `kebab-case`, único, con tabla de historial.
- Atributos en JSONB con índice GIN.
- Estados: `DRAFT` `PUBLISHED` `UNPUBLISHED` `ARCHIVED`.
- Medios con `alt` obligatorio y `position` explícita.

## Checklist

- [ ] Producto con ≥ 1 variante (invariante del agregado)
- [ ] SKU único, inmutable, no reutilizable
- [ ] Una variante por combinación de atributos
- [ ] Atributos validados contra el diccionario
- [ ] `minOrderQty` múltiplo de `qtyIncrement`
- [ ] Visibilidad aplicada en la consulta SQL
- [ ] Slug único, con historial y redirección 301
- [ ] Categorías jerárquicas sin ciclos
- [ ] Medios con derivados y `alt`
- [ ] Publicación explícita, con evento
- [ ] Importación CSV validada, con informe por fila
- [ ] Borrado bloqueado si hay órdenes
- [ ] Sin campos de stock en Fase 1
- [ ] Seed con ≥ 2 000 SKUs realistas

## Plantillas

[`rfcs/RFC-0005-catalog-and-search.md`](../rfcs/RFC-0005-catalog-and-search.md) ·
[`skills/search.md`](search.md)
