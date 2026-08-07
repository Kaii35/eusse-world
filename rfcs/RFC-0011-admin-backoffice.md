# RFC-0011 — Back-office administrativo

| Campo | Valor |
| ----- | ----- |
| **Estado** | Borrador · **Autor** UX + Dashboard Admin · **Creado** 2026-08-06 |
| **Revisores** | Auth · Seguridad · Backend · Product Owner · el equipo comercial |
| **Bloque** | H · Sprint 11 |

---

## 1. Problema

Si el equipo de Eusse necesita acceso a la base de datos para operar, la plataforma ha
fracasado: es lento, es peligroso y no deja rastro.

El back-office debe cubrir **todo el ciclo del negocio** — aprobar cuentas, asignar
precios, publicar productos, gestionar pedidos, editar la landing — con auditoría completa
y sin que un error accidental destruya datos.

## 2. Objetivos y no-objetivos

**Objetivos:** operación completa sin tocar la base de datos · auditoría de toda mutación ·
tablas con filtros, orden y acciones en lote · permisos por rol de staff · densidad alta y
teclado primero · búsqueda global.

**No-objetivos:** informes avanzados (F2) · CRM (F3) · configuración de la plataforma por
interfaz · edición de datos financieros históricos.

## 3. Alternativas consideradas

| Alternativa | Descarte |
| ----------- | -------- |
| A. Herramienta de admin generada (Retool, Forest) | No cubre los flujos B2B propios; datos de clientes en un tercero; sin control de la auditoría |
| B. Extender `apps/web` con rutas de admin | Mezcla superficies de riesgo muy distintas; un bug del admin afecta a la tienda |
| **C. `apps/admin` como app propia, consumiendo la misma API con permisos elevados** | **Elegida.** Aislamiento de despliegue y de riesgo; el design system se comparte |

## 4. Diseño

### 4.1 Estructura

```
/[locale]/overview        Estado operativo del día
/[locale]/accounts        Cuentas: aprobación, límites, listas
/[locale]/users           Usuarios y roles (clientes y staff)
/[locale]/products        Catálogo: CRUD, medios, publicación, importación
/[locale]/categories
/[locale]/price-lists     Listas, escalas, asignación
/[locale]/orders          Listado, detalle, estados, aprobación
/[locale]/content         Secciones de la landing
/[locale]/audit           Registro de actividad
/[locale]/settings
```

### 4.2 Principios de diseño

**Otro producto, mismos tokens.** El usuario pasa seis horas al día aquí:

- Densidad alta, filas compactas.
- **Sin glassmorphism, sin animaciones de entrada.** Ruido.
- **Teclado primero**: `Tab` predecible, atajos documentados, `Cmd+K` para navegar y buscar.
- Tablas serias con estado en la URL.

### 4.3 `DataTable` como patrón único

Filtros persistentes en la URL · orden en servidor · columnas configurables y persistidas ·
paginación por cursor · selección múltiple · acciones en lote **con vista previa del
impacto** · exportación asíncrona por cola.

```
Seleccionadas: 47 cuentas · Acción: Asignar lista "Mayorista Norte"
Vista previa: 42 se actualizarán · 5 no (ya tienen lista con mayor prioridad)
[Ver detalle] [Confirmar] [Cancelar]
```

### 4.4 Auditoría

**Toda mutación** registra: actor, acción, recurso, valor anterior, valor nuevo, momento,
IP y `correlationId`. Visible en la propia pantalla del recurso y en `/audit`, filtrable.

Sin auditoría no se puede investigar un incidente ni responder a "¿quién cambió este
precio?".

### 4.5 Operaciones sensibles

| Operación | Control |
| --------- | ------- |
| Aprobar o rechazar cuenta | Motivo obligatorio al rechazar; notificación al cliente |
| Cambiar límite de crédito | Motivo obligatorio; auditado |
| Cambiar precios | Vista previa del impacto (cuántas cuentas, qué SKUs); auditado |
| Cancelar una orden | Motivo obligatorio; sólo con permiso `order:cancel` |
| Eliminar cualquier cosa | Confirmación escribiendo el nombre del recurso |
| Publicar contenido | Vista previa antes de publicar |

### 4.6 Permisos de staff

| Rol | Alcance |
| --- | ------- |
| `STAFF_ADMIN` | Todo |
| `STAFF_SALES` | Cuentas, precios, órdenes, cotizaciones |
| `STAFF_OPS` | Órdenes, despachos, catálogo |
| `STAFF_CONTENT` | Contenido y catálogo |
| `STAFF_VIEWER` | Sólo lectura |

Evaluados en servidor por operación. La UI oculta, no autoriza.

### 4.7 Seguridad

Sesión de vida corta con reautenticación para operaciones críticas · `noindex`, sin caché ·
sin acceso directo a base de datos: el admin usa la misma API con permisos elevados ·
todas las acciones auditadas · exportaciones con URL firmada y expiración.

## 5. Impacto

Consume todos los módulos de dominio. Introduce permisos de staff y el contexto de
auditoría. No introduce lógica de negocio propia: si el admin necesita una regla nueva,
vive en su módulo de dominio.

## 6. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
| ------ | ----- | ------- | ---------- |
| Acción en lote destructiva por error | Media | Alto | Vista previa obligatoria + confirmación explícita |
| Escalada de privilegios de staff | Baja | Crítico | Permisos en servidor por operación + auditoría + revisión de Seguridad |
| Cambio de precios sin trazabilidad | Media | Alto | Auditoría con valor anterior y posterior; vista previa del impacto |
| Tabla inutilizable con volumen real | Media | Medio | Paginación por cursor + orden en servidor + prueba con 10 000 filas |
| Back-office indexado | Baja | Alto | `noindex` verificado por test |

## 7. Criterios de aceptación

```gherkin
Escenario: Toda mutación queda auditada
  Cuando un miembro del staff cambia el límite de crédito de una cuenta
  Entonces el registro de auditoría contiene actor, valor anterior, valor nuevo y momento
  Y ese registro es visible desde la ficha de la cuenta

Escenario: Acción en lote con vista previa
  Dadas 47 cuentas seleccionadas
  Cuando se elige asignar una lista de precios
  Entonces se muestra cuántas se actualizarán y cuántas no, con el motivo
  Y nada se modifica hasta confirmar

Escenario: Permisos de staff
  Dado un usuario con rol STAFF_CONTENT
  Cuando intenta cambiar el límite de crédito de una cuenta
  Entonces la operación se rechaza en el servidor con AUTH_FORBIDDEN

Escenario: Rendimiento con volumen real
  Dada una tabla de 10.000 órdenes
  Cuando se aplican filtros y se ordena
  Entonces la respuesta llega en menos de 300 ms en p95

Escenario: El equipo comercial opera sin base de datos
  Cuando el equipo comercial ejecuta su jornada completa en el back-office
  Entonces no necesita ninguna consulta manual a la base de datos
```

## 8. Plan de implementación

Pasos H1–H10 de [`docs/06-implementation-order.md`](../docs/06-implementation-order.md).
**Validación obligatoria con el equipo comercial real**, no sólo con el equipo técnico.

## 9. Preparación para fases futuras

**Hueco:** la navegación admite secciones nuevas (CRM, inventario, cursos) sin rediseño ·
el modelo de permisos de staff admite roles nuevos · la auditoría es un contexto propio,
reutilizable.
**No se construye:** informes avanzados, CRM, configuración por interfaz.

## 10. Preguntas abiertas

| # | Pregunta | Bloquea | Resuelta |
| - | -------- | ------- | -------- |
| 1 | ¿Puede el staff comprar en nombre de un cliente? | H6 | **Sí**, con permiso `order:create-on-behalf`, con el actor real registrado en la orden y auditado. Se implementa en F2 |

## 11. Enlaces

[`skills/dashboard.md`](../skills/dashboard.md) · [`skills/data-tables.md`](../skills/data-tables.md) ·
[`agents/14-admin-dashboard.md`](../agents/14-admin-dashboard.md)
