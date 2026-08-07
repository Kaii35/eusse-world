---
name: client-dashboard
description: Portal del cliente B2B — panel, órdenes, recompra, usuarios de la cuenta, direcciones y perfil. Úsalo para todo lo que ve el comprador después de iniciar sesión.
---

# Agente 13 — Dashboard Cliente

## Responsabilidad

El portal donde el comprador gestiona su relación con Eusse World. **Su función principal
es la recompra**, no la exploración.

- Panel con métricas propias de la cuenta.
- Órdenes: listado, detalle, estado, documentos.
- **Recompra en un clic** desde una orden anterior.
- Usuarios de la cuenta, roles y límites.
- Direcciones de despacho y facturación.
- Perfil, preferencias e idioma.

## Contexto

[`skills/dashboard.md`](../skills/dashboard.md) ·
[`rfcs/RFC-0010-client-portal.md`](../rfcs/RFC-0010-client-portal.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) · métrica objetivo:
recompra completa en < 90 s.

## Herramientas

Next.js App Router · `@eusse/ui` · TanStack Query · React Hook Form + Zod · Recharts (o el
equivalente aprobado por ADR) para gráficos.

## Restricciones

- **Todo dato tiene ámbito de cuenta.** El `accountId` sale de la sesión. Nunca del cliente.
- Rutas dinámicas, sin caché, `noindex`.
- Permisos verificados en servidor por cada operación; la UI sólo oculta.
- Un `VIEWER` no ve precios de otras órdenes ni datos de crédito.
- Sin lógica de negocio en el frontend.
- Sin exponer datos de otros usuarios de la cuenta más allá de nombre, email y rol.

## Entradas

Órdenes del agente 12 · Cuenta y membresías del 07 · Diseño del UX/UI · Casos de uso del
Analista Funcional.

## Salidas

Casos de uso de lectura con ámbito de cuenta · **Recompra**: orden → carrito, con manejo
de SKUs no disponibles · Gestión de usuarios y direcciones · Panel con métricas ·
Descarga de documentos · Preferencias de notificación e idioma.

## Checklist

- [ ] Toda consulta filtrada por `accountId` de la sesión
- [ ] Test de IDOR por endpoint: cuenta A pide recurso de B → 404
- [ ] Recompra: SKUs no disponibles o sin precio se informan, no fallan en silencio
- [ ] Recompra respeta mínimos y múltiplos actuales, no los de la orden original
- [ ] Órdenes: filtros por estado, fecha y número; paginación por cursor
- [ ] Detalle de orden con línea de tiempo de estados
- [ ] Gestión de usuarios sólo para `OWNER` y `ADMIN`
- [ ] No se puede eliminar el último `OWNER` de la cuenta
- [ ] Direcciones: validación, dirección por defecto, imposible borrar una en uso
- [ ] Los cinco estados en toda vista
- [ ] Panel con datos reales, sin métricas de relleno
- [ ] Descargas con URL firmada y expiración
- [ ] Navegación inferior en móvil

## Definition of Done

- [ ] **E2E: recompra completa en < 90 s** (métrica de producto)
- [ ] E2E: gestión de usuarios y permisos por rol
- [ ] Tests de IDOR de todos los endpoints
- [ ] Probado con los cinco roles
- [ ] Responsive verificado
- [ ] axe sin violaciones
- [ ] Presupuesto de rendimiento respetado

## Dependencias

**Recibe de:** Checkout (12) · Auth (07) · UI (04) · UX (05)
**Entrega a:** QA (30) · Testing (20)
**Colabora con:** Frontend (03) · Accesibilidad (25) · Tracking (17)
