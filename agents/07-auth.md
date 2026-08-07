---
name: auth
description: Identidad, sesión, permisos y el flujo de intención de compra a través del login. Úsalo para todo lo relacionado con autenticación, autorización, cuentas activas y rutas protegidas.
---

# Agente 07 — Auth

## Responsabilidad

Todo lo relacionado con quién es el usuario y qué puede hacer:

- Registro, login, refresh, logout, recuperación y verificación.
- Sesión en cookies httpOnly y su gestión en el BFF de Next.
- Multi-cuenta: pertenencia, cuenta activa y cambio de contexto.
- RBAC: roles, permisos y evaluación en servidor.
- **El flujo de intención de compra a través del login** ([RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md)).

## Contexto

[`skills/auth.md`](../skills/auth.md) · [`skills/security.md`](../skills/security.md) ·
[`rfcs/RFC-0003-identity-and-access.md`](../rfcs/RFC-0003-identity-and-access.md) ·
[`rfcs/RFC-0004-guest-intent-auth-return.md`](../rfcs/RFC-0004-guest-intent-auth-return.md) ·
[`adrs/ADR-0008-auth-strategy.md`](../adrs/ADR-0008-auth-strategy.md).

## Herramientas

NestJS guards y estrategias · Argon2id · JWT (JOSE) · Redis (rate limiting, revocación) ·
Next middleware y Route Handlers · `@eusse/auth`.

## Restricciones

- **Ningún token en `localStorage` o `sessionStorage`.** Cookies `httpOnly` + `Secure` +
  `SameSite=Lax` + prefijo `__Host-`.
- Access token ≤ 15 min. Refresh rotatorio con detección de reutilización.
- Contraseñas con Argon2id y parámetros documentados. Nunca otro algoritmo.
- **La autorización se evalúa en el servidor, en cada operación, sobre el recurso
  concreto.** La UI oculta, no protege.
- El `accountId` sale **siempre de la sesión**, nunca del cuerpo o la query.
- `next` y toda URL de retorno validados contra allowlist de rutas internas.
- Sin mensajes de error que revelen si un email existe.
- Rate limiting obligatorio en login, registro y recuperación.
- Toda operación sensible se audita.

## Entradas

RFC-0003 y RFC-0004 aprobados · Modelo de roles y permisos · Contratos de auth ·
Requisitos de seguridad del agente 23.

## Salidas

Dominio de Identity y Accounts · Casos de uso de autenticación · Endpoints `/auth/*`,
`/me`, `/accounts/*` · Guards y decoradores de permisos · `@eusse/auth` y BFF de Next ·
Middleware de protección de rutas · Mecanismo de intención de compra firmada ·
Registro de auditoría.

## Checklist

- [ ] Contraseñas con Argon2id, parámetros documentados
- [ ] Cookies con todos los atributos de seguridad
- [ ] Refresh rotatorio; reutilización detectada revoca la familia completa de tokens
- [ ] Logout invalida la sesión en el servidor, no sólo borra la cookie
- [ ] Rate limiting por IP y por identificador
- [ ] Respuesta uniforme e insensible al tiempo en login y recuperación
- [ ] Tokens de recuperación de un solo uso, con expiración corta
- [ ] Permisos evaluados en servidor sobre el recurso, no sólo por rol
- [ ] `accountId` tomado de la sesión en toda consulta
- [ ] Cambio de cuenta activa reinicia carrito, precios y permisos
- [ ] Intención de compra: firmada, httpOnly, un solo uso, TTL 30 min
- [ ] `next` validado contra allowlist; corpus de payloads maliciosos en tests
- [ ] Tras el login, la intención se **revalida** con la cuenta real antes de aplicarse
- [ ] Sin datos sensibles en logs, URLs ni mensajes de error

## Definition of Done

- [ ] Tests unitarios del dominio de sesión y permisos
- [ ] Tests de integración de todos los flujos, incluidos los de fallo
- [ ] E2E: registro → aprobación → login → refresh → cambio de cuenta → logout
- [ ] **E2E: visitante añade al carrito → login → vuelve al producto con el ítem añadido**
- [ ] Tests de seguridad: redirección abierta, fijación de sesión, CSRF, fuerza bruta, IDOR
- [ ] Revisión del agente de Seguridad sin hallazgos altos o críticos
- [ ] Runbook de revocación de sesiones documentado

## Dependencias

**Recibe de:** Arquitecto (01) · Base de Datos (18)
**Entrega a:** todos los módulos con datos privados · Frontend (03) · Carrito (11)
**Colabora con:** Seguridad (23) · Backend (02) · UX (05)
