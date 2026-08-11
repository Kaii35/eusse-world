# 08 — Riesgos técnicos

**Dueño:** Arquitecto · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Escala: **Probabilidad** (Baja/Media/Alta) × **Impacto** (Bajo/Medio/Alto/Crítico).
Un riesgo sin mitigación **verificable** es un riesgo no gestionado.

---

## Riesgos críticos

### R-01 · Precio incorrecto mostrado a un cliente B2B

**Prob.** Media · **Impacto** Crítico

Un cliente ve el precio de otra cuenta, o un precio cacheado y obsoleto. En B2B esto es
pérdida de confianza inmediata y potencialmente un compromiso comercial vinculante.

**Causas:** caché de página con precio embebido · CDN cacheando respuesta autenticada ·
precio compuesto en el cliente · lista de precios mal asignada.

**Mitigación**

- La ficha de producto se cachea **sin precio**; el precio se pide autenticado desde el
  cliente (regla PRC-02/PRC-05).
- Toda respuesta con precio: `Cache-Control: private, no-store` + `Vary: Cookie`.
- El precio se calcula **sólo** en el dominio de Pricing. El frontend nunca multiplica ni
  suma importes para mostrarlos.
- Test de contrato: dos cuentas distintas piden el mismo SKU y reciben precios distintos.
- Test E2E: cerrar sesión no deja precio de la cuenta anterior en pantalla ni en caché.
- Alerta si un endpoint con precio devuelve cabecera cacheable.

**Verificación:** test automatizado en CI. Si falla, no se despliega.

---

### R-02 · Redirección abierta en el flujo de retorno post-login

**Prob.** Alta · **Impacto** Crítico

El parámetro `next` del flujo de RFC-0004 es un vector clásico de phishing: `?next=https://sitio-malicioso`.

**Mitigación**

- `next` se valida contra **allowlist de rutas internas** (empieza por `/`, sin `//`, sin
  `\`, sin esquema, sin host). Cualquier otra cosa → `/`.
- La intención se guarda **firmada en el servidor** (cookie httpOnly firmada), no como
  parámetro manipulable.
- La intención es de un solo uso y expira en 30 minutos.
- Test de seguridad con un corpus de payloads maliciosos, en CI.

---

### R-03 · Fuga de datos entre cuentas (IDOR)

**Prob.** Media · **Impacto** Crítico

Un comprador de la cuenta A accede a órdenes, carrito o usuarios de la cuenta B cambiando
un ID en la URL.

**Mitigación**

- Toda consulta lleva `accountId` **de la sesión**, nunca del cliente. El `accountId` de
  la petición se ignora si no coincide con la sesión.
- Repositorios con ámbito de cuenta obligatorio a nivel de tipo: no existe un método
  `findById(id)` sin `accountId`.
- IDs UUID v7, no adivinables ni enumerables.
- Test de integración por cada endpoint de lectura: cuenta A pide recurso de B → 404 (no
  403; 403 confirma existencia).
- Auditoría dedicada en el Bloque I.

---

### R-04 · Órdenes duplicadas

**Prob.** Alta · **Impacto** Alto

Doble clic, reintento de red, reintento de cola o botón "atrás" generan dos órdenes
idénticas.

**Mitigación**

- `Idempotency-Key` obligatoria en confirmar checkout; se almacena la respuesta y se
  devuelve la misma ante repetición.
- Botón deshabilitado durante la petición y estado `CHECKING_OUT` en el carrito.
- Restricción única en base de datos por `(accountId, idempotencyKey)`.
- Todos los consumidores de cola son idempotentes por `eventId`.
- Test específico: 10 peticiones concurrentes con la misma clave → 1 orden.

---

## Riesgos altos

### R-05 · El monolito modular se convierte en un monolito

**Prob.** Alta · **Impacto** Alto

Sin disciplina, los módulos se importan entre sí libremente y en seis meses no hay
fronteras que extraer.

**Mitigación**

- Fronteras verificadas en CI, no por convención (`eslint-plugin-boundaries`).
- Sólo `public/` de cada módulo es importable; el resto es un error de lint.
- Un esquema PostgreSQL por contexto, sin FK cruzadas.
- Revisión de arquitectura mensual: se ejecuta `dependency-cruiser` y se compara el grafo
  real con `07-module-dependencies.md`. Cualquier arista nueva es un hallazgo.

---

### R-06 · Complejidad de la arquitectura hexagonal frente a la velocidad

**Prob.** Alta · **Impacto** Medio

Cuatro capas para un CRUD desmotiva y se termina saltando el proceso.

**Mitigación**

- Regla explícita: **el CRUD sin invariantes no necesita dominio rico**. Un caso de uso
  que sólo lee y mapea puede ir de `application` a Prisma directamente. La ceremonia se
  reserva para donde hay reglas de negocio.
- Generadores (`pnpm gen:module`, `pnpm gen:use-case`) para eliminar el trabajo repetitivo.
- Documento de "cuándo NO usar el patrón completo" en [`skills/backend-nestjs.md`](../skills/backend-nestjs.md).

---

### R-07 · Rendimiento del catálogo B2B (miles de SKUs, facetas, precios por cuenta)

**Prob.** Media · **Impacto** Alto

Listados con filtros multi-atributo sobre PostgreSQL degradan rápido; resolver el precio
por cuenta para 60 tarjetas puede ser N+1.

**Mitigación**

- Índices GIN sobre atributos JSONB y `tsvector`; `EXPLAIN ANALYZE` obligatorio en cada
  consulta de listado, adjunto al PR.
- Resolución de precios **en lote**: un endpoint recibe N SKUs y devuelve N precios.
- Vista materializada para facetas, refrescada por evento de catálogo.
- `SearchPort` permite migrar a Meilisearch sin tocar dominio ni frontend.
- Prueba de carga con 50 000 SKUs y 200 usuarios concurrentes antes del lanzamiento.

---

### R-08 · Pérdida o duplicación de eventos

**Prob.** Media · **Impacto** Alto

Un evento publicado y no persistido (o al revés) deja el sistema inconsistente: orden
creada sin notificar, stock descontado dos veces.

**Mitigación**

- Outbox transaccional: el evento se escribe en la misma transacción que el cambio.
- Relay con reintento exponencial y _dead letter queue_.
- Deduplicación por `eventId` en `processed_events` para todo consumidor.
- Alerta si la DLQ crece o si el outbox tiene pendientes de más de 5 minutos.
- Runbook de reproceso manual documentado.

---

### R-09 · Migraciones de base de datos con caída

**Prob.** Media · **Impacto** Alto

Un `ALTER TABLE` bloqueante en una tabla grande tumba producción.

**Mitigación**

- Patrón expand → migrate → contract, obligatorio, en tres despliegues.
- Prohibido `DROP COLUMN`/`RENAME` en el mismo despliegue que deja de usarla.
- `lock_timeout` y `statement_timeout` en toda migración.
- Índices con `CREATE INDEX CONCURRENTLY`.
- Toda migración se ensaya contra una copia de producción.
- [`checklists/database-migration.md`](../checklists/database-migration.md) obligatoria.

---

### R-10 · Deriva del design system

**Prob.** Alta · **Impacto** Medio

Aparecen botones a medida en cada app y el sistema deja de ser sistema.

**Mitigación**

- Valores arbitrarios de Tailwind prohibidos por lint (`text-[#...]`, `p-[13px]`).
- Storybook como catálogo único; un componente sin story no se mergea.
- Regresión visual con Playwright snapshots.
- Auditoría trimestral: se cuentan componentes duplicados entre `web` y `admin`.

---

## Riesgos medios

### R-11 · Bundle inflado por Radix, Motion e iconos

**Prob.** Media · **Impacto** Medio
**Mitigación:** `size-limit` con presupuesto por ruta que rompe el build · imports
granulares de Radix · Motion cargado dinámicamente en secciones no críticas · iconos
tree-shakeables uno a uno · `@next/bundle-analyzer` en cada release.

### R-12 · Deuda de i18n (textos escritos directamente en el código)

**Prob.** Alta · **Impacto** Medio
**Mitigación:** regla de ESLint contra literales en JSX desde el primer commit · CI valida
paridad de claves entre `es` y `en` · pseudo-localización en preview para detectar textos
sin traducir y desbordes de layout.

### R-13 · Cobertura de tests que cae bajo presión de fechas

**Prob.** Alta · **Impacto** Medio
**Mitigación:** umbral de cobertura que rompe el build (90% dominio) · los contract tests
se escriben **antes** que la implementación · E2E de los cinco recorridos críticos como
puerta de despliegue.

### R-14 · Dependencia de un proveedor de pagos aún no elegido

**Prob.** Media · **Impacto** Medio
**Mitigación:** `PaymentPort` definido en Fase 1 con adaptador offline · Fase 1 se lanza
con transferencia y crédito, sin bloquear el negocio · la decisión de proveedor se toma
por ADR en Fase 2 con criterios ya escritos.

### R-15 · Turborepo y pnpm mal configurados (caché que miente)

**Prob.** Media · **Impacto** Medio
**Mitigación:** `inputs`/`outputs` explícitos por tarea · `pnpm-lock.yaml` commiteado y
`--frozen-lockfile` en CI · verificación periódica de que un build limpio y uno cacheado
producen el mismo artefacto.

### R-16 · React 19 / Next 15 / Tailwind v4: ecosistema aún madurando

**Prob.** Media · **Impacto** Medio
**Mitigación:** versiones fijadas exactas, sin rangos · actualización sólo por PR
dedicado con E2E completo · preferir librerías con soporte declarado para React 19 ·
no adoptar APIs experimentales en rutas críticas.

### R-17 · Sobre-ingeniería para fases que quizá no lleguen

**Prob.** Alta · **Impacto** Medio
**Mitigación:** regla del §9 de la arquitectura — se paga el hueco (puerto, evento,
columna), nunca la habitación · toda abstracción "por si acaso" debe justificarse en RFC
con un caso concreto de Fase 2+ · en revisión, "¿esto lo necesitamos hoy?" es una pregunta
legítima y suficiente para pedir simplificación.

### R-18 · Agentes de IA generando código incoherente

**Prob.** Alta · **Impacto** Medio
**Mitigación:** ver [10-ai-strategy.md](10-ai-strategy.md) — contrato por agente,
contexto mínimo obligatorio, Definition of Done verificable por máquina, y CI como árbitro
final. Ningún agente mergea sin revisión humana en Fase 1.

---

## Registro de revisión

| Fecha      | Cambio                                    |
| ---------- | ----------------------------------------- |
| 2026-08-06 | Versión inicial, 18 riesgos identificados |

Los riesgos se revisan al cerrar cada bloque de [06-implementation-order.md](06-implementation-order.md).
