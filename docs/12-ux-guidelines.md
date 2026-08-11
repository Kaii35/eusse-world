# 12 — Guías de UX y sistema visual

**Dueño:** UX + UI + Design System · **Última revisión:** 2026-08-06 · **Estado:** Vigente

> **Herramienta obligatoria.** Los agentes UI, UX y Design System deben invocar la skill
> `ui-ux-pro-max` antes de diseñar o implementar cualquier pantalla. Aporta paletas,
> emparejamientos tipográficos, estilos y guías de UX. **Ante conflicto entre esa skill y
> este documento o `@eusse/tokens`, gana este repositorio.**

---

## 1. Posicionamiento visual

Referencias de **nivel de ejecución**, no de estética a copiar:

| Referencia  | Qué tomamos                                                                               | Qué NO tomamos                             |
| ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Apple**   | Jerarquía tipográfica, respiración, producto como protagonista                            | Su paleta, su tono, sus layouts            |
| **Stripe**  | Densidad de información sin agobio, degradados con propósito, documentación como producto | Su ilustración isométrica                  |
| **Vercel**  | Contraste negro/blanco, bordes finos, dark mode nativo                                    | Su minimalismo extremo (somos comerciales) |
| **Linear**  | Movimiento con propósito, velocidad percibida, teclado primero                            | Su temática de gestión de proyectos        |
| **Shopify** | Patrones de comercio, tablas de datos, formularios largos que no cansan                   | Su lenguaje visual retail                  |

**Regla:** copiar un layout es plagio y además no funciona: sus decisiones responden a su
producto. Se copia el **estándar de calidad**, no el resultado.

Prueba: si alguien mira la landing y dice "esto se parece a Stripe", falla. Si dice "esto
se ve muy bien hecho", acierta.

---

## 2. Principios de UX

1. **Claridad sobre ingenio.** Un comprador B2B a las 7 a.m. no quiere descifrar la
   navegación. Si hay que elegir entre original y evidente, gana evidente.
2. **La velocidad es una funcionalidad.** Percibida y real. Skeletons que coinciden con el
   layout final, optimistic updates, prefetch al pasar el cursor.
3. **Estado siempre visible.** El usuario nunca se pregunta si algo funcionó. Toda acción
   produce una respuesta en menos de 100 ms, aunque sea un spinner.
4. **Errores que enseñan.** "Cantidad mínima: 12 unidades (cajas de 6)" y no "Valor
   inválido". El error dice **qué pasó, por qué y qué hacer**.
5. **Nada se pierde.** Formularios recuperables, carrito persistente, intención de compra
   preservada a través del login.
6. **Densidad adecuada al contexto.** La landing respira; el back-office comprime. Son
   usuarios distintos con objetivos distintos.
7. **Accesible o no está terminado.** WCAG 2.2 AA es requisito, no mejora.
8. **Menos pasos que la alternativa.** Si pedir por WhatsApp es más rápido, el producto
   fracasó.

---

## 3. Sistema visual

### Color

Definido en `@eusse/tokens`. Estructura semántica, **nunca literal**:

```
Superficie   background · surface · surface-raised · surface-overlay
Contenido    foreground · muted-foreground · subtle-foreground
Marca        primary · primary-foreground · accent · accent-foreground
Estado       success · warning · danger · info (+ -foreground, -subtle)
Borde        border · border-strong · ring
```

Reglas:

- El código **nunca** nombra un color literal. `bg-primary`, jamás `bg-blue-600`.
- Todo par de tokens declara su ratio de contraste, verificado en test.
- Light y dark se definen simultáneamente. Un token sin par oscuro no existe.
- El acento se usa con moderación: si todo destaca, nada destaca.

### Tipografía

- **Una familia** para interfaz, geométrica sans con buenos números tabulares (los precios
  y cantidades deben alinear). Segunda familia sólo si la marca lo exige.
- Escala modular (1.25) con nombres semánticos: `display`, `h1`…`h4`, `body-lg`, `body`,
  `body-sm`, `caption`, `mono`.
- Longitud de línea 60–75 caracteres en texto corrido.
- **Números tabulares obligatorios** en precios, cantidades y tablas.
- Fuentes autoalojadas con `next/font`, `font-display: swap`, subconjunto latino.

### Espaciado y layout

- Escala de 4 px. Nada fuera de la escala.
- Contenedor máximo 1 280 px para contenido; ancho completo para secciones inmersivas.
- Rejilla de 12 columnas en escritorio, 4 en móvil.
- Ritmo vertical consistente entre secciones (`--space-section`).

### Superficies y glassmorphism

El vidrio es una **herramienta de jerarquía**, no una decoración. Se usa donde algo flota
sobre contenido: navegación adherida, tarjetas del hero, overlays, drawer del carrito.

Receta (token `--surface-glass`):

- Fondo semitransparente (8–12% en claro, 6–10% en oscuro).
- `backdrop-filter: blur(16–24px) saturate(150%)`.
- Borde de 1 px con un blanco/negro muy tenue que sugiera el canto del cristal.
- Sombra suave y amplia, nunca dura.

**Límites duros:**

- Nunca vidrio sobre texto que deba leerse sin fondo garantizado. El contraste se verifica
  contra el peor fondo posible, no contra el de la maqueta.
- Fallback sólido obligatorio cuando `backdrop-filter` no esté soportado.
- Máximo dos capas de vidrio superpuestas. Tres es sopa visual.
- **Prohibido en el back-office.** Densidad y legibilidad ganan.

### Elevación

Cinco niveles: `flat` `raised` `overlay` `modal` `toast`. Cada uno con su sombra y su
`z-index` en tokens. **No se escriben `z-index` a mano.**

### Radio y bordes

Escala corta: `sm` (6) `md` (10) `lg` (16) `xl` (24) `full`. Coherencia por familia de
componentes: si la tarjeta es `lg`, su imagen interior también.

---

## 4. Movimiento

Con **Motion**. El movimiento comunica causalidad y jerarquía; no entretiene.

| Uso                                      | Duración   | Curva         |
| ---------------------------------------- | ---------- | ------------- |
| Microinteracción (hover, presión)        | 120–160 ms | `ease-out`    |
| Transición de estado (abrir, cerrar)     | 200–280 ms | `ease-in-out` |
| Entrada de elemento (revelado al scroll) | 400–600 ms | spring suave  |
| Transición de página                     | 200–300 ms | `ease-out`    |

Reglas:

- **`prefers-reduced-motion` se respeta siempre.** No es opcional. El contenido aparece
  sin desplazamiento ni escala; sólo opacidad, o nada.
- Sólo se animan `transform` y `opacity`. Animar `width`, `height`, `top` o `box-shadow`
  provoca reflow.
- Nada anima más de 600 ms. Lo lento se percibe como roto.
- El revelado al scroll ocurre **una vez** (`once: true`). Reanimar al volver a subir
  marea.
- El contenido crítico **nunca** depende de una animación para ser visible. Si el JS falla,
  el texto está ahí.
- Sin parallax en móvil. Cuesta batería y marea.

### Microinteracciones obligatorias

Botón (hover, activo, foco, cargando, deshabilitado) · Añadir al carrito (feedback
inmediato + contador que salta) · Entrada de formulario (foco, validación en `blur`,
error) · Tarjeta de producto (elevación y zoom sutil de imagen en hover) · Navegación
(indicador que se desplaza) · Toast (entrada desde el borde, salida con desvanecido) ·
Skeleton (pulso suave, no brillo agresivo).

---

## 5. Estructura de la landing

Cada sección responde a **una** pregunta del visitante:

| #   | Sección                | Pregunta que responde                                         |
| --- | ---------------------- | ------------------------------------------------------------- |
| 1   | **Hero**               | ¿Qué es esto y por qué me importa?                            |
| 2   | Prueba social          | ¿Quién más confía?                                            |
| 3   | Categorías             | ¿Tienen lo que necesito?                                      |
| 4   | Propuesta de valor B2B | ¿Por qué aquí y no a mi proveedor actual?                     |
| 5   | Cómo funciona          | ¿Qué tengo que hacer?                                         |
| 6   | Producto destacado     | ¿Qué tan bueno es esto de verdad?                             |
| 7   | Testimonios            | ¿Le funcionó a alguien como yo?                               |
| 8   | FAQ                    | ¿Y mis dudas específicas de B2B (crédito, mínimos, despacho)? |
| 9   | CTA final              | ¿Cómo empiezo?                                                |
| 10  | Footer                 | ¿Cómo los contacto y quiénes son?                             |

**El hero** decide todo. Requisitos:

- Propuesta de valor legible en menos de 3 segundos.
- Un CTA primario inequívoco ("Crear cuenta mayorista") y uno secundario ("Ver catálogo").
- LCP < 2.0 s: la imagen del hero está optimizada, dimensionada y con prioridad.
- Sin carrusel. Los carruseles no funcionan.
- Nada crítico depende de una animación.

---

## 6. Patrones de ecommerce B2B

### Tarjeta de producto

Imagen consistente (relación fija, fondo uniforme) · Nombre a dos líneas con truncado ·
SKU visible (el comprador B2B busca por código) · **Zona de precio con tres estados**
(sin sesión / cargando / precio de la cuenta) · Cantidad mínima si aplica · Acción rápida
de añadir · Indicador de disponibilidad.

### Zona de precio — el componente más delicado del sistema

| Estado                    | Qué muestra                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| Sin sesión                | "Inicia sesión para ver tu precio" + enlace, **sin número**      |
| Cargando                  | Skeleton del tamaño exacto del precio, sin salto de layout       |
| Con precio                | Precio unitario · moneda · escala aplicable ("desde 50 uds: $X") |
| Sin precio para la cuenta | "Consulta con tu asesor" + acción de contacto                    |
| No visible para la cuenta | El producto no aparece                                           |

**Nunca** se muestra un precio placeholder, tachado o inventado. Ver regla PRC-02.

### Listado y filtros

Filtros como facetas con conteo · Escritorio: barra lateral fija; móvil: hoja inferior ·
Filtros activos como chips eliminables · Estado en la URL (compartible y navegable) ·
Sin recarga completa al filtrar · Estado vacío que sugiere cómo relajar los filtros.

### Carrito B2B

Tabla, no tarjetas: 40 líneas en tarjetas es inmanejable · Edición de cantidad en línea
con debounce · Subtotal por línea y total siempre visibles · Aviso claro si un precio
cambió · "Añadir por SKU" (pegar una lista de códigos) · Importar CSV (Fase 2) ·
Guardar como plantilla de pedido.

### Checkout

Tres pasos como máximo, con progreso visible · Un solo objetivo por paso · Resumen del
pedido siempre visible · Campo de orden de compra del cliente destacado (es lo que su
contabilidad necesita) · Errores en línea, junto al campo, nunca sólo arriba ·
Botón de confirmar deshabilitado durante el envío · Sin sorpresas de precio en el último
paso: si algo cambió, se avisa antes y se pide confirmación explícita.

---

## 7. Back-office

Otro producto, mismos tokens. Un usuario que pasa seis horas al día aquí necesita lo
contrario que un visitante:

- **Densidad alta.** Filas compactas, menos espacio en blanco.
- **Sin glassmorphism ni animaciones de entrada.** Ruido.
- **Teclado primero.** Atajos, `Cmd+K` para navegar, `Tab` predecible.
- **Tablas serias:** orden, filtros persistentes, columnas configurables, selección
  múltiple, acciones en lote, exportación, paginación por cursor.
- **Acciones destructivas** con confirmación y posibilidad de deshacer cuando sea posible.
- **Auditoría visible:** quién cambió qué y cuándo, en la propia pantalla.

---

## 8. Responsive

Móvil primero en implementación. En B2B, escritorio primero en prioridad de diseño (el
comprador pide desde su oficina), pero consulta y seguimiento son móviles.

| Punto de corte | Ancho | Notas                        |
| -------------- | ----- | ---------------------------- |
| `sm`           | 640   | Móvil grande                 |
| `md`           | 768   | Tablet vertical              |
| `lg`           | 1024  | Tablet horizontal / portátil |
| `xl`           | 1280  | Escritorio                   |
| `2xl`          | 1536  | Escritorio amplio            |

Objetivos táctiles ≥ 44×44 px · Sin hover como único mecanismo de descubrimiento ·
Tablas → tarjetas o desplazamiento horizontal con columna fija en móvil · Navegación
inferior en móvil para el portal de cliente.

---

## 9. Dark mode

- **Nativo, no invertido.** Se diseñan las dos versiones.
- Preferencia del sistema por defecto + conmutador manual persistente.
- Sin negro puro (`#000`): superficies muy oscuras con matiz, para reducir el halo.
- En oscuro, las sombras dejan de funcionar: la elevación se comunica con **luminosidad**.
- Las imágenes de producto se muestran sobre un fondo neutro claro constante, aunque el
  tema sea oscuro. El producto no cambia de color.
- El contraste se verifica en **ambos** temas. Un token que pasa en claro y falla en
  oscuro es un token roto.

---

## 10. Estados obligatorios

**Toda vista que muestre datos implementa cinco estados.** Una vista sin estado vacío
diseñado se rechaza en revisión.

| Estado      | Requisito                                                        |
| ----------- | ---------------------------------------------------------------- |
| **Loading** | Skeleton con la forma del contenido real, no un spinner centrado |
| **Empty**   | Explica por qué está vacío y ofrece la acción siguiente          |
| **Error**   | Qué pasó, si es recuperable, y un botón de reintentar            |
| **Partial** | Datos incompletos señalados, sin bloquear el resto               |
| **Success** | El contenido, con jerarquía clara                                |

---

## 11. Checklist visual antes de dar por terminada una pantalla

- [ ] Sin valores mágicos: todo color, espacio, radio y sombra sale de un token
- [ ] Light y dark verificados, no sólo el tema en el que se trabajó
- [ ] Los cinco estados implementados
- [ ] Navegación completa por teclado, foco siempre visible
- [ ] Contraste AA verificado en ambos temas
- [ ] `prefers-reduced-motion` respetado
- [ ] Sin salto de layout al cargar (CLS < 0.1)
- [ ] Probado en 375 px, 768 px, 1 280 px y 1 920 px
- [ ] Ningún literal de texto en el código; todo en `next-intl`
- [ ] Textos largos y cortos probados (alemán y chino como casos extremos)
- [ ] Sin componente nuevo que duplique uno de `@eusse/ui`
