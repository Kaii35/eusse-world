# Contrato — <Nombre de la operación>

| Campo             | Valor                                                     |
| ----------------- | --------------------------------------------------------- |
| **Método y ruta** | `POST /api/v1/<recurso>`                                  |
| **RFC**           | RFC-XXXX                                                  |
| **Contexto**      |                                                           |
| **Archivo**       | `packages/contracts/src/<contexto>/<recurso>.contract.ts` |

## Propósito

Qué hace, en una frase de negocio.

## Autorización

| Requisito               | Valor                        |
| ----------------------- | ---------------------------- |
| Sesión                  | Requerida / No requerida     |
| Permiso                 | `<recurso>:<acción>`         |
| Ámbito                  | `accountId` **de la sesión** |
| Comprobación de recurso | Sí / No aplica               |

## Cabeceras

| Cabecera          | Obligatoria | Nota                                  |
| ----------------- | ----------- | ------------------------------------- |
| `Idempotency-Key` | Sí / No     | UUID generado al montar el formulario |
| `Accept-Language` | No          | Locale para mensajes                  |

## Entrada

```ts
export const <operacion>Request = z.object({
  // …
})
```

| Campo | Tipo | Obligatorio | Reglas |
| ----- | ---- | ----------- | ------ |
|       |      |             |        |

## Salida (éxito)

```ts
export const <operacion>Response = z.object({
  // …
})
```

**Código HTTP:** 200 · 201 · 202 · 204

## Errores

| Código de dominio | HTTP | Cuándo | `meta` |
| ----------------- | ---- | ------ | ------ |
|                   |      |        |        |

Formato de error: _problem+json_ con `code` estable. El frontend reacciona al `code`,
**nunca** a `detail`.

## Caché

| Cabecera        | Valor |
| --------------- | ----- |
| `Cache-Control` |       |
| `Vary`          |       |

> Toda respuesta con precio de cuenta o datos privados: `private, no-store` + `Vary: Cookie`.

## Paginación (si aplica)

Por cursor: `?cursor=<opaco>&limit=20` → `{ items, nextCursor, totalCount? }`.

## Idempotencia (si aplica)

Misma clave + mismo payload → misma respuesta, sin efectos.
Misma clave + payload distinto → `409 COMMON_IDEMPOTENCY_CONFLICT`.

## Eventos que dispara

| Evento | Cuándo |
| ------ | ------ |
|        |        |

## Ejemplos

**Petición**

```http
POST /api/v1/cart/items
Idempotency-Key: 01924f8a-...
Content-Type: application/json

{ "sku": "TAL-500", "quantity": 12 }
```

**Respuesta correcta**

```json
{}
```

**Respuesta de error**

```json
{
  "code": "CART_QTY_NOT_MULTIPLE",
  "status": 422,
  "detail": "…",
  "meta": {}
}
```

## Contract tests

- [ ] Acepta todo lo que el esquema declara válido
- [ ] Rechaza lo que el esquema declara inválido
- [ ] La respuesta cumple el esquema
- [ ] Cada error documentado se produce en su condición
- [ ] `@eusse/sdk` tipa exactamente esto
- [ ] Test de IDOR si devuelve datos privados
