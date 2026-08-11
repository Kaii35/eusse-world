# 11 — Plan de ejecución iterativo

**Dueño:** Product Owner + Arquitecto · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Sprints de **2 semanas**. Cada sprint entrega algo demostrable y deja el sistema
desplegable. Sin sprints de "sólo infraestructura" después del Sprint 0.

**Capacidad por sprint:** 80% features · 20% deuda, mantenimiento y mejora del proceso.

---

## Sprint 0 · Fundaciones

**Objetivo:** cualquiera clona, ejecuta un comando y tiene todo funcionando.

| #    | Tarea                                                                | Agente             | Referencia |
| ---- | -------------------------------------------------------------------- | ------------------ | ---------- |
| 0.1  | Monorepo: pnpm, Turborepo, workspaces                                | DevOps             | A1         |
| 0.2  | Configuraciones compartidas: TS, ESLint, Prettier, commitlint, husky | DevOps             | A2         |
| 0.3  | Docker Compose: PostgreSQL, Redis, MailHog, MinIO                    | DevOps             | A3         |
| 0.4  | CI: lint, typecheck, test, build, con caché                          | DevOps             | A4         |
| 0.5  | `apps/api` con health, config Zod, logger, errores                   | Backend            | A5         |
| 0.6  | Prisma con esquemas por contexto + seed                              | Base de Datos      | A6         |
| 0.7  | `@eusse/contracts` base                                              | Backend + Frontend | A7         |
| 0.8  | `@eusse/tokens` completo (light + dark)                              | Design System      | A8         |
| 0.9  | `@eusse/ui` con 8 primitivos + Storybook                             | UI                 | A9         |
| 0.10 | `apps/web` y `apps/admin` con i18n, tema y layouts                   | Frontend           | A10, A11   |
| 0.11 | `apps/workers` + outbox + DLQ                                        | Backend            | A12, A13   |
| 0.12 | `@eusse/testing` + Playwright                                        | Testing            | A14, A15   |

**Demo:** `pnpm dev` levanta cuatro apps · un evento va de API a worker · Storybook
publicado · CI verde.
**Puerta:** A. **No se avanza sin ella.**

---

## Sprint 1 · Identidad, núcleo

**Objetivo:** un usuario se autentica de forma segura.

0.1 Contratos de auth y cuenta (B1) · 1.2 Dominio Identity (B2) · 1.3 Dominio Accounts
(B3) · 1.4 Casos de uso de auth (B4) · 1.5 Persistencia y migraciones (B5) ·
1.6 Endpoints, guards, rate limiting, cookies (B6) · 1.7 Contract tests.

**Demo:** login por API, sesión que se renueva sola, endpoint protegido rechazando.
**En paralelo (equipo de UI):** C1 sistema visual, C2 componentes de marketing.

---

## Sprint 2 · Identidad en pantalla + Landing

2.1 `@eusse/auth` y BFF de Next (B7) · 2.2 UI de login, registro, recuperación,
verificación (B8) · 2.3 Selector de cuenta activa · 2.4 E2E de auth (B9) ·
2.5 Revisión de seguridad de identidad (B10) · 2.6 Landing: hero, secciones, movimiento
(C2, C3) · 2.7 i18n es/en de la landing (C4).

**Demo:** registro → aprobación → login → portal vacío. Landing navegable en dos idiomas.
**Puerta:** B.

---

## Sprint 3 · Landing en producción

3.1 SEO técnico completo (C5) · 3.2 Rendimiento y Lighthouse ≥ 95 (C6) ·
3.3 Accesibilidad AA verificada (C7) · 3.4 Formulario de contacto → lead (C8) ·
3.5 Contenido definitivo y revisión editorial · 3.6 Analítica y consentimiento ·
3.7 **Primer despliegue a producción.**

**Demo:** landing pública real, con dominio.
**Puerta:** C. **Primer valor entregado al negocio.**

---

## Sprint 4 · Catálogo, backend

4.1 Contratos de catálogo (D1) · 4.2 Dominio Catalog (D2) · 4.3 Persistencia y migraciones
(D3) · 4.4 `SearchPort` + adaptador PostgreSQL con facetas (D4) · 4.5 Casos de uso de
listado, búsqueda y detalle (D5) · 4.6 Endpoints públicos + SDK (D6) · 4.7 Seed con
catálogo realista (≥ 2 000 SKUs) · 4.8 Índices y `EXPLAIN` (D11).

**Demo:** buscar y filtrar por API sobre datos realistas, en < 150 ms p95.

---

## Sprint 5 · Catálogo, pantalla

5.1 Listado: grid, filtros, orden, paginación, skeletons, estado vacío (D7) ·
5.2 Ficha de producto: galería, variantes, atributos, ficha técnica (D8) ·
5.3 Zona de precio con estado "inicia sesión para ver tu precio" ·
5.4 SEO de producto y categoría (D10) · 5.5 Admin de catálogo, CRUD y medios (D9) ·
5.6 E2E de búsqueda y navegación (D12).

**Demo:** catálogo real navegable y administrable.
**Puerta:** D.

---

## Sprint 6 · Precios y carrito

6.1 Contratos de precio y carrito (E1) · 6.2 Dominio Pricing con escalas (E2) ·
6.3 Dominio Cart con invariantes (E3) · 6.4 Persistencia (E4) · 6.5 Casos de uso de
carrito + resolución de precio en lote (E5) · 6.6 Endpoints + SDK con optimistic updates
(E6) · 6.7 Admin de listas de precios (E9).

**Demo:** dos cuentas ven precios distintos del mismo SKU; carrito de 40 líneas por API.

---

## Sprint 7 · Carrito en pantalla + flujo invitado

**El sprint más sensible del proyecto.**

7.1 **Intención de invitado**: firma, almacenamiento, redirección, validación, consumo
(E7 · [RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md)) · 7.2 Zona de precio
autenticada · 7.3 Selector de cantidad con mínimos y múltiplos · 7.4 Drawer y página de
carrito (E8) · 7.5 Revalidación de precio y avisos · 7.6 **E2E del flujo completo
invitado → login → retorno** (E10) · 7.7 Revisión de seguridad: redirección abierta,
manipulación de precio, IDOR (E11).

**Demo:** un visitante pulsa "Añadir al carrito", inicia sesión y **vuelve al mismo
producto con el ítem ya añadido y su precio real**.
**Puerta:** E.

---

## Sprint 8 · Checkout, dominio

8.1 Contratos de checkout y orden (F1) · 8.2 Dominio Orders con máquina de estados (F2) ·
8.3 Dominio Checkout: validaciones, umbral, crédito (F3) · 8.4 Puertos de pago,
inventario y envío con adaptadores mínimos (F4, F5, F6) · 8.5 Persistencia e idempotencia
(F7) · 8.6 Casos de uso (F8) · 8.7 Eventos vía outbox (F9).

**Demo:** orden creada por API, idempotente, con evento publicado y consumido.

---

## Sprint 9 · Checkout en pantalla

9.1 UI multi-paso: revisión → dirección → pago → confirmación (F11) ·
9.2 Recuperación de error y revalidación de precio en el paso final ·
9.3 Aprobación por umbral, extremo a extremo · 9.4 Notificaciones transaccionales (F10) ·
9.5 Confirmación y detalle de orden (F12) · 9.6 Admin de órdenes (F13) ·
9.7 E2E completo (F14) · 9.8 Pruebas de concurrencia e idempotencia (F15).

**Demo:** pedido real de punta a punta, con correo y visible en el admin.
**Puerta:** F.

---

## Sprint 10 · Portal de cliente

10.1 Panel con métricas propias · 10.2 Órdenes: listado, detalle, filtros, documentos ·
10.3 **Recompra en un clic desde orden previa** · 10.4 Usuarios de la cuenta y roles ·
10.5 Direcciones · 10.6 Perfil, preferencias e idioma · 10.7 E2E de recompra < 90 s.

**Demo:** un comprador repite un pedido anterior en menos de 90 segundos.
**Puerta:** G.

---

## Sprint 11 · Back-office

11.1 Layout, navegación y permisos por rol · 11.2 Cuentas: aprobación, límites, asignación
de listas · 11.3 Usuarios y roles · 11.4 Tabla de datos reutilizable: filtros, orden,
selección múltiple, exportación · 11.5 Contenido de la landing · 11.6 Auditoría y
actividad · 11.7 E2E de gestión.

**Demo:** el equipo comercial opera el negocio sin tocar la base de datos.
**Puerta:** H.

---

## Sprint 12 · Endurecimiento

12.1 Auditoría de seguridad completa (I1) · 12.2 Prueba de carga con volumen de año 1
(I2) · 12.3 Rendimiento con datos reales (I3) · 12.4 Auditoría de accesibilidad (I4) ·
12.5 Observabilidad, alertas, SLO y runbooks (I5) · 12.6 Recuperación ante desastres
probada (I6) · 12.7 Documentación de operación (I7) · 12.8 Reversión probada (I8).

**Demo:** simulacro de incidente resuelto siguiendo el runbook.

---

## Sprint 13 · Piloto y lanzamiento

13.1 Piloto con 5–10 cuentas reales · 13.2 Corrección de hallazgos · 13.3 Formación del
equipo comercial · 13.4 Migración de catálogo y precios reales · 13.5 **Lanzamiento** ·
13.6 Guardia post-lanzamiento y monitorización intensiva.

**Puerta:** I. **Fin de la Fase 1.**

---

## Ritmo de trabajo

| Cuándo            | Qué                                                            | Duración |
| ----------------- | -------------------------------------------------------------- | -------- |
| Diario            | Sincronización: hecho, siguiente, bloqueos                     | 15 min   |
| Lunes de sprint   | Planificación con Definition of Ready verificada               | 2 h      |
| Miércoles         | Revisión técnica: RFCs abiertos, ADRs pendientes, deuda        | 1 h      |
| Viernes de sprint | Demo con negocio + retrospectiva                               | 1.5 h    |
| Fin de bloque     | Revisión de arquitectura: grafo real vs. documentado + riesgos | 2 h      |

---

## Reglas del plan

1. **Una puerta no se salta.** Si la Puerta D no está, el Sprint 6 no empieza. Se reduce
   alcance, no calidad.
2. **Todo sprint deja el sistema desplegable.** Lo incompleto va tras un feature flag.
3. **Ningún sprint es sólo de infraestructura** después del Sprint 0.
4. **El 20% de deuda no se canjea por features.** Es el mecanismo que impide que el
   Sprint 9 sea insoportable.
5. **La demo es con usuarios reales del negocio**, no con el equipo técnico.
6. **Si un sprint se sale dos veces seguidas**, se revisa el proceso en retrospectiva, no
   se pide más esfuerzo.
7. **Un RFC no aprobado bloquea su sprint.** Los RFC se aprueban con un sprint de
   antelación: mientras se implementa el Sprint N, se aprueba el RFC del Sprint N+1.

---

## Ruta crítica

```
Sprint 0 → 1 → 2 → 4 → 5 → 6 → 7 → 8 → 9 → 13
```

Los Sprints 3 (landing en producción), 10 (portal) y 11 (back-office) **no** están en la
ruta crítica del pedido digital: se pueden mover si aparece un imprevisto, sin poner en
riesgo la capacidad central de vender.
