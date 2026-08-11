# RFC-0012 — Contratos de API y versionado

| Campo             | Valor                                                   |
| ----------------- | ------------------------------------------------------- |
| **Estado**        | Aprobado · **Autor** Arquitecto · **Creado** 2026-08-06 |
| **Revisores**     | Backend · Frontend · Testing · Documentación            |
| **ADR generados** | ADR-0009                                                |
| **Bloque**        | A (A7) · Sprint 0                                       |

---

## 1. Problema

Backend y frontend deben avanzar en paralelo sin bloquearse y sin que sus definiciones
diverjan. Si los tipos se escriben dos veces, divergen en la primera semana de prisa, y el
bug aparece en producción.

Además, la app móvil de Fase 4 consumirá la misma API: los contratos deben ser neutrales,
sin depender de NestJS ni de React.

## 2. Objetivos y no-objetivos

**Objetivos:** una sola fuente de verdad para tipos, validación, documentación y cliente ·
trabajo paralelo tras aprobar el contrato · errores legibles por máquina · versionado
explícito · paginación e idempotencia uniformes.

**No-objetivos:** GraphQL · gRPC · API pública para terceros (F4) · generación automática de
UI desde el esquema.

## 3. Alternativas consideradas

| Alternativa                                            | Descarte                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| A. OpenAPI escrito a mano + generador de tipos         | El esquema se desincroniza del código; nadie lo actualiza                                                                |
| B. Decoradores de NestJS como fuente                   | Ata el contrato al framework del backend; el frontend y el móvil no lo pueden importar                                   |
| C. tRPC                                                | Excelente para monorepo TypeScript, pero acopla cliente y servidor y complica la app móvil y cualquier consumidor futuro |
| **D. Zod en `@eusse/contracts` como fuente de verdad** | **Elegida.** Neutral, genera tipos, validación y OpenAPI; importable desde cualquier consumidor                          |

## 4. Diseño

### 4.1 Un esquema, cuatro usos

```
packages/contracts/src/cart/add-item.contract.ts
        │
        ├─→ tipos TypeScript      (z.infer)
        ├─→ validación en NestJS  (schema.parse en la frontera)
        ├─→ OpenAPI               (generado en build)
        └─→ @eusse/sdk            (cliente tipado + hooks)
```

`@eusse/contracts` **no importa NestJS, React ni Prisma**. Es el único punto de encuentro y
debe ser neutral.

### 4.2 Convenciones

- Rutas `kebab-case` plural: `/api/v1/price-lists`.
- Cuerpos y respuestas en `camelCase`.
- Versión en la URL: `/api/v1/`.
- Fechas ISO-8601 UTC.
- Dinero: `{ amount: number (entero, menor unidad), currency: string }`.
- Filtros como parámetros tipados, nunca un blob.

### 4.3 Paginación por cursor

```
GET /api/v1/orders?cursor=eyJ...&limit=20
→ { "items": [...], "nextCursor": "eyJ..." | null, "totalCount": 1234? }
```

`totalCount` sólo si es barato de calcular. El offset queda prohibido: es inestable ante
inserciones y su coste crece con la página.

### 4.4 Errores — _problem+json_ con código estable

```json
{
  "type": "https://api.eusse.world/errors/cart-qty-not-multiple",
  "title": "Cantidad no válida",
  "status": 422,
  "code": "CART_QTY_NOT_MULTIPLE",
  "detail": "TAL-500 se vende en cajas de 6 unidades",
  "instance": "/api/v1/cart/items",
  "correlationId": "req-abc123",
  "meta": { "sku": "TAL-500", "requested": 7, "qtyIncrement": 6, "suggested": 12 }
}
```

**El frontend reacciona al `code` y usa `meta`. Nunca analiza `detail`.** Eso permite
mejorar la redacción y traducir sin romper nada.

Catálogo completo de códigos: [`docs/02-domain-model.md`](../docs/02-domain-model.md) §6.

### 4.5 Idempotencia

Toda mutación que cree o cobre algo acepta `Idempotency-Key`. Misma clave + mismo payload
→ misma respuesta. Misma clave + payload distinto → `409 COMMON_IDEMPOTENCY_CONFLICT`.

### 4.6 Versionado

| Cambio                               | Compatible | Acción                                          |
| ------------------------------------ | ---------- | ----------------------------------------------- |
| Añadir campo opcional a la respuesta | Sí         | Mismo `v1`                                      |
| Añadir parámetro opcional            | Sí         | Mismo `v1`                                      |
| Añadir código de error nuevo         | Sí         | Mismo `v1` (el cliente tiene fallback genérico) |
| Quitar o renombrar campo             | **No**     | `v2`                                            |
| Cambiar el tipo de un campo          | **No**     | `v2`                                            |
| Hacer obligatorio un parámetro       | **No**     | `v2`                                            |
| Cambiar semántica sin cambiar forma  | **No**     | `v2`                                            |

Al publicar `v2`, `v1` se mantiene al menos 6 meses, con fecha de retirada anunciada en la
respuesta (`Deprecation` y `Sunset`).

### 4.7 Contract tests

Se escriben **antes** de implementar, en rojo, y verifican tres cosas:
el handler acepta lo que el esquema declara · devuelve lo que el esquema declara · el SDK
tipa exactamente eso.

## 5. Impacto

Base de toda comunicación cliente-servidor. Bloquea todo el desarrollo de features.
Un cambio de contrato exige actualizar consumidores y tests en el mismo PR.

## 6. Riesgos

| Riesgo                                     | Prob. | Impacto | Mitigación                                                         |
| ------------------------------------------ | ----- | ------- | ------------------------------------------------------------------ |
| Tipos escritos a mano en paralelo          | Media | Alto    | Lint que prohíbe declarar tipos de API fuera de `@eusse/contracts` |
| Cambio rompedor sin subir versión          | Media | Alto    | Contract tests + revisión obligatoria de cambios en `contracts`    |
| `@eusse/contracts` acoplado a un framework | Baja  | Alto    | Regla de frontera en CI                                            |
| Frontend que analiza mensajes de error     | Media | Medio   | Revisión de código; los mensajes son localizables y cambian        |

## 7. Criterios de aceptación

```gherkin
Escenario: El contrato es la única fuente de verdad
  Cuando se modifica un esquema Zod en @eusse/contracts
  Entonces fallan los contract tests del backend y el typecheck del frontend
  Hasta que ambos se actualicen

Escenario: Contracts es neutral
  Cuando se analizan los imports de packages/contracts
  Entonces ninguno proviene de @nestjs/*, react ni @prisma/client

Escenario: Errores legibles por máquina
  Cuando una operación falla por una regla de negocio
  Entonces la respuesta incluye un code estable y un meta con los datos necesarios
  Y el frontend puede construir el mensaje sin analizar prosa

Escenario: Idempotencia uniforme
  Cuando se repite una mutación con la misma Idempotency-Key y el mismo payload
  Entonces se devuelve la misma respuesta sin efectos adicionales
```

## 8. Plan de implementación

A7 del Bloque A. Cada RFC de feature añade sus contratos **antes** de su implementación.

## 9. Preparación para fases futuras

**Hueco:** los contratos son neutrales → la app móvil de F4 los importa sin cambios ·
el versionado por URL permite publicar una API para terceros sin rediseñar.
**No se construye:** API pública, portal de desarrolladores, claves de API.

## 10. Preguntas abiertas

Ninguna bloqueante.

## 11. Enlaces

[ADR-0009](../adrs/ADR-0009-zod-contracts.md) · [`skills/api-contracts.md`](../skills/api-contracts.md) ·
[`docs/02-domain-model.md`](../docs/02-domain-model.md) §6
