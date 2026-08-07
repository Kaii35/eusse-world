# Checklist — Seguridad

Obligatoria en todo feature que toque **datos privados, dinero, autenticación o entrada
externa**.

> Un hallazgo **crítico o alto bloquea el despliegue**. No es una recomendación.

---

## Entrada

- [ ] Toda entrada externa validada con Zod **en la frontera**
- [ ] Sin confiar en la validación del cliente para nada
- [ ] Límites de tamaño en cuerpos, arrays y cadenas
- [ ] Sin `$queryRaw` con interpolación de strings (y si lo hay, revisado explícitamente)
- [ ] Subida de archivos: tipo real validado (magic bytes, no extensión), tamaño limitado,
      renombrado, almacenado fuera de la raíz web

## Autenticación

- [ ] Contraseñas con Argon2id
- [ ] Tokens en cookies `httpOnly` + `Secure` + `SameSite` + `__Host-`
- [ ] **Ningún token en `localStorage` o `sessionStorage`**
- [ ] Refresh rotatorio con detección de reutilización
- [ ] Logout invalida la sesión **en el servidor**
- [ ] Rate limiting en login, registro y recuperación
- [ ] Respuestas uniformes e insensibles al tiempo (no revelan si un email existe)
- [ ] Tokens de recuperación: un solo uso, TTL corto, hash en base de datos

## Autorización — **la sección más importante**

- [ ] Permiso verificado **en el servidor**, por operación
- [ ] Verificación **sobre el recurso concreto**, no sólo por rol
- [ ] **`accountId` tomado de la sesión, nunca del cliente**
- [ ] Repositorio con ámbito de cuenta obligatorio por tipo
- [ ] **Test de IDOR por cada endpoint que devuelve datos privados**
- [ ] Recurso de otra cuenta → **404**, no 403
- [ ] La UI oculta, pero no es el control

## Redirecciones

- [ ] Toda URL de retorno validada contra **allowlist de rutas internas**
- [ ] Corpus de payloads maliciosos en CI (`//evil.com`, `/\evil.com`, `https://…`,
      `javascript:`, `/%2f%2f…`, con `\r\n`)
- [ ] La intención del visitante va **firmada en cookie httpOnly**, no en la query

## Dinero

- [ ] El importe se calcula **siempre en el servidor**
- [ ] Nunca se acepta un total del cliente
- [ ] Idempotencia en toda operación que crea o cobra
- [ ] Sin datos de tarjeta almacenados, ni siquiera cifrados
- [ ] Webhooks verificados por firma e idempotentes por ID del proveedor

## Cabeceras y transporte

- [ ] CSP estricta, sin `unsafe-inline`
- [ ] HSTS con `includeSubDomains`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restrictiva
- [ ] CORS sin comodines
- [ ] Todo por HTTPS

## Datos y secretos

- [ ] Sin secretos en el código, en logs, en URLs ni con prefijo `NEXT_PUBLIC_`
- [ ] gitleaks en verde
- [ ] Sin datos personales ni tokens en logs ni trazas
- [ ] Respuestas privadas con `Cache-Control: private, no-store`
- [ ] **Ninguna respuesta con precio de cuenta es cacheable en capa compartida**
- [ ] Datos personales identificados, con política de retención
- [ ] Descargas privadas con URL firmada y expiración

## Errores

- [ ] Sin stack traces expuestos
- [ ] Sin versiones de software en las respuestas
- [ ] Los errores no confirman la existencia de recursos ajenos

## Dependencias

- [ ] `pnpm audit` sin vulnerabilidades altas ni críticas
- [ ] Lockfile congelado en CI
- [ ] Dependencias nuevas justificadas por ADR

## Auditoría

- [ ] Toda operación sensible registra actor, acción, recurso, momento e IP
- [ ] El registro de auditoría es inmutable

---

## Modelo de amenazas (STRIDE)

Para el feature revisado, enumera al menos una amenaza por categoría y su control:

| Categoría | Amenaza | Control |
| --------- | ------- | ------- |
| **S**poofing (suplantación) | | |
| **T**ampering (manipulación) | | |
| **R**epudiation (repudio) | | |
| **I**nformation disclosure (fuga) | | |
| **D**enial of service | | |
| **E**levation of privilege | | |
