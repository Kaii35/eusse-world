# Skill — Autenticación y autorización

## Objetivo

Saber quién es el usuario y qué puede hacer, sin filtrar datos entre cuentas y sin perder
lo que el usuario intentaba hacer antes de identificarse.

## Buenas prácticas

- **Cookies `httpOnly` + `Secure` + `SameSite=Lax` + prefijo `__Host-`.** Nunca
  `localStorage`: cualquier XSS se convierte en robo de sesión permanente.
- **Access token corto (15 min) + refresh rotatorio** con detección de reutilización. Si un
  refresh se usa dos veces, se revoca toda la familia: alguien lo robó.
- **Argon2id** para contraseñas, con parámetros documentados en el ADR.
- **Autorización en el servidor, por operación, sobre el recurso concreto.** El rol no
  basta: hay que comprobar que *ese* recurso pertenece a *esa* cuenta.
- **`accountId` desde la sesión, siempre.** En cuanto lo aceptas del cliente, tienes un
  IDOR.
- **Respuestas uniformes** en login y recuperación: no revelan si el email existe.
- **Rate limiting** por IP y por identificador en autenticación.
- **La intención del visitante se guarda firmada en el servidor**, no en un parámetro de
  URL manipulable.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Token en `localStorage` | XSS = sesión robada permanentemente |
| `accountId` del cuerpo de la petición | IDOR inmediato |
| Permisos comprobados sólo en la UI | Se saltan con `curl` |
| Comprobar el rol pero no la pertenencia del recurso | Un `ADMIN` de la cuenta A gestiona la cuenta B |
| Redirección `next` sin validar | Phishing (riesgo R-02) |
| "Email no registrado" en login | Enumeración de usuarios |
| Comparación de tokens no constante en tiempo | Ataque de temporización |
| Logout que sólo borra la cookie | La sesión sigue válida en el servidor |
| Refresh sin rotación | Un token robado vale para siempre |
| Sesión que no cambia al cambiar de cuenta activa | El usuario ve datos de la cuenta anterior |

## Patrones

**Flujo de intención de compra a través del login** — el requisito de producto central:

```
1. Visitante pulsa "Añadir al carrito" (SKU-123, qty 10)
2. Servidor: no hay sesión
3. Servidor firma la intención { sku, qty, returnTo } y la deja en cookie httpOnly (TTL 30 min)
4. 302 → /login?next=/p/producto-x
5. Login correcto → Set-Cookie de sesión
6. Servidor lee y VERIFICA la firma de la intención
7. REVALIDA con la cuenta real: ¿visible? ¿tiene precio? ¿cantidad válida?
8. Si todo bien: añade al carrito y consume la intención (un solo uso)
9. 302 → /p/producto-x + mensaje "Añadido: 10 × Producto X"
```

**Puntos que no son negociables:** firma en servidor · un solo uso · TTL corto ·
**revalidación con la cuenta real** · `next` contra allowlist.

**Validación de la URL de retorno**

```
function safeReturnTo(next: string | null): string {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'      // sin esquema ni host
  if (next.startsWith('//')) return '/'      // sin protocolo relativo
  if (next.includes('\\')) return '/'        // sin escape por barra invertida
  return ALLOWED_RETURN_PATTERNS.some((r) => r.test(next)) ? next : '/'
}
```

**Repositorio con ámbito de cuenta obligatorio** — el compilador previene el IDOR:

```
findById(accountId: AccountId, orderId: OrderId): Promise<Order | null>
// no existe findById(orderId)
```

**Detección de reutilización de refresh** — cada refresh pertenece a una familia; usar uno
ya consumido revoca la familia entera y obliga a reautenticar.

**Cambio de cuenta activa** — es un cambio de contexto completo: carrito, precios y
permisos se recargan. La sesión se reemite con la nueva `activeAccountId`.

## Antipatrones

- **JWT sin caducidad o de días**: imposible de revocar.
- **Rol en el token como única autorización**: el token queda obsoleto al cambiar permisos.
- **Autorización en el middleware de Next como único control**: es una comodidad de UX; el
  control está en la API.
- **Sesión en `localStorage` "porque es más fácil"**.
- **Un permiso por pantalla** en vez de por operación.
- **Contraseñas con MD5, SHA o bcrypt con coste bajo.**

## Ejemplos

**Bien**

```
@Get(':orderId')
@RequirePermission('order:read')
async getOrder(@Param('orderId') orderId: string, @Session() s: SessionData) {
  const order = await this.orders.findById(s.accountId, OrderId(orderId))
  if (!order) throw new NotFoundError()      // 404, no 403: no confirma existencia
  return toOrderResponse(order)
}
```

**Mal**

```
@Get(':orderId')
async getOrder(@Param('orderId') id: string, @Query('accountId') accountId: string) {
  return this.prisma.order.findUnique({ where: { id } })   // cualquiera lee cualquier orden
}
```

## Convenciones

- Cookies: `__Host-eusse_at` (access), `__Host-eusse_rt` (refresh), `__Host-eusse_intent`.
- Permisos: `<recurso>:<acción>` — `order:create`, `account:manage-users`.
- Roles de cuenta: `OWNER` `ADMIN` `BUYER` `APPROVER` `VIEWER`.
- 404 (no 403) cuando el recurso existe pero no es de la cuenta.
- Toda operación sensible se audita con actor, acción, recurso y momento.

## Checklist

- [ ] Argon2id con parámetros documentados
- [ ] Cookies con todos los atributos de seguridad
- [ ] Refresh rotatorio con detección de reutilización
- [ ] Logout invalida la sesión en el servidor
- [ ] Rate limiting en login, registro y recuperación
- [ ] Respuestas uniformes e insensibles al tiempo
- [ ] Permisos evaluados en servidor sobre el recurso concreto
- [ ] `accountId` siempre desde la sesión
- [ ] Test de IDOR por cada endpoint privado
- [ ] `next` validado contra allowlist, con corpus de payloads en CI
- [ ] Intención firmada, httpOnly, un solo uso, TTL 30 min
- [ ] **Intención revalidada con la cuenta real antes de aplicarse**
- [ ] Cambio de cuenta recarga carrito, precios y permisos
- [ ] Sin datos sensibles en logs ni en URLs

## Plantillas

[`rfcs/RFC-0003-identity-and-access.md`](../rfcs/RFC-0003-identity-and-access.md) ·
[`rfcs/RFC-0004-guest-intent-auth-return.md`](../rfcs/RFC-0004-guest-intent-auth-return.md) ·
[`checklists/security.md`](../checklists/security.md)
