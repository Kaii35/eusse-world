# Skill — Tablas de datos

## Objetivo

Tablas que sigan siendo usables con 10 000 filas, accesibles con lector de pantalla y
utilizables en móvil.

## Buenas prácticas

- **Un solo componente `DataTable`** en `@eusse/ui/patterns`, parametrizado. Cada tabla
  reimplementada es deuda.
- **Estado en la URL**: filtros, orden, página y columnas. Compartible, navegable y
  recuperable al recargar.
- **Paginación por cursor.** Estable ante inserciones y sin coste creciente.
- **Orden y filtrado en el servidor.** Ordenar 10 000 filas en el navegador es un error.
- **Selección múltiple con acciones en lote** y **vista previa del impacto** antes de
  ejecutar.
- **Columnas configurables y persistidas** por usuario.
- **HTML de tabla real** (`table`, `thead`, `th scope`): los lectores de pantalla lo
  entienden. Un grid de `div` no.
- **Números tabulares y alineados a la derecha** en importes y cantidades.

## Errores comunes

| Error                                         | Consecuencia                                 |
| --------------------------------------------- | -------------------------------------------- |
| Traer todas las filas y filtrar en cliente    | Navegador colgado con datos reales           |
| Paginación por offset                         | Duplicados y saltos                          |
| Estado sólo en React                          | Se pierde al recargar; enlace no compartible |
| Tabla hecha con `div`                         | Inaccesible                                  |
| Acción en lote sin vista previa               | Se modifican 400 registros por error         |
| Exportación síncrona                          | Timeout con volúmenes grandes                |
| Sin estado vacío ni de carga                  | Pantalla en blanco que parece rota           |
| Tabla sin adaptación a móvil                  | Inutilizable en teléfono                     |
| Importes alineados a la izquierda             | Ilegibles, imposibles de comparar            |
| Filtros que se reinician al cambiar de página | Frustración inmediata                        |

## Patrones

**Estado en la URL**

```
/admin/orders?status=PENDING_APPROVAL&sort=-createdAt&cursor=eyJ...&cols=number,account,total
```

**Contrato del componente**

```
<DataTable
  columns={orderColumns}          // definición: clave, etiqueta, ordenable, alineación, render
  query={useOrdersQuery}          // hook con cursor, filtros y orden
  filters={orderFilters}          // definición de filtros tipados
  bulkActions={[approveMany, exportSelection]}
  emptyState={<NoOrdersYet />}
  rowHref={(o) => `/admin/orders/${o.id}`}
/>
```

**Acción en lote con vista previa**

```
Seleccionadas: 47 órdenes
Acción: Aprobar
Vista previa: 42 se aprobarán · 5 no (estado no válido)
[Ver detalle] [Confirmar] [Cancelar]
```

**Exportación asíncrona** — se encola, se notifica al terminar, se descarga con URL firmada.

**Adaptación a móvil** — desplazamiento horizontal con la primera columna fija, o las filas
se convierten en tarjetas. Nunca una tabla comprimida ilegible.

**Virtualización** — sólo si tras paginar aún hay más de 200 filas en pantalla. Antes,
paginar es mejor.

## Antipatrones

- **Tabla con `div` y `role="table"`** cuando `<table>` existe.
- **Reimplementar la tabla en cada pantalla.**
- **Ordenar y filtrar en el cliente** sobre datos paginados: resultados incoherentes.
- **Columnas infinitas** sin poder configurar cuáles ver.
- **Doble scroll** (horizontal y vertical anidados).
- **Acción destructiva en lote sin confirmación escrita.**
- **Cargar todas las filas "porque son pocas"**: dejarán de serlo.

## Ejemplos

**Bien — definición de columna**

```
{
  key: 'total',
  label: t('orders.total'),
  sortable: true,
  align: 'right',
  className: 'tabular-nums',
  render: (o) => <Money value={o.total} />,
}
```

**Mal**

```
<div className="flex">
  {rows.map((r, i) => <div key={i}>{r.total}</div>)}   // sin semántica, sin formato, key por índice
</div>
```

## Convenciones

- `DataTable` en `@eusse/ui/patterns/data-table`.
- Columnas definidas en `features/<x>/table-columns.ts`.
- Parámetros de URL: `sort` (`-campo` para descendente), `cursor`, `limit`, `cols`, y un
  parámetro por filtro.
- Límite por página: 20 por defecto, 100 máximo.
- Importes y cantidades: `tabular-nums`, alineados a la derecha.

## Checklist

- [ ] `<table>` semántica con `th scope`
- [ ] Orden y filtrado en el servidor
- [ ] Paginación por cursor
- [ ] Estado completo en la URL
- [ ] Filtros persistentes entre páginas
- [ ] Columnas configurables y persistidas
- [ ] Selección múltiple con acciones en lote
- [ ] Vista previa del impacto antes de ejecutar
- [ ] Exportación asíncrona
- [ ] Estados de carga, vacío y error
- [ ] Navegación por teclado; `th` ordenables con `aria-sort`
- [ ] Números tabulares alineados a la derecha
- [ ] Adaptación a móvil resuelta
- [ ] Rendimiento verificado con 10 000 filas

## Plantillas

[`skills/dashboard.md`](dashboard.md) ·
[`templates/component.md`](../templates/component.md)
