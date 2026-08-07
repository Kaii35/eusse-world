# Skill — Seguridad

## Objetivo

Resistir a un atacante real y proteger los datos de los clientes. En B2B, una fuga entre
cuentas es un incidente comercial, no sólo técnico.

## Buenas prácticas

- **Valida toda entrada externa con Zod en la frontera.** Sin excepciones, ni siquiera
  para llamadas "internas".
- **Autoriza en el servidor, por operación, sobre el recurso concreto.** El rol no basta.
- **`accountId` desde la sesión.** En cuanto se acepta del cliente, hay un IDOR.
- **Devuelve 404 (no 403)** cuando el recurso existe pero no pertenece a la cuenta: 403
  confirma su existencia.
- **Principio de mínimo privilegio** en permisos, tokens, credenciales de base de datos y
  roles de infraestructura.
- **Defensa en profundidad**: validación + autorización + restricción en base de datos.
  Cualquiera puede fallar.
- **Rate limiting** en autenticación, búsqueda y mutaciones.
- **Errores que no informan al atacante**: sin stack, sin versiones, sin confirmar
  existencia de recursos.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Confiar en la validación del cliente | Se salta con `curl` |
| `accountId` del cuerpo o la query | IDOR (riesgo R-03) |
| Autorizar por rol sin comprobar el recurso | Un ADMIN de la cuenta A gestiona la cuenta B |
| `next` sin validar | Redirección abierta y phishing (riesgo R-02) |
| Importe tomado del cliente | Manipulación de precio |
| Secreto con prefijo `NEXT_PUBLIC_` | Credencial pública |
| `$queryRaw` con interpolación | Inyección SQL |
| Mensajes que revelan si un email existe | Enumeración de usuarios |
| Subida de archivos sin validar tipo real | Ejecución remota |
| CORS con comodín y credenciales | Cualquier origen lee datos |
| Datos personales en logs | Incumplimiento normativo |
| Dependencia vulnerable sin actualizar | Compromiso por cadena de suministro |

## Patrones

**Ámbito de cuenta forzado por el tipo**

```
findById(accountId: AccountId, orderId: OrderId): Promise<Order | null>
// no existe findById(orderId) — el compilador previene la clase entera de bugs
```

**Validación de redirección**

```
function safeReturnTo(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/'
  return ALLOWED_RETURN_PATTERNS.some((r) => r.test(next)) ? next : '/'
}
```

Con test contra un corpus: `//evil.com`, `/\evil.com`, `https://evil.com`,
`/%2f%2fevil.com`, `javascript:alert(1)`.

**Validación en la frontera**

```
const cmd = addItemToCartRequest.parse(body)   // lanza si no cumple; nada llega crudo al dominio
```

**Cabeceras de seguridad**

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<n>'; object-src 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Test de aislamiento entre cuentas** — por cada endpoint privado:

```
it('devuelve 404 cuando el recurso pertenece a otra cuenta', async () => {
  const order = await createOrder({ accountId: accountB.id })
  await request(app).get(`/api/v1/orders/${order.id}`)
    .set('Cookie', sessionFor(accountA)).expect(404)
})
```

**Subida de archivos** — validar tipo real (magic bytes, no extensión), tamaño, renombrar,
almacenar fuera de la raíz web, servir con URL firmada.

## Antipatrones

- **Seguridad por oscuridad**: IDs "difíciles de adivinar" como único control.
- **Validación sólo en el frontend.**
- **Blacklist en vez de allowlist**: siempre falta un caso.
- **Cifrado propio**: usa las primitivas estándar.
- **Secretos en el repositorio**, aunque sea "sólo desarrollo".
- **Deshabilitar CSP porque "molesta"**.
- **Confiar en `SameSite` como única protección CSRF** para operaciones sensibles.

## Ejemplos

**Bien**

```
@Post('confirm')
@RequirePermission('order:create')
async confirm(@Body() body: unknown, @Session() s: SessionData,
              @Headers('idempotency-key') key: string) {
  const cmd = confirmCheckoutRequest.parse(body)
  return this.confirmCheckout.execute({ ...cmd, accountId: s.accountId, idempotencyKey: key })
  // el total NO viene del cliente: se calcula en el servidor
}
```

**Mal**

```
@Post('confirm')
async confirm(@Body() body: any) {
  return this.orders.create({ accountId: body.accountId, total: body.total })
}
```

`accountId` y `total` del cliente: IDOR y manipulación de precio en la misma línea.

## Convenciones

- Códigos de error que no filtran información: `AUTH_INVALID_CREDENTIALS` para usuario
  inexistente y para contraseña incorrecta, indistinguibles.
- Permisos `<recurso>:<acción>`.
- Secretos en el gestor del entorno, nunca en el repositorio.
- Auditoría de toda operación sensible: actor, acción, recurso, momento, IP.
- Dependencias con lockfile congelado; actualizaciones de seguridad en < 7 días.

## Checklist

- [ ] Toda entrada validada con Zod en la frontera
- [ ] Autorización en servidor sobre el recurso concreto
- [ ] `accountId` desde la sesión
- [ ] Test de IDOR por endpoint privado (404, no 403)
- [ ] Redirecciones validadas, con corpus de payloads en CI
- [ ] Importes calculados en el servidor
- [ ] Idempotencia en operaciones sensibles
- [ ] Rate limiting activo
- [ ] CSP, HSTS y demás cabeceras configuradas
- [ ] CORS restrictivo
- [ ] Sin secretos en código, logs, URLs ni `NEXT_PUBLIC_`
- [ ] Sin datos personales en logs ni trazas
- [ ] Subidas validadas por tipo real y tamaño
- [ ] Dependencias sin vulnerabilidades altas o críticas
- [ ] Errores sin información interna
- [ ] Operaciones sensibles auditadas

## Plantillas

[`checklists/security.md`](../checklists/security.md) ·
[`skills/auth.md`](auth.md) ·
[`docs/08-technical-risks.md`](../docs/08-technical-risks.md)
