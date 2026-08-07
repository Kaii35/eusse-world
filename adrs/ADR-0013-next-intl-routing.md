# ADR-0013 — next-intl con prefijo de ruta por locale

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** i18n + Arquitecto · **RFC** RFC-0014 |
| ------ | --- |

## Contexto

Español e inglés desde el lanzamiento. Retrofit de i18n es de las refactorizaciones más
caras que existen: obliga a tocar cada componente (riesgo R-12). Además, la landing y el
catálogo necesitan ser indexables en ambos idiomas.

## Decisión

**next-intl** con enrutamiento por **prefijo de ruta**: `/es/...` y `/en/...`.

Resolución del locale: prefijo de URL → preferencia guardada del usuario →
`Accept-Language` → `es`. **La preferencia del usuario gana sobre la IP.**

Reglas: cero literales en el código (lint bloqueante) · plurales con ICU · sin concatenar
fragmentos traducidos · formatos con `Intl` · **la moneda sale del importe, no del locale**.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| Subdominio (`es.eusse.world`) | Complica certificados, cookies y sesión compartida entre idiomas |
| Parámetro de query (`?lang=es`) | Malo para SEO; frágil; se pierde al navegar |
| Cookie sin cambiar la URL | Una misma URL con dos contenidos: rompe la caché de CDN y el SEO |
| Detección sólo por IP | Un colombiano en Miami quiere español |
| react-i18next | Menos integrado con App Router y con Server Components |
| Añadir i18n más adelante | Coste multiplicado; en la práctica no se hace |

## Consecuencias

**Positivas** — cada idioma tiene su URL: indexable, cacheable y compartible · `hreflang`
natural · integración nativa con Server Components · añadir un idioma es añadir un archivo
de mensajes.

**Negativas** — todas las URLs internas llevan prefijo (hay que usar el `Link` de
next-intl, no el de Next) · el middleware añade una comprobación por petición · duplicación
de rutas en el sitemap.

**Neutras** — obliga a mantener paridad de claves entre idiomas, verificada en CI.

## Criterio de revisión

Si se abre un mercado con dominio propio (`eusse.com.mx`), se evalúa un modelo mixto de
dominio + prefijo.

## Enlaces

[RFC-0014](../rfcs/RFC-0014-i18n-and-multicurrency.md) · [`skills/i18n.md`](../skills/i18n.md) ·
[`skills/seo.md`](../skills/seo.md)
