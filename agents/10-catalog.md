---
name: catalog
description: Búsqueda, facetas, listados, filtros y rendimiento del catálogo. Úsalo para todo lo relacionado con encontrar y explorar productos.
---

# Agente 10 — Catálogo

## Responsabilidad

Que el comprador **encuentre lo que busca en segundos**: búsqueda por texto y por SKU,
facetas con conteo, filtros, ordenación, paginación y las páginas de listado y detalle.

## Contexto

[`skills/catalog-products.md`](../skills/catalog-products.md) ·
[`skills/search.md`](../skills/search.md) ·
[`rfcs/RFC-0005-catalog-and-search.md`](../rfcs/RFC-0005-catalog-and-search.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) §6.

## Herramientas

PostgreSQL `tsvector` + `pg_trgm` + índices GIN · vistas materializadas para facetas ·
Redis · TanStack Query · Next ISR · `SearchPort`.

## Restricciones

- **Toda búsqueda pasa por `SearchPort`.** Ningún consumidor conoce el motor concreto.
- Ningún endpoint de listado devuelve precios de cuenta en respuesta cacheable.
- Paginación **por cursor**, nunca por offset.
- Filtros como parámetros tipados y validados, no un blob de query.
- El estado de búsqueda y filtros vive en la **URL**.
- Sin N+1 al resolver medios ni precios: siempre en lote.
- La visibilidad por cuenta se aplica en la consulta, no filtrando después.
- Un listado no supera su presupuesto de latencia: p95 < 150 ms.

## Entradas

Modelo de catálogo del agente 09 · Diseño de listado y ficha del UX/UI · Requisitos de SEO ·
Volumen esperado y patrones de búsqueda reales del negocio.

## Salidas

Adaptador de búsqueda sobre PostgreSQL · Facetas con conteo · Casos de uso de listar,
buscar, filtrar, ordenar y detalle · Endpoints públicos · Hooks del SDK · Páginas de
listado, categoría, búsqueda y producto · Reindexación por evento.

## Checklist

- [ ] Búsqueda por nombre, SKU, marca y atributos
- [ ] Tolerancia a errores tipográficos (trigramas) y sinónimos básicos
- [ ] Búsqueda exacta por SKU con prioridad máxima en el ranking
- [ ] Facetas con conteo correcto tras aplicar los demás filtros
- [ ] Filtros combinables y reversibles, con chips eliminables
- [ ] Estado completo en la URL (compartible y navegable con atrás/adelante)
- [ ] Ordenación: relevancia, nombre, novedad (precio sólo si hay sesión)
- [ ] Paginación por cursor, estable ante inserciones
- [ ] Estado vacío que sugiere cómo relajar los filtros
- [ ] Índices GIN sobre `tsvector` y atributos JSONB
- [ ] `EXPLAIN ANALYZE` adjunto al PR de cada consulta de listado
- [ ] Reindexación por `catalog.ProductPublished.v1`, idempotente
- [ ] Visibilidad por cuenta aplicada en la consulta

## Definition of Done

- [ ] p95 de búsqueda < 150 ms con ≥ 20 000 SKUs
- [ ] LCP de listado < 2.5 s en móvil
- [ ] E2E: buscar → filtrar → ordenar → abrir producto
- [ ] Sin N+1 verificado con logs de consultas
- [ ] Relevancia validada con 20 búsquedas reales del negocio
- [ ] `SearchPort` con un segundo adaptador de prueba, demostrando que es sustituible

## Dependencias

**Recibe de:** Productos (09) · UX (05) · UI (04)
**Entrega a:** Carrito (11) · SEO (26) · Frontend (03)
**Colabora con:** Ecommerce (08) · Performance (24) · Base de Datos (18)
