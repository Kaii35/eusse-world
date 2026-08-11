# RFC-0010 — Portal de cliente

| Campo         | Valor                                                               |
| ------------- | ------------------------------------------------------------------- |
| **Estado**    | Borrador · **Autor** UX + Dashboard Cliente · **Creado** 2026-08-06 |
| **Revisores** | Auth · Backend · Seguridad · Accesibilidad · Product Owner          |
| **Bloque**    | G · Sprint 10                                                       |

---

## 1. Problema

El 70% del valor de la plataforma está en la **recompra**, no en el descubrimiento. El
comprador ya sabe qué necesita: lo compró el mes pasado. Hoy reconstruye el pedido SKU a
SKU desde un PDF y tarda 12 minutos.

Además necesita responder solo a "¿dónde está mi pedido?", "¿cuánto crédito me queda?" y
"¿quién de mi equipo puede comprar?", sin llamar a nadie.

## 2. Objetivos y no-objetivos

**Objetivos:** recompra completa en < 90 s · visibilidad total del histórico y los estados ·
gestión de usuarios y roles de la cuenta · direcciones · documentos descargables ·
preferencias e idioma.

**No-objetivos:** cotizaciones (F3) · devoluciones (F2) · chat (F3) · listas de compra
guardadas (F2) · informes avanzados (F2).

## 3. Alternativas consideradas

**Organización del portal**

| Alternativa                                          | Descarte                                            |
| ---------------------------------------------------- | --------------------------------------------------- |
| A. Por entidad (Órdenes, Usuarios, Direcciones…)     | Refleja el modelo de datos, no la tarea del usuario |
| **B. Por objetivo, con la recompra en primer lugar** | **Elegida.** El portal existe para repetir pedidos  |

**Recompra**

| Alternativa                                                                          | Descarte                                              |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| A. Duplicar la orden con sus precios originales                                      | Los precios cambian: crearía un compromiso falso      |
| **B. Crear un carrito nuevo revalidando precios, mínimos y disponibilidad actuales** | **Elegida.** Informa línea por línea de lo que cambió |

## 4. Diseño

### 4.1 Estructura

```
/[locale]/dashboard              Panel: acciones y estado
/[locale]/dashboard/orders       Listado con filtros
/[locale]/dashboard/orders/:id   Detalle con línea de tiempo
/[locale]/dashboard/users        Miembros y roles (OWNER/ADMIN)
/[locale]/dashboard/addresses    Direcciones
/[locale]/dashboard/profile      Perfil, preferencias, idioma
```

### 4.2 Panel

Cuatro tarjetas, **todas accionables** (llevan a una pantalla):
pedidos del mes · pendientes de aprobación · crédito disponible · último despacho.
Más un bloque destacado: **"Repetir un pedido reciente"** con las tres últimas órdenes.

Sin gráficos decorativos. Si un número no cambia lo que el usuario hace, no está.

### 4.3 Recompra

```
Orden EW-2026-000123 → [Repetir pedido]
  1. Crear carrito desde las líneas de la orden
  2. Revalidar por línea: visibilidad · precio actual · minOrderQty · qtyIncrement actuales
  3. Añadir lo válido; reportar lo que no
  4. Llevar al carrito con el informe visible
```

Resultado esperado por el usuario:

> **8 de 10 productos añadidos**
> · TAL-500 — ya no está disponible
> · MAR-220 — la cantidad mínima cambió a 24 (pediste 12) — [Ajustar a 24]
> [Ver carrito] · [Ver pedido original]

Nunca un fallo silencioso ni un "error al repetir el pedido".

### 4.4 Órdenes

Listado con filtros por estado, rango de fechas y número; paginación por cursor.
Detalle con línea de tiempo de estados, líneas, totales desglosados, dirección, orden de
compra propia, número de guía y documentos.

### 4.5 Gestión de usuarios

Sólo `OWNER` y `ADMIN`. Invitar por email, asignar rol y `approvalThreshold`, suspender.
**No se puede eliminar el último `OWNER`.** Un `VIEWER` no ve crédito ni importes de
pedidos que no creó.

### 4.6 Seguridad

Toda consulta con `accountId` **de la sesión**. Test de IDOR por endpoint: cuenta A pide
recurso de B → **404**. Rutas dinámicas, sin caché, `noindex`. Descargas con URL firmada y
expiración.

### 4.7 Móvil

Navegación inferior. El seguimiento del pedido se consulta desde el teléfono: esa vista se
diseña para móvil primero.

## 5. Impacto

Consume Orders, Accounts, Identity, Cart. No introduce contexto nuevo. Rutas privadas sin
caché ni indexación.

## 6. Riesgos

| Riesgo                         | Prob. | Impacto | Mitigación                                                                     |
| ------------------------------ | ----- | ------- | ------------------------------------------------------------------------------ |
| IDOR entre cuentas (R-03)      | Media | Crítico | `accountId` de sesión + test por endpoint + repositorio con ámbito obligatorio |
| Recompra que falla en silencio | Media | Alto    | Informe línea por línea obligatorio; E2E con SKU no disponible                 |
| Portal indexado por buscadores | Baja  | Alto    | `noindex` verificado por test                                                  |
| Panel con métricas inútiles    | Media | Bajo    | Regla: toda tarjeta lleva a una acción                                         |

## 7. Criterios de aceptación

```gherkin
Escenario: Recompra en menos de 90 segundos
  Dado un comprador autenticado con una orden previa de 10 líneas
  Cuando pulsa "Repetir pedido" y confirma el checkout
  Entonces completa el pedido en menos de 90 segundos

Escenario: Recompra con productos no disponibles
  Dada una orden previa con 10 líneas, 2 de ellas ya no disponibles
  Cuando pulsa "Repetir pedido"
  Entonces se añaden 8 líneas al carrito
  Y se informa del motivo exacto de las 2 restantes
  Y se ofrece una acción correctiva cuando es posible

Escenario: Aislamiento entre cuentas
  Dado un comprador de la cuenta A
  Cuando solicita el detalle de una orden de la cuenta B
  Entonces recibe 404

Escenario: No se puede dejar la cuenta sin OWNER
  Dada una cuenta con un único OWNER
  Cuando se intenta eliminar o degradar ese miembro
  Entonces la operación se rechaza con un mensaje explicativo

Escenario: El portal no es indexable
  Cuando un rastreador solicita /es/dashboard
  Entonces la respuesta incluye noindex
```

## 8. Plan de implementación

Pasos G1–G9 de [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).

## 9. Preparación para fases futuras

**Hueco:** el carrito admite metadatos por línea → listas de compra guardadas (F2) ·
la estructura de navegación admite secciones nuevas (cotizaciones, cursos) sin rediseño.
**No se construye:** cotizaciones, devoluciones, chat, informes.

## 10. Preguntas abiertas

| #   | Pregunta                                                    | Bloquea | Resuelta                                 |
| --- | ----------------------------------------------------------- | ------- | ---------------------------------------- |
| 1   | ¿Un `VIEWER` puede ver los importes de pedidos que no creó? | G2      | **No.** Ve estado y líneas, sin importes |

## 11. Enlaces

[RFC-0007](RFC-0007-checkout-and-orders.md) · [`skills/dashboard.md`](../skills/dashboard.md) ·
[`agents/13-client-dashboard.md`](../agents/13-client-dashboard.md)
