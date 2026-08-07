# Agentes

30 agentes especializados. Cada uno es un **contrato de trabajo**: define qué hace, qué
puede tocar, qué recibe, qué entrega y cuándo ha terminado.

## Cómo se usa un agente

1. Lee `agents/<tu-agente>.md` — quién eres y cuáles son tus límites.
2. Lee la skill que el agente indica en §Contexto — cómo se hace bien aquí.
3. Lee el RFC de la tarea — qué construyes ahora.
4. Trabaja. Ante ambigüedad, **emite un BLOQUEO** ([`docs/10-ai-strategy.md`](../docs/10-ai-strategy.md) §4.2).
5. Verifica tu checklist y entrega en el formato ENTREGA (§4.3).

**Ningún agente lee el repositorio entero.** Ese es el punto.

## Estructura de todo agente

`Responsabilidad` · `Contexto` · `Herramientas` · `Restricciones` · `Entradas` ·
`Salidas` · `Checklist` · `Definition of Done` · `Dependencias`

## Catálogo

### Dirección y diseño (producen documentos, no código)

| # | Agente | Responsabilidad en una línea |
| - | ------ | ---------------------------- |
| 01 | [architect](01-architect.md) | Decide la estructura del sistema y arbitra los trade-offs |
| 05 | [ux](05-ux.md) | Diseña flujos, estados y el comportamiento del producto |
| 28 | [functional-analyst](28-functional-analyst.md) | Convierte necesidad de negocio en casos de uso sin ambigüedad |
| 29 | [product-owner](29-product-owner.md) | Decide qué se construye, en qué orden y por qué |

### Implementación

| # | Agente | Responsabilidad |
| - | ------ | --------------- |
| 02 | [backend](02-backend.md) | Dominio, casos de uso, infraestructura y API en NestJS |
| 03 | [frontend](03-frontend.md) | Aplicaciones Next.js: rutas, datos, estado, integración |
| 04 | [ui](04-ui.md) | Traduce diseño a componentes accesibles y animados |
| 06 | [design-system](06-design-system.md) | Tokens y primitivos de `@eusse/ui` |
| 07 | [auth](07-auth.md) | Identidad, sesión, permisos y el flujo de retorno post-login |
| 08 | [ecommerce](08-ecommerce.md) | Reglas comerciales B2B: precios, escalas, condiciones |
| 09 | [products](09-products.md) | Modelo de producto, variantes, atributos y medios |
| 10 | [catalog](10-catalog.md) | Búsqueda, facetas, listados y rendimiento del catálogo |
| 11 | [cart](11-cart.md) | Carrito de cuenta, invariantes y congelado de precio |
| 12 | [checkout](12-checkout.md) | Proceso de compra, aprobación, órdenes e idempotencia |
| 13 | [client-dashboard](13-client-dashboard.md) | Portal de cliente y recompra |
| 14 | [admin-dashboard](14-admin-dashboard.md) | Back-office y operación del negocio |
| 15 | [chat](15-chat.md) | Mensajería con contexto de cuenta [F3] |
| 16 | [payments](16-payments.md) | Pagos, crédito y conciliación |
| 17 | [tracking](17-tracking.md) | Envíos, estados logísticos y trazabilidad |
| 18 | [database](18-database.md) | Esquema, migraciones, índices y rendimiento de datos |

### Plataforma y calidad

| # | Agente | Responsabilidad |
| - | ------ | --------------- |
| 19 | [devops](19-devops.md) | Monorepo, CI/CD, entornos, contenedores, observabilidad |
| 20 | [testing](20-testing.md) | Estrategia y automatización de pruebas |
| 21 | [documentation](21-documentation.md) | Que la documentación sea cierta y esté al día |
| 22 | [refactoring](22-refactoring.md) | Reduce complejidad y duplicación sin cambiar comportamiento |
| 23 | [security](23-security.md) | Amenazas, controles y auditoría |
| 24 | [performance](24-performance.md) | Presupuestos, medición y optimización |
| 25 | [accessibility](25-accessibility.md) | WCAG 2.2 AA verificado, no declarado |
| 26 | [seo](26-seo.md) | Indexabilidad, datos estructurados y contenido |
| 27 | [i18n](27-i18n.md) | Localización, formatos y paridad de idiomas |
| 30 | [qa](30-qa.md) | Verifica que lo entregado cumple lo especificado |

## Reglas comunes a todos los agentes

Estas reglas son parte del contrato de **todos**, aunque no se repitan en cada archivo:

1. No escribir código de producto sin RFC aprobado que lo cubra.
2. No tocar archivos fuera del ámbito declarado.
3. No tomar decisiones de arquitectura: emitir BLOQUEO y escalar al Arquitecto.
4. No inventar convenciones: si falta, preguntar.
5. No añadir dependencias sin ADR.
6. No desactivar tests, lint ni puertas de CI.
7. No dejar `any`, `@ts-ignore`, `TODO` sin issue ni código comentado.
8. Respetar [`docs/03-conventions.md`](../docs/03-conventions.md) sin excepciones.
9. Terminar con el formato ENTREGA.
