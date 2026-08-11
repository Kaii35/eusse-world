# Skill — Dashboards

## Objetivo

Portales donde el usuario consigue su objetivo sin buscarlo: el cliente repite pedidos, el
staff opera el negocio.

## Buenas prácticas

- **Organiza por objetivo, no por entidad.** El portal del cliente empieza por "repetir un
  pedido", no por "listado de órdenes".
- **Métricas que llevan a una acción.** Si un número no cambia lo que el usuario hace,
  sobra.
- **Densidad según el usuario.** El cliente entra dos veces por semana: aire y claridad.
  El staff pasa seis horas: compacto, teclado, atajos.
- **Ámbito de cuenta en toda consulta**, con el `accountId` de la sesión.
- **Permisos verificados en el servidor** por operación; la UI sólo oculta.
- **Los cinco estados en toda vista.**
- **Auditoría visible** en el back-office: quién cambió qué y cuándo, en la propia pantalla.
- **Búsqueda global (`Cmd+K`)** en el admin: es lo que más tiempo ahorra.

## Errores comunes

| Error                                  | Consecuencia                               |
| -------------------------------------- | ------------------------------------------ |
| Panel con gráficos bonitos e inútiles  | Nadie lo mira dos veces                    |
| Filtrar por `accountId` del cliente    | IDOR                                       |
| Permisos sólo en la UI                 | Se saltan con `curl`                       |
| Mismo diseño para portal y back-office | Uno queda vacío, el otro agobia            |
| Tabla sin filtros ni orden             | Inútil con más de 50 filas                 |
| Cargar 10 000 filas de golpe           | Navegador colgado                          |
| Acción destructiva sin confirmar       | Datos perdidos                             |
| Sin auditoría en el admin              | Imposible investigar un incidente          |
| Exportación síncrona de 50 000 filas   | Timeout                                    |
| Sin estado vacío                       | El usuario nuevo ve una pantalla en blanco |

## Patrones

**Portal del cliente organizado por la tarea real**

```
1. Repetir un pedido       ← acción principal, primero y visible
2. Estado de mis pedidos   ← segunda pregunta más frecuente
3. Mi cuenta y usuarios
4. Documentos
```

**Recompra en un clic**

```
Orden #EW-2026-000123  →  [Repetir pedido]
  → crea un carrito con las líneas de esa orden
  → revalida disponibilidad, precio, mínimos y múltiplos ACTUALES
  → informa: "8 de 10 productos añadidos. 2 ya no están disponibles."
  → lleva al carrito, listo para revisar
```

**Back-office con `DataTable` reutilizable** — filtros persistentes en la URL, orden,
columnas configurables, selección múltiple, acciones en lote con vista previa, exportación
asíncrona.

**Exportación por cola** — se encola, se notifica al terminar y se descarga con URL firmada.

**Panel con métricas accionables (cliente)** — pedidos del mes, pendientes de aprobación,
crédito disponible, últimos despachos. Todas llevan a una pantalla.

## Antipatrones

- **Dashboard como escaparate de gráficos**: bonito, inútil.
- **Métricas de vanidad** (visitas totales) en un portal B2B.
- **Todo en una pantalla** con quince widgets.
- **Glassmorphism y animaciones en el back-office**: ruido para quien pasa el día ahí.
- **Confirmación para toda acción**: el usuario deja de leer.
- **Permisos por pantalla** en lugar de por operación.
- **Filtros que se pierden al recargar.**

## Ejemplos

**Bien — resultado de recompra**

> **8 de 10 productos añadidos al carrito**
> · TAL-500 — ya no está disponible
> · MAR-220 — la cantidad mínima cambió a 24 (pediste 12) — [Ajustar a 24]
> [Ver carrito] · [Ver pedido original]

**Mal**

> Error al repetir el pedido.

## Convenciones

- Portal: `apps/web/src/app/[locale]/(account)/`
- Admin: `apps/admin/src/app/[locale]/(dashboard)/`
- Ambos `noindex`, sin caché, sesión de vida corta en admin.
- `DataTable` de `@eusse/ui/patterns`, con estado en la URL.
- Permisos: `<recurso>:<acción>`, verificados en servidor.
- Toda mutación en el admin queda auditada.

## Checklist

- [ ] Organizado por objetivo del usuario
- [ ] `accountId` desde la sesión en toda consulta
- [ ] Test de IDOR por endpoint
- [ ] Permisos verificados en servidor
- [ ] Los cinco estados en cada vista
- [ ] Tablas con filtros, orden y paginación por cursor
- [ ] Filtros persistidos en la URL
- [ ] Acciones destructivas con confirmación
- [ ] Acciones en lote con vista previa
- [ ] Exportación asíncrona para volúmenes grandes
- [ ] Auditoría visible en el admin
- [ ] `Cmd+K` en el admin
- [ ] Densidad adecuada al usuario
- [ ] Navegación inferior en móvil (portal)
- [ ] Recompra medida: < 90 s

## Plantillas

[`rfcs/RFC-0010-client-portal.md`](../rfcs/RFC-0010-client-portal.md) ·
[`rfcs/RFC-0011-admin-backoffice.md`](../rfcs/RFC-0011-admin-backoffice.md) ·
[`skills/data-tables.md`](data-tables.md)
