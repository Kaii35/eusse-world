# 03 — Convenciones

**Dueño:** Arquitecto · **Última revisión:** 2026-08-06 · **Estado:** Vigente

Reglas mecánicas. No se discuten en PR: se aplican o se cambia este documento por RFC.

---

## 1. Idioma

| Qué                                                         | Idioma                                          |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Documentación, RFC, ADR, comentarios de diseño              | **Español**                                     |
| Código, identificadores, tipos, funciones, tablas, columnas | **Inglés**                                      |
| Nombres de archivo y carpetas                               | **Inglés**                                      |
| Ramas y mensajes de commit                                  | **Inglés**                                      |
| Textos de interfaz                                          | **Ninguno en el código** — todo vía `next-intl` |
| Mensajes de error de dominio                                | Código en inglés, texto localizado              |

Motivo: el equipo piensa en español, el ecosistema está en inglés. Mezclar dentro del
código produce `getUsuarioById` y `precioTotal: number`, que envejecen mal.

---

## 2. Nombres de archivo

| Tipo                 | Convención                   | Ejemplo                             |
| -------------------- | ---------------------------- | ----------------------------------- |
| Componente React     | `PascalCase.tsx`             | `ProductCard.tsx`                   |
| Hook                 | `use-kebab-case.ts`          | `use-cart.ts`                       |
| Utilidad / módulo TS | `kebab-case.ts`              | `format-money.ts`                   |
| Tipo / contrato Zod  | `kebab-case.contract.ts`     | `cart.contract.ts`                  |
| Caso de uso          | `kebab-case.use-case.ts`     | `add-item-to-cart.use-case.ts`      |
| Entidad de dominio   | `kebab-case.entity.ts`       | `order.entity.ts`                   |
| Value object         | `kebab-case.vo.ts`           | `money.vo.ts`                       |
| Evento               | `kebab-case.event.ts`        | `order-placed.event.ts`             |
| Puerto               | `kebab-case.port.ts`         | `price-list.port.ts`                |
| Repositorio (impl.)  | `prisma-<agg>.repository.ts` | `prisma-order.repository.ts`        |
| Test unitario        | `<archivo>.spec.ts`          | `add-item-to-cart.use-case.spec.ts` |
| Test E2E             | `<flujo>.e2e.ts`             | `guest-add-to-cart.e2e.ts`          |
| Carpeta              | `kebab-case`                 | `price-lists/`                      |

**Sin `index.ts` de re-export dentro de una app.** Sólo el `src/index.ts` público de cada
paquete. Los barrels internos rompen tree-shaking y ocultan dependencias.

---

## 3. Nombres en código

| Elemento                    | Convención                       | Ejemplo                       |
| --------------------------- | -------------------------------- | ----------------------------- |
| Tipo, interfaz, clase, enum | `PascalCase`                     | `CartLine`, `OrderStatus`     |
| Variable, función, método   | `camelCase`                      | `calculateLineTotal`          |
| Constante de módulo         | `SCREAMING_SNAKE_CASE`           | `MAX_CART_LINES`              |
| Booleano                    | `is/has/can/should` + adjetivo   | `isApproved`, `canCheckout`   |
| Handler de evento (props)   | `on` + evento                    | `onAddToCart`                 |
| Handler (implementación)    | `handle` + evento                | `handleAddToCart`             |
| Caso de uso (comando)       | Verbo imperativo + `UseCase`     | `AddItemToCartUseCase`        |
| Caso de uso (consulta)      | `Get`/`List`/`Search` + `Query`  | `ListOrdersQuery`             |
| Evento de dominio           | Sustantivo + verbo en **pasado** | `OrderPlaced`, `PriceChanged` |
| Puerto                      | Sustantivo + `Port`              | `PricingPort`                 |

**Prohibido:** sufijos `Manager`, `Helper`, `Util`, `Service` genérico, `Data`, `Info`.
Si no sabes cómo llamarlo, el diseño está mal, no el nombre.

**No abreviar.** `qty` y `sku` son del lenguaje ubicuo y se permiten. `prd`, `usr`, `calc`
no.

---

## 4. TypeScript

```jsonc
// Base heredada por todo el repo desde @eusse/config-typescript
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "verbatimModuleSyntax": true,
  "isolatedModules": true,
}
```

- **`any` prohibido.** Usa `unknown` y estrecha. Excepción: `// @ts-expect-error` con
  motivo y enlace a issue.
- **Sin aserciones `as`** salvo tras validación Zod o en tests.
- **Sin enums de TypeScript.** Usa `as const` + `type X = (typeof X)[keyof typeof X]`.
- **Tipos derivados de Zod**, no escritos a mano: `type Cart = z.infer<typeof cartSchema>`.
- **`import type`** para importaciones sólo de tipo.
- Toda función exportada de un paquete lleva tipo de retorno explícito.

---

## 5. Dinero, fechas e IDs

**Dinero**

```ts
// Contrato de API y dominio
type Money = { amount: number; currency: string } // amount = entero en menor unidad (centavos)
```

- Base de datos: `numeric(18,4)` + columna `currency char(3)`.
- **Nunca `float`, nunca `number` suelto para un importe.**
- El redondeo ocurre una sola vez, al final, con regla explícita (`HALF_UP`).
- Sumar `Money` de monedas distintas lanza error de dominio.

**Fechas**

- Persistencia y transporte: **UTC ISO-8601** (`2026-08-06T14:30:00.000Z`).
- La zona horaria se aplica sólo al formatear en la UI.
- Nombres: `createdAt`, `updatedAt`, `placedAt`, `expiresAt` — siempre `<verbo>At`.

**IDs**

- **UUID v7** para todo identificador. Ordenable en el tiempo, sin colisiones, sin filtrar
  volumen de negocio (a diferencia de los autoincrementales).
- Los identificadores visibles al usuario son distintos: `orderNumber` = `EW-2026-000123`.
- IDs tipados por marca: `type OrderId = Brand<string, 'OrderId'>`. Un `AccountId` no se
  puede pasar donde va un `UserId`.

---

## 6. Git

**Ramas**

```
main                    protegida, siempre desplegable
feat/<scope>-<slug>     feat/cart-add-item
fix/<scope>-<slug>      fix/checkout-double-submit
docs/<slug>             docs/rfc-0006-pricing
chore/<slug>            chore/upgrade-prisma
refactor/<scope>-<slug>
```

**Commits — Conventional Commits, obligatorio (validado por hook)**

```
<type>(<scope>): <descripción en inglés, imperativo, minúscula, sin punto>

[cuerpo opcional: por qué, no qué]

[Refs: RFC-0006, ADR-0009]
```

`type`: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
`scope`: `web` `admin` `api` `workers` `ui` `tokens` `contracts` `sdk` `auth` `cart`
`catalog` `checkout` `orders` `pricing` `identity` `infra` `docs`

```
feat(cart): add quantity increment validation

Los SKUs mayoristas se venden por múltiplos de caja. Rechazar en dominio
evita que el back-office reciba pedidos imposibles de despachar.

Refs: RFC-0006
```

**Pull Requests**

- Máximo ~400 líneas de diff productivo. Más grande = se divide.
- Título con el mismo formato del commit.
- Plantilla obligatoria: [`templates/pull-request.md`](../templates/pull-request.md).
- Enlaza su RFC y su checklist. Sin RFC referenciado, un PR de feature no se revisa.
- Merge por **squash**. El historial de `main` es una historia legible de features.

---

## 7. Imports y fronteras

Orden (autofix por ESLint):

```ts
// 1. Node / externos
import { z } from 'zod'
// 2. Paquetes del workspace
import { Button } from '@eusse/ui'
import { cartSchema } from '@eusse/contracts'
// 3. Alias internos de la app
import { useCart } from '@/features/cart/hooks/use-cart'
// 4. Relativos
import { CartLineRow } from './cart-line-row'
// 5. Sólo tipo
import type { CartLine } from '@eusse/domain'
```

**Fronteras verificadas en CI** (`eslint-plugin-boundaries`):

| Desde                   | Puede importar                  | Nunca                               |
| ----------------------- | ------------------------------- | ----------------------------------- |
| `api/**/domain`         | sólo `domain` y `@eusse/domain` | NestJS, Prisma, otro módulo         |
| `api/**/application`    | su `domain`, puertos            | Prisma, `infrastructure` concreta   |
| `api/**/infrastructure` | su `domain`, librerías          | otro módulo                         |
| `api/**/interface`      | su `application`                | `domain` de otro módulo             |
| `packages/ui`           | `@eusse/tokens`, Radix, React   | `@eusse/domain`, `@eusse/sdk`, apps |
| `apps/*/features/a`     | `packages/*`, `lib`             | `features/b`                        |

Los features no se importan entre sí. Lo compartido sube a `components/` o a un paquete.

---

## 8. React y Next.js

- Un componente por archivo. Export nombrado, no `default` (excepto `page.tsx`,
  `layout.tsx` y demás archivos especiales de Next).
- Props tipadas con `type`, nunca `React.FC`.
- `"use client"` sólo en el archivo que lo necesita.
- Sin `useEffect` para obtener datos. Datos = servidor o TanStack Query.
- Sin lógica de negocio en componentes. Un componente decide **cómo se ve**, no **qué es
  verdad**.
- Claves de lista: ID estable. `index` está prohibido en listas mutables.
- Estados obligatorios en toda vista con datos: `loading` · `empty` · `error` · `success`.
  Una vista sin estado vacío diseñado se rechaza en revisión.

---

## 9. Tailwind v4 y estilos

- Tokens en CSS (`@theme`) provistos por `@eusse/tokens`. Ver [ADR-0010](../adrs/ADR-0010-tailwind-v4-tokens.md).
- **Prohibidos los valores mágicos**: nada de `text-[#1a2b3c]` ni `p-[13px]`. Si falta un
  token, se añade al design system.
- Orden de clases automático (`prettier-plugin-tailwindcss`).
- Variantes de componente con CVA, no con condicionales de strings.
- Dark mode con `class`, no con media query: el usuario puede elegir.
- Sin CSS-in-JS en runtime.

---

## 10. API

- Rutas en `kebab-case` plural: `/api/v1/price-lists`.
- Cuerpos y respuestas en `camelCase`.
- Verbos HTTP con su semántica; sin `POST /getOrders`.
- Paginación por cursor: `?cursor=<opaco>&limit=20` → `{ items, nextCursor }`.
- Filtros como parámetros explícitos y tipados, no un blob de query.
- Toda mutación acepta `Idempotency-Key`.
- Errores en formato _problem+json_ con `code` estable.

---

## 11. Base de datos

- Tablas `snake_case` plural: `order_lines`. Columnas `snake_case`.
- Un esquema PostgreSQL por contexto acotado.
- Toda tabla: `id uuid pk`, `created_at`, `updated_at`. Las de negocio, además `tenant_id`.
- Borrado lógico (`deleted_at`) sólo donde el negocio lo exige; por defecto, borrado real.
- Sin FK entre esquemas de contextos distintos.
- Todo índice tiene un motivo escrito en la migración.
- Migraciones: expand → migrate → contract. Ver [`checklists/database-migration.md`](../checklists/database-migration.md).

---

## 12. Testing

| Nivel       | Herramienta              | Qué prueba                                        | Dónde               |
| ----------- | ------------------------ | ------------------------------------------------- | ------------------- |
| Unitario    | Vitest                   | Dominio puro: invariantes, cálculos, transiciones | junto al archivo    |
| Integración | Vitest + Testcontainers  | Casos de uso con PostgreSQL y Redis reales        | `test/integration/` |
| Contrato    | Vitest                   | Handler ⟷ esquema Zod ⟷ SDK                       | `test/contract/`    |
| Componente  | Vitest + Testing Library | Comportamiento accesible                          | junto al componente |
| E2E         | Playwright               | Recorridos críticos de usuario                    | `e2e/`              |
| Visual      | Playwright snapshots     | Regresión del design system                       | `e2e/visual/`       |

- Nombre del test: `debería <comportamiento esperado> cuando <condición>`.
- Se consulta por rol accesible (`getByRole`), nunca por clase CSS ni `data-testid`
  arbitrario.
- **Cobertura mínima: 90% en `domain/`, 80% en `application/`.** El resto no tiene umbral;
  tiene criterio.
- Sin mocks del módulo bajo prueba. Se mockea la frontera, no el interior.

---

## 13. Comentarios

- El código explica **qué**. El comentario explica **por qué**.
- Prohibido comentar lo obvio.
- `TODO` sólo con dueño e issue: `// TODO(david, #142): …`.
- Toda regla de negocio no evidente enlaza su RFC: `// Regla PRC-04 — ver RFC-0006`.
- JSDoc obligatorio en la API pública de cada paquete.

---

## 14. Accesibilidad (mínimo no negociable)

- WCAG 2.2 AA.
- HTML semántico antes que `div` + ARIA.
- Todo lo operable con ratón es operable con teclado. Foco siempre visible.
- Contraste ≥ 4.5:1 texto normal, ≥ 3:1 texto grande y elementos de UI.
- Toda animación respeta `prefers-reduced-motion`.
- Todo campo de formulario tiene `<label>` asociado; el error se anuncia con `aria-live`.

Detalle: [`skills/accessibility.md`](../skills/accessibility.md) y
[`checklists/accessibility.md`](../checklists/accessibility.md).

---

## 15. Variables de entorno

- Validadas con Zod al arrancar. Si falta una, **el proceso no arranca**. Sin valores por
  defecto silenciosos en producción.
- Prefijo `NEXT_PUBLIC_` **sólo** para lo que puede ser público. Un secreto con ese prefijo
  es un incidente de seguridad.
- `.env.example` siempre actualizado, con comentario por variable. Sin valores reales.
- Los secretos nunca se commitean. Nunca.
