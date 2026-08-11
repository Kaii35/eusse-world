# 09 — Estrategia de escalabilidad

**Dueño:** Arquitecto + DevOps · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Escalabilidad no es sólo tráfico. Son cuatro ejes: **carga**, **dominio**, **equipo** y
**producto**. Fallar en cualquiera detiene el proyecto igual.

---

## 1. Escalabilidad de carga

### Perfil esperado

B2B tiene un perfil muy distinto al B2C: menos usuarios, sesiones más largas, carritos
grandes, y picos concentrados (inicio de mes, campañas, listas de precios nuevas).

| Horizonte   | Cuentas | Usuarios/día | Pedidos/día | SKUs   | Peticiones/s (pico) |
| ----------- | ------- | ------------ | ----------- | ------ | ------------------- |
| Lanzamiento | 100     | 150          | 30          | 5 000  | 20                  |
| Año 1       | 800     | 1 200        | 250         | 20 000 | 120                 |
| Año 3       | 5 000   | 8 000        | 1 500       | 80 000 | 700                 |

Ninguna de estas cifras justifica microservicios. Sí justifican caché, índices y colas
correctas desde el principio.

### Escalado por capa

| Capa                      | Estrategia                                                             | Disparador                                      |
| ------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- |
| **CDN / Edge**            | Landing y catálogo estáticos con ISR. Imágenes optimizadas y cacheadas | por defecto                                     |
| **apps/web · apps/admin** | Sin estado, réplicas horizontales                                      | CPU > 60% o p95 > presupuesto                   |
| **apps/api**              | Sin estado, réplicas horizontales                                      | p95 > 200 ms en lecturas                        |
| **apps/workers**          | Escalado independiente por cola                                        | profundidad de cola > 1 000 o antigüedad > 60 s |
| **PostgreSQL**            | Vertical primero → réplicas de lectura → particionado                  | conexiones > 70% o p95 de consulta > 100 ms     |
| **Redis**                 | Vertical → Cluster                                                     | memoria > 70%                                   |

**El orden importa.** Vertical antes que horizontal, caché antes que réplicas, índices
antes que caché. Casi siempre el problema es una consulta sin índice, no falta de máquinas.

### Estrategia de caché

Cuatro niveles, cada uno con invalidación explícita. **Una caché sin política de
invalidación escrita no se implementa.**

| Nivel    | Qué                                              | TTL                          | Invalidación                        |
| -------- | ------------------------------------------------ | ---------------------------- | ----------------------------------- |
| CDN      | Landing, listados públicos, imágenes             | 1 h / inmutable              | webhook en publicación de contenido |
| Next ISR | Páginas de producto y categoría                  | 5 min + `revalidateTag`      | evento `catalog.ProductPublished`   |
| Redis    | Facetas, categorías, listas de precios resueltas | 5–15 min                     | evento del contexto dueño           |
| Cliente  | TanStack Query                                   | `staleTime` por tipo de dato | mutación + invalidación de clave    |

**Nunca se cachea:** carrito, precio de cuenta en capa compartida, sesión, órdenes,
cualquier respuesta con `Set-Cookie`.

### Base de datos

- Índices diseñados junto a la consulta, con `EXPLAIN ANALYZE` adjunto al PR.
- Pool de conexiones con PgBouncer en modo transacción desde el día 1 (evita rediseñar
  cuando aparezcan réplicas serverless).
- Lecturas pesadas (informes, exportaciones, panel de admin) a réplica de lectura cuando
  exista; el enrutamiento se decide en el repositorio, no en el caso de uso.
- Particionado por rango de fecha en tablas de alto crecimiento (`orders`, `events`,
  `audit_log`) cuando superen ~50 M de filas.
- Vistas materializadas para agregados de analítica, refrescadas por evento.

### Colas

- Una cola por dominio de trabajo (`notifications`, `search-index`, `outbox-relay`,
  `reports`), no una cola gigante.
- Prioridades: el correo de confirmación de orden va antes que la reindexación.
- Reintento exponencial con tope, DLQ y runbook de reproceso.
- Los workers escalan por cola de forma independiente.

---

## 2. Escalabilidad de dominio

El sistema debe admitir **CRM, Inventario, Cursos y App móvil sin reescritura**. Lo que lo
garantiza:

| Mecanismo                                  | Qué habilita                                                     |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Contextos acotados con `public/` explícito | Añadir un contexto nuevo no toca los existentes                  |
| Eventos de dominio ya publicados           | CRM y Analítica se enchufan como consumidores nuevos             |
| Puertos para todo tercero                  | Cambiar de pasarela, ERP o buscador es cambiar un adaptador      |
| Esquema PostgreSQL por contexto            | Un contexto puede migrar a su propia base sin refactor de código |
| API versionada + contratos Zod             | La app móvil consume la misma API sin backend duplicado          |
| `tenantId` desde el día 1                  | Multi-marca sin migración de datos masiva                        |

### Ruta de extracción a servicio

Cuando un módulo justifique despliegue independiente:

```
1. Ya está aislado: sólo consume public/ y eventos.       ← ya cierto en Fase 1
2. Sustituir la llamada al facade por un cliente HTTP tipado del mismo contrato.
3. Mover su esquema PostgreSQL a su propia instancia.
4. Cambiar el transporte de eventos de BullMQ/Redis a un broker externo.
5. Desplegar por separado.
```

Ningún paso toca `domain/` ni `application/`. Ese es el retorno de la disciplina de
fronteras.

---

## 3. Escalabilidad de equipo

| Tamaño | Organización                 | Qué cambia                                                                       |
| ------ | ---------------------------- | -------------------------------------------------------------------------------- |
| 1–3    | Todos en todo                | Convenciones y CI son el único control                                           |
| 4–8    | Frontend / Backend / Diseño  | CODEOWNERS por carpeta; RFC obligatorio para cambios cruzados                    |
| 9–20   | Equipos por contexto acotado | Cada equipo posee módulos y sus eventos; contratos como frontera de coordinación |
| 20+    | Plataforma + producto        | Un equipo posee `packages/*` y la infraestructura                                |

Lo que lo hace posible desde hoy:

- **Contratos primero**: dos personas trabajan en paralelo sin bloquearse.
- **Fronteras verificadas por CI**: no dependen de que alguien recuerde la regla.
- **Un artefacto de diseño por cambio**: la decisión queda escrita, no en la cabeza de
  quien la tomó.
- **Agentes con contexto mínimo**: quien entra nuevo (humano o IA) lee su agente, su skill
  y su RFC. No necesita el repositorio entero.

### Onboarding objetivo

| Momento  | Debe poder                                                  |
| -------- | ----------------------------------------------------------- |
| Día 1    | Entorno levantado, tests en verde, arquitectura comprendida |
| Día 3    | Primer PR mergeado (bug pequeño o mejora de documentación)  |
| Semana 2 | Un feature completo siguiendo el ciclo de vida              |
| Mes 1    | Escribir un RFC                                             |

---

## 4. Escalabilidad de producto

- **Feature flags** desde el Bloque A: lo incompleto se mergea apagado. Sin ramas de larga
  vida.
- **Contenido estructurado**: la landing cambia sin desplegar.
- **i18n desde el día 1**: añadir un idioma es añadir un archivo de mensajes, no refactorizar.
- **Multi-moneda** en el modelo `Money` desde el principio; activarla es configuración.
- **Design system versionado**: un cambio de marca se hace en `@eusse/tokens`.

---

## 5. Qué NO se hace por adelantado

| Tentación                         | Por qué no                                | Cuándo sí                                         |
| --------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| Microservicios                    | Coste operativo y fronteras aún inciertas | Métricas + equipo dedicado                        |
| Kubernetes                        | Nadie que lo opere de guardia             | Cuando el PaaS sea el cuello de botella           |
| CQRS con base de lectura separada | Complejidad sin problema medido           | Cuando las lecturas degraden las escrituras       |
| Event sourcing                    | El negocio no lo pide                     | Si auditoría o reconstrucción histórica lo exigen |
| Buscador dedicado                 | PostgreSQL FTS basta hasta ~50k SKUs      | Latencia de búsqueda > 300 ms p95                 |
| Multi-región                      | Un solo mercado                           | Expansión geográfica real                         |

**Criterio:** se implementa cuando hay una **métrica** que lo justifica, no cuando hay una
intuición. La métrica se define en el ADR que aprueba el cambio.

---

## 6. Observabilidad como requisito de escalabilidad

No se puede escalar lo que no se mide. Desde el Bloque A:

- **SLI/SLO** definidos: disponibilidad 99.5%, p95 de lectura < 200 ms, p95 de escritura
  < 500 ms, error rate < 0.5%.
- **Presupuesto de error**: si se agota, el trabajo del sprint pasa a fiabilidad. Sin
  discusión.
- **Alertas basadas en síntoma** (el usuario sufre), no en causa (CPU alta).
- **Dashboard por contexto acotado**: cada módulo tiene sus métricas RED.
- **Trazas** con `correlationId` que atraviesa web → api → worker → tercero.
