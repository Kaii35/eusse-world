# Checklist — Rendimiento

Presupuestos en [`docs/04-standards.md`](../docs/04-standards.md) §6. Superarlos **rompe el
build**.

---

## Antes de optimizar

- [ ] **He medido.** Tengo un perfil, no una intuición
- [ ] Sé qué métrica concreta quiero mejorar y cuál es su objetivo
- [ ] La medición es en **p75/p95, móvil, red realista** — no en mi portátil

## Frontend

- [ ] Presupuesto de la ruta definido y activo en CI
- [ ] LCP, INP y CLS dentro de objetivo
- [ ] JS inicial dentro de presupuesto (`size-limit`)
- [ ] Server Components donde es posible
- [ ] División de código por ruta
- [ ] Motion y otras librerías pesadas cargadas dinámicamente
- [ ] Imágenes: `next/image`, dimensiones explícitas, formatos modernos, `priority` sólo
      donde corresponde
- [ ] Fuentes autoalojadas, `font-display: swap`, subconjunto
- [ ] **El LCP no espera a ninguna animación**
- [ ] Skeletons que reservan el espacio exacto (CLS = 0)
- [ ] Iconos importados uno a uno
- [ ] Sin recursos bloqueantes en la ruta crítica de renderizado
- [ ] Prefetch al pasar el cursor en enlaces de navegación principal

## Backend

- [ ] **Sin N+1** (verificado con logs de consultas)
- [ ] Consultas en lote donde hay varias entidades
- [ ] `select` explícito
- [ ] Paginación por cursor
- [ ] p95 < 200 ms en lecturas, < 500 ms en escrituras
- [ ] Trabajo pesado a colas, fuera de la petición
- [ ] Compresión activa

## Base de datos

- [ ] **`EXPLAIN ANALYZE` adjunto al PR** para cada consulta de listado
- [ ] Sin `Seq Scan` en tablas grandes
- [ ] Índices que cubren las consultas reales
- [ ] Sin índices redundantes ni sin uso
- [ ] Vista materializada para agregados costosos, refrescada por evento
- [ ] Pool de conexiones dimensionado

## Caché

- [ ] Toda caché tiene **política de invalidación escrita**
- [ ] Invalidación dirigida por evento, no sólo por TTL
- [ ] **Ninguna respuesta privada o con precio de cuenta en caché compartida**
- [ ] `Cache-Control: private, no-store` + `Vary: Cookie` donde corresponde
- [ ] Sin `Set-Cookie` en respuestas cacheables

## Verificación

- [ ] Lighthouse CI dentro de umbral
- [ ] Sin regresión frente al despliegue anterior
- [ ] Prueba de carga con volumen del año 1 (si es ruta crítica)
- [ ] Punto de saturación identificado
- [ ] Mejora documentada con **números antes/después**
- [ ] Sin degradación de otras rutas

---

**Regla:** subir un presupuesto requiere RFC con motivo. Nunca por conveniencia.
