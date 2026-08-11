# ADR-0017 — Almacenamiento de medios compatible con S3, tras un puerto

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0005 |
| ------ | --------------------------------------------------------------------------- |

## Contexto

El catálogo mayorista tiene miles de imágenes de producto, además de fichas técnicas en PDF
y, más adelante, adjuntos de chat y material de cursos. Las imágenes son el recurso más
pesado de las páginas de catálogo, y el rendimiento del listado depende de ellas.

## Decisión

Almacenamiento de objetos **compatible con S3**, detrás de `StoragePort`.

- **Local**: MinIO en Docker Compose.
- **Producción**: S3, R2 o equivalente (la elección concreta es de infraestructura, no de
  arquitectura, porque el puerto la aísla).
- Derivados (tamaños y formatos modernos) generados **al subir**, no al servir.
- `next/image` sirve el formato y tamaño adecuados.
- Descargas privadas (documentos de órdenes) con **URL firmada y expiración**.
- `alt` obligatorio en toda imagen: es requisito de accesibilidad y de SEO.

## Alternativas descartadas

| Alternativa                                 | Por qué se descarta                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Imágenes en PostgreSQL                      | Infla la base de datos, ralentiza copias de seguridad y consultas                                      |
| Sistema de archivos del servidor            | No sobrevive a instancias efímeras ni escala horizontalmente                                           |
| Cloudinary / imgix                          | Excelentes, pero coste por transformación y dependencia de un tercero para servir el catálogo completo |
| Generar derivados al vuelo en cada petición | Coste de CPU y latencia en cada visita                                                                 |
| Acoplarse al SDK de un proveedor concreto   | Cambiar de proveedor obligaría a tocar el dominio                                                      |

## Consecuencias

**Positivas** — barato y escalable · el puerto permite cambiar de proveedor sin tocar
dominio · desarrollo local idéntico a producción con MinIO · los derivados se generan una
vez.

**Negativas** — hay que gestionar el ciclo de vida (huérfanos, limpieza) · generar
derivados al subir hace la subida más lenta (se hace en cola) · las URLs firmadas expiran:
el frontend debe manejar la renovación.

**Neutras** — obliga a definir los tamaños de imagen por adelantado, lo que también obliga
a diseñar el layout con dimensiones fijas (bueno para el CLS).

## Criterio de revisión

Si el coste de almacenamiento o de transferencia se vuelve significativo, se evalúa un CDN
con transformación bajo demanda **detrás del mismo puerto**.

## Enlaces

[RFC-0005](../rfcs/RFC-0005-catalog-and-search.md) ·
[`skills/catalog-products.md`](../skills/catalog-products.md) ·
[`skills/performance.md`](../skills/performance.md)
