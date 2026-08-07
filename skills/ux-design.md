# Skill — Diseño de UX

## Objetivo

Diseñar cómo se **comporta** el producto antes de cómo se ve, de modo que un comprador B2B
consiga su objetivo en el menor número de pasos y sin perder nunca lo que hizo.

> **Invoca la skill `ui-ux-pro-max`** para guías de UX y patrones por tipo de producto.

## Buenas prácticas

- **Diseña los estados antes que la pantalla.** Loading, empty, error, partial, success.
  Quien diseña sólo el estado con datos entrega la mitad del trabajo.
- **El error es parte del diseño.** Qué pasó, por qué y qué hacer. Escrito por ti, no por
  el desarrollador a las 2 a.m.
- **Nada se pierde nunca.** Formulario, carrito, intención de compra: todo sobrevive a un
  error, a una expiración de sesión y a un botón atrás.
- **Un objetivo por pantalla.** Si hay dos decisiones principales, son dos pantallas.
- **B2B ≠ B2C.** El comprador repite, conoce los SKU, compra 40 líneas y le importa el
  plazo, no la inspiración.
- **Diseña para el usuario recurrente**, no para el que entra por primera vez. Es el que
  paga.
- **Contenido específico.** "Cantidad mínima: 12 (cajas de 6)" y no "Valor inválido".
- **Feedback en menos de 100 ms** para toda acción, aunque sea sólo un cambio de estado.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Diseñar sólo el camino feliz | El desarrollador improvisa los demás |
| Estados vacíos sin diseñar | Pantallas en blanco que parecen rotas |
| Mensajes de error genéricos | El usuario no sabe qué corregir y llama por teléfono |
| Copiar patrones de B2C | Carrito de tarjetas para 40 líneas; búsqueda sin SKU |
| Añadir un paso "por seguridad" | Abandono en checkout |
| Ocultar información importante tras un acordeón | Nadie lo abre |
| Diseñar sólo en escritorio | El seguimiento del pedido se consulta desde el móvil |
| *Lorem ipsum* hasta el final | El contenido real rompe el diseño |
| Depender del hover para descubrir algo | No existe en táctil |

## Patrones

**Preservación de la intención** — la acción del usuario sobrevive al cambio de contexto.
Caso canónico: añadir al carrito sin sesión → login → **vuelta al mismo producto con el
ítem añadido**. Ver [RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md).

**Divulgación progresiva** — lo esencial visible, el detalle a un clic. En B2B, la ficha
técnica completa importa: se muestra, no se esconde.

**Recuperación en vez de prevención** — mejor deshacer que un diálogo de confirmación en
cada acción. Reserva la confirmación para lo irreversible.

**Estado vacío accionable** — no "No hay resultados", sino "No hay resultados para *taladro
percutor* con los filtros actuales" + un botón para quitar filtros.

**Error recuperable** — el mensaje explica, conserva lo escrito y ofrece la acción de salida.

**Recompra como función principal** — el portal de cliente se organiza alrededor de repetir
un pedido, no de explorar.

## Antipatrones

- **Patrones oscuros**: urgencia falsa, casillas premarcadas, costes que aparecen al final.
- **Confirmación para todo**: el usuario deja de leer los diálogos.
- **Mensaje "Ha ocurrido un error"**: no dice nada y culpa al usuario.
- **Carrusel de contenido importante**: nadie pasa de la primera diapositiva.
- **Formulario de 30 campos en una pantalla** sin agrupar ni guardar.
- **Navegación con más de 7 elementos de primer nivel**.
- **Diseñar el sistema de administración con la estética del marketing**: densidad
  equivocada.

## Ejemplos

**Bien — error de cantidad**

> **No podemos añadir esa cantidad**
> El taladro TAL-500 se vende en cajas de 6 unidades. La cantidad mínima es 12.
> [Ajustar a 12] [Cancelar]

Explica, propone y actúa.

**Mal**

> Error: cantidad inválida.

**Bien — precio sin sesión**

> **Inicia sesión para ver tu precio**
> Los precios de Eusse World son personalizados según tu acuerdo comercial.
> [Iniciar sesión] · [Solicitar cuenta mayorista]

Sin número, sin precio tachado, sin mentira.

## Convenciones

- Flujos en Mermaid, dentro del RFC.
- Un mapa de estados por pantalla con datos.
- Contenido definitivo antes de entregar a UI. Nunca *lorem ipsum*.
- Criterios de aceptación de UX verificables ("completable sólo con teclado", "recompra en
  < 90 s").
- Textos preparados para traducir: sin concatenación de fragmentos.

## Checklist

- [ ] Camino feliz, alternos y de error diseñados
- [ ] Los cinco estados por pantalla con datos
- [ ] Cada error dice qué, por qué y qué hacer
- [ ] Nada se pierde ante error, expiración o navegación
- [ ] Completable sólo con teclado
- [ ] Diseñado en móvil y en escritorio
- [ ] Una decisión principal por pantalla
- [ ] Sin patrones oscuros
- [ ] Contenido definitivo y específico
- [ ] Densidad adecuada al contexto
- [ ] Feedback < 100 ms en toda acción
- [ ] Acciones destructivas con confirmación o deshacer
- [ ] Comportamiento concurrente definido (dos usuarios, misma cuenta)
- [ ] Validado con un usuario real o representante del negocio

## Plantillas

[`templates/use-case.md`](../templates/use-case.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) ·
[`skills/accessibility.md`](accessibility.md)
