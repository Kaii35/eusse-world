# RFC-0014 — Internacionalización y multi-moneda

| Campo | Valor |
| ----- | ----- |
| **Estado** | Borrador · **Autor** i18n + Arquitecto · **Creado** 2026-08-06 |
| **Revisores** | Frontend · Ecommerce · SEO · UX · Product Owner |
| **ADR generados** | ADR-0013 |
| **Bloque** | A/C · Sprints 0, 2–3 |

---

## 1. Problema

Añadir idiomas después es de las refactorizaciones más caras que existen: hay que tocar
cada componente. Hacerlo desde el día 1 cuesta poco; hacerlo en el mes seis cuesta semanas
(riesgo R-12).

Lo mismo con la moneda: aunque hoy sólo se venda en pesos colombianos, un modelo de dinero
sin moneda obliga a migrar toda la base de datos cuando llegue el primer cliente en
dólares.

## 2. Objetivos y no-objetivos

**Objetivos:** español e inglés desde el lanzamiento · cero literales en el código ·
formatos correctos por locale · `Money` con moneda desde el día 1 · añadir un idioma =
añadir un archivo · SEO internacional correcto.

**No-objetivos:** más de dos idiomas en Fase 1 · multi-moneda **activa** (modelo preparado,
una moneda operativa) · conversión de divisas · RTL activo · traducción del contenido de
producto por idioma en Fase 1.

## 3. Alternativas consideradas

**Enrutamiento de locale**

| Alternativa | Descarte |
| ----------- | -------- |
| A. Subdominio (`es.eusse.world`) | Complica certificados, cookies y sesión compartida |
| B. Parámetro de query | Malo para SEO; frágil |
| C. Detección por cookie sin cambiar la URL | Una URL con dos contenidos: rompe caché y SEO |
| **D. Prefijo de ruta (`/es/...`, `/en/...`)** | **Elegida.** Indexable, cacheable, compartible, `hreflang` natural |

**Moneda**

| Alternativa | Descarte |
| ----------- | -------- |
| A. `number` y asumir COP | Migración masiva cuando llegue otra moneda |
| **B. `Money { amount, currency }` desde el día 1, con una sola moneda operativa** | **Elegida.** Coste hoy: casi nulo. Ahorro mañana: enorme |

## 4. Diseño

### 4.1 Enrutamiento

`/es/...` (por defecto) y `/en/...`. Middleware de next-intl resuelve el locale por:
prefijo de URL → preferencia guardada del usuario → `Accept-Language` → `es`.

**La preferencia del usuario gana sobre la IP.** Un colombiano en Miami quiere español.

### 4.2 Mensajes

`messages/es.json` y `messages/en.json` por app. Claves por propósito, organizadas por
feature:

```json
{
  "cart": {
    "emptyState": { "title": "…", "description": "…", "action": "…" },
    "itemCount": "{count, plural, =0 {Tu carrito está vacío} one {# producto} other {# productos}}"
  }
}
```

**Reglas duras:** cero literales en el código (regla de ESLint que rompe el build) ·
plurales con ICU · sin concatenación de fragmentos · claves semánticas, no el texto en
español.

### 4.3 Formatos

Todo con `Intl`, expuesto por `@eusse/i18n`:

| Dato | Regla |
| ---- | ----- |
| Fecha | `Intl.DateTimeFormat` con locale y zona horaria del usuario |
| Número | `Intl.NumberFormat` con locale |
| **Moneda** | `Intl.NumberFormat` con **la moneda del importe**, no la del locale |
| Relativo | `Intl.RelativeTimeFormat` |

La moneda es un dato del `Money`. Un usuario en inglés puede comprar en pesos.

### 4.4 Errores localizados

El backend devuelve `code` + `meta`; **no traduce**. El frontend compone:

```
t(`errors.${error.code}`, error.meta)
// errors.CART_QTY_NOT_MULTIPLE: "{sku} se vende en cajas de {qtyIncrement} unidades"
```

Así la API sigue siendo agnóstica de la presentación y sirve igual a la app móvil.

### 4.5 Contenido de producto y de la landing

- **Landing**: `SectionContent` con una fila por locale. Traducible desde el admin.
- **Catálogo en Fase 1**: nombre y descripción en un solo idioma (español). El modelo
  admite una tabla de traducciones, pero **no se construye ahora**: el catálogo mayorista
  colombiano no lo necesita todavía.

### 4.6 SEO internacional

`hreflang` recíproco entre `es` y `en`, con `x-default` apuntando a `es` · `lang` correcto
en `<html>` · canónicas por locale · sitemap con ambas versiones.

### 4.7 Verificación

| Qué | Cómo | Bloquea |
| --- | ---- | ------- |
| Literales en el código | Regla de ESLint | Sí |
| Paridad de claves es/en | Script en CI | Sí |
| Desbordes de layout | Pseudo-localización en preview | No (revisión visual) |
| Formatos | Tests con datos reales por locale | Sí |

### 4.8 Preparación para RTL

Propiedades lógicas de CSS desde el día 1 (`margin-inline`, `padding-inline-start`,
`text-align: start`). Coste cero hoy; hace posible el RTL mañana sin refactor.

## 5. Impacto

Afecta a toda la UI y a todo el contenido. Debe estar activo desde el Bloque A: retrofit
es lo caro.

## 6. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| Deuda de i18n por literales (R-12) | Alta | Medio | Lint bloqueante desde el primer commit |
| Claves faltantes en producción | Media | Medio | Verificación de paridad en CI |
| Desborde de layout al traducir | Media | Bajo | Pseudo-localización en preview |
| Moneda formateada según el idioma | Media | Alto | Formateador que toma la moneda del `Money`; test explícito |
| Traducción automática sin revisar | Media | Medio | Revisión por hablante nativo en textos de cara al cliente |

## 7. Criterios de aceptación

```gherkin
Escenario: Sin literales en el código
  Dado un componente con texto escrito directamente en el JSX
  Cuando se ejecuta pnpm lint
  Entonces el build falla

Escenario: Paridad de claves
  Dada una clave presente en es.json y ausente en en.json
  Cuando se ejecuta la verificación de i18n en CI
  Entonces falla indicando la clave faltante

Escenario: La moneda no depende del idioma
  Dado un usuario con la interfaz en inglés
  Cuando ve un precio de 104.166 COP
  Entonces se formatea como moneda colombiana, no como dólares

Escenario: Plurales correctos
  Cuando el carrito tiene 0, 1 y 5 productos
  Entonces el texto usa la forma plural correcta en ambos idiomas

Escenario: hreflang recíproco
  Cuando se inspecciona /es/p/taladro-x
  Entonces declara hreflang es, en y x-default
  Y la versión en inglés declara los mismos, de forma recíproca
```

## 8. Plan de implementación

Configuración en A10 (Bloque A). Contenido de la landing en C4. Cada feature añade sus
claves en ambos idiomas como parte de su Definition of Done.

## 9. Preparación para fases futuras

**Hueco:** `Money` con moneda desde el día 1 · `PriceList.currency` por lista → multi-moneda
es configuración, no migración · propiedades lógicas de CSS → RTL posible · modelo de
contenido con fila por locale.
**No se construye:** multi-moneda activa, conversión de divisas, RTL, traducción del
catálogo.

## 10. Preguntas abiertas

| # | Pregunta | Bloquea | Resuelta |
| - | -------- | ------- | -------- |
| 1 | ¿Se traduce el catálogo al inglés en Fase 1? | C4 | **No.** El catálogo permanece en español; la interfaz sí se traduce. Se revisa si aparece demanda real de clientes anglófonos |

## 11. Enlaces

[ADR-0013](../adrs/ADR-0013-next-intl-routing.md) · [`skills/i18n.md`](../skills/i18n.md) ·
[`skills/pricing.md`](../skills/pricing.md) · [`skills/seo.md`](../skills/seo.md)
