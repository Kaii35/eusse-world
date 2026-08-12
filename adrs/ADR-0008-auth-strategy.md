# ADR-0008 — Autenticación propia con JWT en cookies httpOnly

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto + Seguridad · **RFC** RFC-0003, RFC-0004 |
| ------ | ------------------------------------------------------------------------------------------------- |

## Contexto

Modelo de identidad con una particularidad que ningún proveedor externo cubre bien: un
usuario puede pertenecer a **varias cuentas** con **roles distintos en cada una**, y opera
en **una cuenta activa** que determina precios, carrito y permisos.

Además, la app móvil de Fase 4 necesita la misma identidad que la web.

## Decisión

Autenticación **propia**, emitida por `apps/api`:

- Contraseñas con **Argon2id** (`m=19456, t=2, p=1`).
- Access token JWT de 15 min + refresh opaco rotatorio de 30 días con **detección de
  reutilización** (usar un refresh ya consumido revoca la familia entera).
- Transporte en **cookies `httpOnly` + `Secure` + `SameSite=Lax` + prefijo `__Host-`**,
  gestionadas por el BFF de Next.
- **Ningún token en `localStorage`.**
- **Los permisos no viajan en el token**: se evalúan en servidor por operación, para que
  revocar un permiso tenga efecto inmediato.
- El `accountId` sale **siempre de la sesión**, nunca del cliente.

### Librerías (añadido al implementar B5)

| Necesidad     | Elegida                                   | Por qué                                                                                                                                                           |
| ------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Argon2id      | `@node-rs/argon2`                         | Binario precompilado. `argon2` obliga a compilar con node-gyp, que falla en Windows sin herramientas de compilación y añade minutos a cada instalación en CI      |
| Firma del JWT | `jose`                                    | TypeScript puro, sin dependencias nativas; el mismo paquete sirve en el runtime edge de Next si algún día hace falta verificar allí                               |
| Algoritmo     | **HS256**                                 | Un solo emisor y un solo verificador. RS256 tendría sentido si terceros verificaran el token; hoy nadie lo hace, y una clave asimétrica sería complejidad sin uso |
| Secreto       | `JWT_ACCESS_SECRET`, mínimo 32 caracteres | Sólo en `apps/api`. El BFF de Next **no verifica tokens**: pregunta a la API. Repartir el secreto multiplicaría los sitios desde los que se filtra                |

No hay `JWT_REFRESH_SECRET`: el refresh es **opaco**, no firmado, y de él sólo se guarda un
SHA-256 (sin sal, porque son 32 bytes aleatorios y no hay diccionario que atacar).

## Alternativas descartadas

| Alternativa              | Por qué se descarta                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Auth0 / Clerk            | Coste por usuario; el modelo multi-cuenta con roles por cuenta no encaja en su modelo; dependencia crítica de un tercero |
| NextAuth / Auth.js       | La sesión vive en el frontend; la app móvil no la puede usar; el backend seguiría necesitando su propia autenticación    |
| Tokens en `localStorage` | Cualquier XSS se convierte en robo de sesión permanente                                                                  |
| Permisos dentro del JWT  | Revocar un permiso no tendría efecto hasta que el token expire                                                           |

## Consecuencias

**Positivas** — una sola identidad para web, admin y móvil · control total del modelo
multi-cuenta · sin coste por usuario · revocación inmediata de permisos y sesiones · inmune
a robo de token por XSS.

**Negativas** — **hay que implementarla y auditarla bien**: es superficie de ataque propia ·
sin MFA de fábrica (se deja el hueco en el modelo) · requiere revisión de seguridad
dedicada (paso B10) · el refresh rotatorio añade complejidad al manejo de errores del
cliente.

**Neutras** — obliga a un test de IDOR por cada endpoint privado, que hace falta igualmente.

## Criterio de revisión

Si se requiere SSO empresarial (SAML/OIDC) para clientes grandes, se añade como **método
adicional** sobre este modelo, no como sustituto.

## Enlaces

[RFC-0003](../rfcs/RFC-0003-identity-and-access.md) · [RFC-0004](../rfcs/RFC-0004-guest-intent-auth-return.md) ·
[`skills/auth.md`](../skills/auth.md) · [`skills/security.md`](../skills/security.md)
