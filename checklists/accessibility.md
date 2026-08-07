# Checklist — Accesibilidad (WCAG 2.2 AA)

Obligatoria en toda pantalla y todo componente. **Es requisito de la Definition of Done.**

> Las herramientas automáticas detectan como mucho un tercio de los problemas.
> **La verificación manual con teclado y lector de pantalla es obligatoria** en los
> recorridos críticos.

---

## Teclado

- [ ] Todo lo operable con ratón es operable con teclado
- [ ] Orden de tabulación lógico y predecible
- [ ] **Foco siempre visible**, con contraste ≥ 3:1
- [ ] Sin trampas de foco
- [ ] `Escape` cierra diálogos, hojas y popovers
- [ ] Al abrir un overlay el foco entra; al cerrarlo vuelve al disparador
- [ ] El fondo queda inerte mientras hay un modal
- [ ] Sin `tabindex` positivo
- [ ] Enlace "saltar al contenido" en cada página

## Semántica

- [ ] HTML semántico: `nav`, `main`, `header`, `footer`, `article`, `section`
- [ ] Un solo `h1` por página
- [ ] Jerarquía de encabezados sin saltos (`h1` → `h2` → `h3`)
- [ ] Landmarks correctos, etiquetados cuando se repiten
- [ ] Listas como `ul`/`ol`; tablas como `table` con `th scope`
- [ ] Botones que actúan son `<button>`; navegación es `<a>`
- [ ] ARIA sólo donde el HTML no basta

## Formularios

- [ ] Todo campo con `<label>` asociado (no sólo `placeholder`)
- [ ] Errores asociados con `aria-describedby`
- [ ] Errores anunciados con `role="alert"` o `aria-live`
- [ ] Campos requeridos indicados textualmente, no sólo con color o asterisco
- [ ] Agrupaciones con `fieldset` y `legend`
- [ ] `autocomplete` correcto en email, nombre, teléfono, dirección
- [ ] Mensajes de error específicos y accionables

## Visual

- [ ] Contraste ≥ 4.5:1 en texto normal, **en ambos temas**
- [ ] Contraste ≥ 3:1 en texto grande y elementos de UI, **en ambos temas**
- [ ] Contraste verificado contra el peor fondo posible (crítico con glassmorphism)
- [ ] **La información nunca depende sólo del color** (icono + texto + color)
- [ ] Zoom al 200% sin pérdida de contenido ni de función
- [ ] Sin desbordes horizontales a 320 px de ancho
- [ ] Objetivos táctiles ≥ 44×44 px

## Movimiento

- [ ] `prefers-reduced-motion` respetado y **probado**
- [ ] Con movimiento reducido: sólo opacidad, sin desplazamiento ni escala
- [ ] Nada parpadea más de 3 veces por segundo
- [ ] Sin animación automática que no se pueda pausar
- [ ] El contenido es visible sin JavaScript

## Contenido dinámico

- [ ] Cambios importantes anunciados con `aria-live`
- [ ] Estados de carga anunciados
- [ ] Toasts accesibles y no dependientes sólo del tiempo
- [ ] El conteo de resultados se anuncia al filtrar

## Imágenes y medios

- [ ] `alt` significativo en imágenes informativas
- [ ] `alt=""` en decorativas
- [ ] `aria-hidden="true"` en iconos decorativos
- [ ] Iconos informativos con texto acompañante o nombre accesible

## Verificación

- [ ] **axe sin violaciones críticas ni serias**
- [ ] **Recorrido completado sólo con teclado**
- [ ] **Recorrido verificado con lector de pantalla** (NVDA o VoiceOver)
- [ ] Verificado al 200% de zoom
- [ ] Verificado en claro y en oscuro
- [ ] Verificado en móvil real, no sólo en el emulador
