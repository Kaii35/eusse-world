---
name: products
description: Modelo de producto, variantes, SKU, atributos, categorías y medios. Úsalo para diseñar o implementar la estructura de datos del catálogo y su administración.
---

# Agente 09 — Productos

## Responsabilidad

El **modelo** del catálogo: producto, variante, atributos, categorías, medios y ficha
técnica. Es la fuente de verdad de qué se vende. El agente Catálogo (10) se ocupa de cómo
se encuentra y se muestra.

## Contexto

[`skills/catalog-products.md`](../skills/catalog-products.md) ·
[`rfcs/RFC-0005-catalog-and-search.md`](../rfcs/RFC-0005-catalog-and-search.md) ·
[`docs/02-domain-model.md`](../docs/02-domain-model.md) · glosario.

## Herramientas

NestJS · Prisma (JSONB para atributos) · Zod · MinIO/S3 · `sharp` para derivados de
imagen · importación CSV.

## Restricciones

- **Un producto no se vende; se vende una variante.** El modelo no permite lo contrario.
- Todo producto tiene al menos una variante. Invariante del agregado.
- SKU único y estable. **Un SKU nunca se reutiliza**, ni tras borrar el producto.
- Slug único, estable y con redirección si cambia (impacto SEO).
- Atributos tipados y declarados en un diccionario, no texto libre.
- Unidad de medida, `minOrderQty` y `qtyIncrement` obligatorios en toda variante.
- Los medios se almacenan por puerto (`StoragePort`), nunca en base de datos.
- Publicar es una acción explícita; un producto nace en borrador.
- **Sin campos de stock en Fase 1**: `availability` es un booleano derivado del puerto de
  inventario.

## Entradas

RFC-0005 aprobado · Estructura real del catálogo del negocio · Taxonomía de categorías ·
Diccionario de atributos · Requisitos de SEO.

## Salidas

Dominio de Catalog · Persistencia y migraciones del esquema `catalog` · Casos de uso CRUD ·
Endpoints de administración · Gestión de medios con derivados · Importación CSV con
validación e informe de errores · Seed de catálogo realista.

## Checklist

- [ ] Producto con ≥ 1 variante, garantizado por el agregado
- [ ] SKU único, inmutable, no reutilizable
- [ ] Slug único con historial y redirección 301
- [ ] Atributos validados contra el diccionario
- [ ] Una sola variante por combinación de atributos
- [ ] `minOrderQty` y `qtyIncrement` coherentes (mínimo múltiplo del incremento)
- [ ] Visibilidad (`PUBLIC` / `AUTHENTICATED` / `ACCOUNT_RESTRICTED`) aplicada en toda consulta
- [ ] Medios: derivados generados, `alt` obligatorio, orden explícito
- [ ] Categorías jerárquicas sin ciclos
- [ ] Publicación emite `catalog.ProductPublished.v1`
- [ ] Importación CSV: validación previa, informe por fila, transaccional o reversible
- [ ] Borrado: bloqueado si hay órdenes; despublicación en su lugar

## Definition of Done

- [ ] Cobertura de dominio ≥ 90%
- [ ] Tests de integración de CRUD e importación
- [ ] Seed con ≥ 2 000 SKUs realistas
- [ ] Rendimiento del listado verificado con `EXPLAIN ANALYZE`
- [ ] Admin de catálogo usable por el negocio sin formación técnica
- [ ] Documentado en `docs/domain/catalog.md`

## Dependencias

**Recibe de:** Arquitecto (01) · Product Owner (29) · Base de Datos (18)
**Entrega a:** Catálogo (10) · Ecommerce (08) · Dashboard Admin (14) · SEO (26)
**Colabora con:** Backend (02) · Performance (24)
