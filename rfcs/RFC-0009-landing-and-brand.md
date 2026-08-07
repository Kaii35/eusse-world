# RFC-0009 — Landing page e identidad visual

| Campo | Valor |
| ----- | ----- |
| **Estado** | Borrador · **Autor** UX + UI + Product Owner · **Creado** 2026-08-06 |
| **Revisores** | Design System · SEO · Performance · Accesibilidad · i18n · Arquitecto |
| **Bloque** | C · Sprints 2–3 |

---

## 1. Problema

La landing es la primera prueba de que Eusse World es una empresa seria con la que vale la
pena abrir una cuenta mayorista. Un comprador profesional decide en segundos si esto es
un proveedor real o una tienda improvisada.

Tensión de diseño: hay que alcanzar un nivel de ejecución alto (movimiento, vidrio, modo
oscuro) **sin sacrificar el LCP ni la accesibilidad**, que son precisamente donde las
landings "impresionantes" suelen fallar.

## 2. Objetivos y no-objetivos

**Objetivos:** comunicar la propuesta de valor B2B en menos de 3 segundos · conseguir
solicitudes de cuenta mayorista · Lighthouse ≥ 95 en las cuatro categorías · WCAG 2.2 AA ·
español e inglés · modo oscuro nativo · contenido estructurado editable sin desplegar.

**No-objetivos:** blog o centro de recursos (F2) · CMS genérico · vídeo de fondo ·
chat en vivo (F3) · configurador de productos.

## 3. Alternativas consideradas

| Alternativa | Descarte |
| ----------- | -------- |
| A. CMS headless externo | Latencia, coste y un punto de fallo más, para un contenido acotado y estructurado |
| B. Contenido en el código | Cada corrección de texto es un despliegue |
| **C. Contenido estructurado en base de datos, editable desde el admin, con ISR** | **Elegida.** Editable sin desplegar, cacheado, sin servicio externo |

## 4. Diseño

### 4.1 Posicionamiento visual

Referencias de **nivel de ejecución**, nunca de estética a copiar: Apple (jerarquía y
respiración) · Stripe (densidad sin agobio) · Vercel (contraste y dark mode nativo) ·
Linear (movimiento con propósito) · Shopify (patrones de comercio).

Prueba de calidad: si alguien dice "se parece a Stripe", falla. Si dice "está muy bien
hecho", acierta.

### 4.2 Estructura — una pregunta por sección

| # | Sección | Pregunta que responde |
| - | ------- | --------------------- |
| 1 | Hero | ¿Qué es esto y por qué me importa? |
| 2 | Prueba social | ¿Quién más confía? |
| 3 | Categorías | ¿Tienen lo que necesito? |
| 4 | Propuesta de valor B2B | ¿Por qué aquí y no con mi proveedor actual? |
| 5 | Cómo funciona | ¿Qué tengo que hacer? |
| 6 | Producto destacado | ¿Qué tan bueno es esto? |
| 7 | Testimonios | ¿Le funcionó a alguien como yo? |
| 8 | FAQ | ¿Y mis dudas de B2B (crédito, mínimos, despacho)? |
| 9 | CTA final | ¿Cómo empiezo? |
| 10 | Footer | ¿Quiénes son y cómo los contacto? |

### 4.3 El hero

- Propuesta de valor legible en < 3 s.
- CTA primario inequívoco: **"Crear cuenta mayorista"**. Secundario: "Ver catálogo".
- **LCP < 2.0 s**: la imagen del hero está optimizada, dimensionada y con `priority`.
- **El `h1` no se anima.** Es el LCP; esperar a una animación es autolesionarse.
- Sin carrusel.

### 4.4 Sistema visual aplicado

**Glassmorphism** en navegación adherida y tarjetas flotantes del hero. Con límites:
contraste verificado contra el peor fondo posible · fallback sólido si no hay
`backdrop-filter` · máximo dos capas superpuestas · nunca sobre texto que deba leerse sin
fondo garantizado.

**Movimiento:** revelado al scroll con `once: true` · microinteracciones de 120–160 ms ·
sólo `transform` y `opacity` · `prefers-reduced-motion` respetado · sin parallax en móvil ·
Motion cargado dinámicamente en las secciones por debajo del pliegue.

**Modo oscuro nativo**, no invertido: se diseñan las dos versiones. Sin negro puro.

### 4.5 Contenido estructurado

```
LandingSection { id, type, position, status, publishedAt }
SectionContent { sectionId, locale, fields: jsonb }
```

Tipos acotados: `hero` `logos` `categories` `valueProps` `howItWorks` `featured`
`testimonials` `faq` `cta`. **No es un CMS genérico**: cada tipo tiene su esquema Zod y su
componente. Publicar invalida el ISR por `revalidateTag`.

### 4.6 SEO

Metadatos completos · JSON-LD `Organization` y `WebSite` · `FAQPage` en la sección de
preguntas · `hreflang` recíproco es/en con `x-default` · sitemap · canónicas.

### 4.7 Captación

Formulario de solicitud de cuenta mayorista: razón social, `taxId`, contacto, sector,
volumen estimado. Genera un lead, notifica al equipo comercial y emite
`content.LeadCaptured.v1`. Protegido con rate limiting y verificación anti-bot sin CAPTCHA
visible.

## 5. Impacto

| Área | Impacto |
| ---- | ------- |
| Contextos | Content (nuevo) |
| Rendimiento | Presupuesto más estricto del proyecto: LCP < 2.0 s, JS < 120 KB |
| SEO | Es la página con más peso de indexación |
| Accesibilidad | AA verificada con teclado y lector de pantalla |
| i18n | Todo el contenido en es y en |

## 6. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| El movimiento penaliza el LCP | Alta | Alto | El `h1` y el hero no dependen de animación; Motion diferido; presupuesto en CI |
| El vidrio rompe el contraste | Alta | Alto | Contraste verificado contra el peor fondo; fallback sólido; test automatizado |
| Bundle inflado por Motion | Media | Medio | Carga dinámica + `size-limit` de 120 KB que rompe el build |
| Contenido con *lorem ipsum* al lanzar | Media | Medio | Contenido definitivo como criterio de la Definition of Done |
| Desborde de layout al traducir | Media | Bajo | Pseudo-localización en preview |

## 7. Criterios de aceptación

```gherkin
Escenario: Rendimiento de la landing
  Cuando se mide la landing en móvil con red 4G simulada
  Entonces LCP < 2.0 s, INP < 200 ms, CLS < 0.1
  Y el JavaScript inicial pesa menos de 120 KB
  Y Lighthouse marca ≥ 95 en las cuatro categorías

Escenario: Accesibilidad verificada
  Cuando se navega la landing sólo con teclado
  Entonces todo el contenido y todos los CTA son alcanzables y operables
  Y el foco es visible en todo momento
  Y axe no reporta violaciones críticas ni serias

Escenario: El contenido no depende del JavaScript
  Dado el JavaScript deshabilitado
  Cuando se carga la landing
  Entonces el texto, los enlaces y los CTA siguen siendo visibles y funcionales

Escenario: Movimiento reducido respetado
  Dado un usuario con prefers-reduced-motion activo
  Cuando navega la landing
  Entonces no hay desplazamientos ni escalados; a lo sumo cambios de opacidad

Escenario: Contenido editable sin desplegar
  Cuando el staff edita el titular del hero y publica
  Entonces el cambio es visible en producción en menos de 60 s sin despliegue
```

## 8. Plan de implementación

Pasos C1–C8 de [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).

## 9. Preparación para fases futuras

**Hueco:** el modelo de secciones admite tipos nuevos sin migración · `Content` es un
contexto propio, listo para blog y centro de recursos en F2.
**No se construye:** blog, CMS genérico, editor visual.

## 10. Preguntas abiertas

| # | Pregunta | Bloquea | Resuelta |
| - | -------- | ------- | -------- |
| 1 | ¿Se muestran precios públicos en los productos destacados de la landing? | C2 | **No.** Coherencia con RFC-0006: un solo mensaje, "inicia sesión para ver tu precio" |
| 2 | ¿Qué logos de clientes se pueden usar? | C2 | Pendiente de autorización comercial. **No bloquea**: la sección se lanza con el conjunto autorizado disponible |

## 11. Enlaces

[RFC-0008](RFC-0008-design-system.md) · [`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) ·
[`skills/seo.md`](../skills/seo.md) · [`skills/motion-animation.md`](../skills/motion-animation.md)
