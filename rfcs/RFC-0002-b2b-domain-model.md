# RFC-0002 — Modelo de dominio B2B

| Campo | Valor |
| ----- | ----- |
| **Estado** | Aprobado · **Autor** Arquitecto + Analista Funcional · **Creado** 2026-08-06 |
| **Revisores** | Backend · Base de Datos · Ecommerce · Product Owner |
| **ADR generados** | ADR-0006 |
| **Bloque** | A |

---

## 1. Problema

El modelo de datos de un ecommerce B2C no sirve para B2B. Si se modela "usuario compra
producto a un precio", en el tercer sprint hay que reescribir la mitad del sistema. Hay que
fijar el modelo **antes** de escribir una línea, porque es lo más caro de cambiar después.

## 2. Objetivos y no-objetivos

**Objetivos:** definir contextos acotados, agregados, invariantes y lenguaje ubicuo · fijar
que la **cuenta** es la unidad de compra · soportar precios por cuenta y por volumen ·
soportar aprobación por umbral.

**No-objetivos:** modelar CRM, Inventario ni Cursos (contextos reservados, no diseñados) ·
multi-tenant activo (columna presente, un solo tenant) · multi-moneda activa (modelo
preparado, una moneda).

## 3. Alternativas consideradas

| Alternativa | Descarte |
| ----------- | -------- |
| **A. Usuario = cliente** (modelo B2C) | Imposible: varios compradores por empresa, precios de empresa, crédito de empresa |
| **B. Cuenta con un solo usuario** | Simplifica hoy, obliga a migrar cuando la empresa añada un segundo comprador — que ocurre en el primer mes |
| **C. Cuenta ↔ Usuario N:M mediante Membership** | **Elegida.** Un usuario puede trabajar para varias empresas (asesores, grupos empresariales); una empresa tiene varios compradores con roles distintos |

## 4. Diseño

### 4.1 Contextos acotados

Fase 1: Identity · Accounts · Catalog · Pricing · Cart · Checkout · Orders · Content ·
Notifications · Search.
Reservados: Payments · Shipping · Inventory · Analytics (F2) · CRM (F3) · Courses (F4).

Mapa completo y responsabilidades: [`docs/02-domain-model.md`](../docs/02-domain-model.md) §3.

### 4.2 Agregados y sus invariantes

| Agregado | Invariantes |
| -------- | ----------- |
| `Account` | ≥ 1 miembro `OWNER` · `creditLimit` ≥ 0 · `taxId` único por tenant · sólo `ACTIVE` puede comprar |
| `User` | Email único · credencial válida o cuenta bloqueada |
| `Product` | ≥ 1 variante · slug único · una variante por combinación de atributos |
| `PriceList` | Escalas sin solape ni hueco · moneda única · vigencia coherente |
| `Cart` | Un carrito activo por cuenta · cantidad ≥ mínimo y múltiplo del incremento · sin líneas duplicadas por SKU |
| `Order` | Líneas inmutables · total = Σ líneas + impuestos + envío − descuentos · transiciones válidas |

### 4.3 Decisión central: la cuenta es la unidad de compra

```
User  ──< Membership >──  Account
                             ├── Cart (uno activo)
                             ├── PriceList (asignada)
                             ├── Address (varias)
                             ├── creditLimit / paymentTerms / minOrderAmount
                             └── Order (histórico)
```

**Consecuencias que atraviesan todo el sistema:**
1. El carrito es de la cuenta: dos compradores de la misma empresa colaboran.
2. El precio depende de la cuenta, no del usuario.
3. Toda consulta lleva `accountId` **de la sesión**. Es la defensa contra IDOR.
4. Cambiar de cuenta activa es un cambio de contexto completo.

### 4.4 Roles y permisos

| Rol | Puede |
| --- | ----- |
| `OWNER` | Todo, incluida la gestión de miembros y el cierre de la cuenta |
| `ADMIN` | Gestionar miembros, direcciones y comprar |
| `BUYER` | Comprar hasta su `approvalThreshold` |
| `APPROVER` | Comprar y aprobar pedidos de otros |
| `VIEWER` | Sólo lectura; no ve crédito ni precios de pedidos ajenos |

Permisos con formato `<recurso>:<acción>`, evaluados en servidor sobre el recurso concreto.

### 4.5 Reglas de dominio

Numeradas y con test unitario obligatorio cada una:
`PRC-01`…`PRC-06` (precio) · `CRT-01`…`CRT-05` (carrito) · `CHK-01`…`CHK-06` (checkout) ·
`IDN-01`…`IDN-04` (identidad). Enunciado completo en
[`docs/02-domain-model.md`](../docs/02-domain-model.md) §3.

### 4.6 Máquinas de estado

`Order`, `Account`, `Cart` y `Payment`: ver [`docs/02-domain-model.md`](../docs/02-domain-model.md) §4.
Toda transición no listada lanza `ORDER_INVALID_TRANSITION`.

### 4.7 Modelo de datos

Un esquema PostgreSQL por contexto. Sin FK entre contextos. UUID v7. Dinero en
`numeric(18,4)` + moneda. `timestamptz` en UTC. `tenant_id` en toda tabla de negocio.

### 4.8 Lenguaje ubicuo

[`docs/13-glossary.md`](../docs/13-glossary.md). La columna "Código" es **normativa**.
Términos prohibidos: `Client` para la empresa · `Customer` · `Item` suelto · `Price` suelto.

## 5. Impacto

Define el modelo de todos los módulos de Fase 1. Ningún módulo se implementa antes de que
este RFC esté aprobado.

## 6. Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Modelo equivocado descubierto en el Sprint 8 | Validación con el equipo comercial **antes** de aprobar, con datos reales de tres cuentas |
| Agregados demasiado grandes | `Order` no contiene `Fulfillment` ni `Payment`: son agregados propios |
| Lenguaje que deriva | Glosario normativo + revisión de nombres en cada PR |

## 7. Criterios de aceptación

```gherkin
Escenario: El carrito pertenece a la cuenta
  Dado que Ana y Luis son compradores de la cuenta "Acme"
  Cuando Ana añade TAL-500 al carrito
  Entonces Luis ve TAL-500 en su carrito

Escenario: El precio depende de la cuenta
  Dadas dos cuentas con listas de precios distintas
  Cuando ambas consultan el precio de TAL-500
  Entonces reciben precios distintos

Escenario: Una cuenta no puede quedarse sin OWNER
  Dada una cuenta con un único miembro OWNER
  Cuando se intenta eliminar ese miembro
  Entonces la operación se rechaza
```

## 8. Plan de implementación

El modelo se implementa por bloques: B (Identity, Accounts) → D (Catalog) → E (Pricing,
Cart) → F (Checkout, Orders). Cada bloque produce su `docs/domain/<contexto>.md`.

## 9. Preparación para fases futuras

`tenantId` presente desde el día 1 · `Money` con moneda desde el día 1 · contextos
reservados en el mapa · Identity admite usuarios sin cuenta B2B (para Cursos en F4).
**No se construye** ninguno de esos contextos ahora.

## 10. Preguntas abiertas

| # | Pregunta | Resuelta |
| - | -------- | -------- |
| 1 | ¿Un usuario puede pertenecer a cuentas de tenants distintos? | **No** en Fase 1. La membresía es dentro de un tenant |
| 2 | ¿El `APPROVER` puede aprobar su propio pedido? | **No.** Regla `CHK-02b`: el aprobador debe ser distinto del creador |

## 11. Enlaces

[`docs/02-domain-model.md`](../docs/02-domain-model.md) ·
[`docs/13-glossary.md`](../docs/13-glossary.md) ·
[RFC-0003](RFC-0003-identity-and-access.md) · [RFC-0006](RFC-0006-cart-and-b2b-pricing.md)
