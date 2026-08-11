# Skills

Una skill responde a **"¿cómo se hace bien esto en este repositorio?"**. Es el manual del
oficio, complementario al agente (quién eres) y al RFC (qué construyes ahora).

## Estructura de toda skill

`Objetivo` · `Buenas prácticas` · `Errores comunes` · `Patrones` · `Antipatrones` ·
`Ejemplos` · `Convenciones` · `Checklist` · `Plantillas`

## Catálogo

### Arquitectura y dominio

| Skill                                              | Para                                          |
| -------------------------------------------------- | --------------------------------------------- |
| [architecture.md](architecture.md)                 | Decidir estructura, escribir RFC y ADR        |
| [domain-driven-design.md](domain-driven-design.md) | Modelar agregados, invariantes y casos de uso |
| [events-messaging.md](events-messaging.md)         | Eventos, outbox, colas e idempotencia         |

### Backend

| Skill                                    | Para                                      |
| ---------------------------------------- | ----------------------------------------- |
| [backend-nestjs.md](backend-nestjs.md)   | Módulos, capas, casos de uso, controllers |
| [database-prisma.md](database-prisma.md) | Esquema, migraciones, índices, consultas  |
| [api-contracts.md](api-contracts.md)     | Contratos Zod, versionado, errores        |

### Frontend

| Skill                                        | Para                                       |
| -------------------------------------------- | ------------------------------------------ |
| [frontend-nextjs.md](frontend-nextjs.md)     | App Router, RSC, datos, rutas              |
| [state-management.md](state-management.md)   | TanStack Query vs. Zustand vs. formularios |
| [forms-validation.md](forms-validation.md)   | React Hook Form + Zod                      |
| [ui-implementation.md](ui-implementation.md) | Construir componentes con tokens           |
| [design-system.md](design-system.md)         | Tokens y primitivos de `@eusse/ui`         |
| [motion-animation.md](motion-animation.md)   | Movimiento con Motion                      |

### Producto y dominio comercial

| Skill                                        | Para                                      |
| -------------------------------------------- | ----------------------------------------- |
| [ecommerce-b2b.md](ecommerce-b2b.md)         | Lo que hace distinto al B2B               |
| [pricing.md](pricing.md)                     | Listas, escalas, dinero, redondeo         |
| [catalog-products.md](catalog-products.md)   | Producto, variante, atributos, medios     |
| [search.md](search.md)                       | Búsqueda, facetas, relevancia             |
| [cart.md](cart.md)                           | Carrito de cuenta e intención de invitado |
| [checkout-orders.md](checkout-orders.md)     | Checkout, órdenes, idempotencia           |
| [payments.md](payments.md)                   | Pagos, crédito, webhooks                  |
| [shipping-tracking.md](shipping-tracking.md) | Envíos y trazabilidad                     |
| [dashboard.md](dashboard.md)                 | Portales y back-office                    |
| [data-tables.md](data-tables.md)             | Tablas de datos serias                    |
| [realtime.md](realtime.md)                   | Tiempo real y chat [F3]                   |

### Experiencia

| Skill                                | Para                                |
| ------------------------------------ | ----------------------------------- |
| [ux-design.md](ux-design.md)         | Flujos, estados, contenido          |
| [accessibility.md](accessibility.md) | WCAG 2.2 AA                         |
| [i18n.md](i18n.md)                   | next-intl y formatos                |
| [seo.md](seo.md)                     | Indexabilidad y datos estructurados |

### Plataforma y calidad

| Skill                                | Para                                           |
| ------------------------------------ | ---------------------------------------------- |
| [auth.md](auth.md)                   | Sesión, permisos, retorno post-login           |
| [security.md](security.md)           | Amenazas y controles                           |
| [performance.md](performance.md)     | Presupuestos y optimización                    |
| [testing.md](testing.md)             | Estrategia y automatización                    |
| [qa.md](qa.md)                       | Verificación y defectos                        |
| [devops.md](devops.md)               | Monorepo, CI/CD, entornos                      |
| [observability.md](observability.md) | Logs, trazas, métricas                         |
| [refactoring.md](refactoring.md)     | Reducir complejidad sin cambiar comportamiento |
| [documentation.md](documentation.md) | Documentación cierta                           |

### Proceso

| Skill                                            | Para                        |
| ------------------------------------------------ | --------------------------- |
| [functional-analysis.md](functional-analysis.md) | Casos de uso sin ambigüedad |
| [product-management.md](product-management.md)   | Priorización y valor        |

## Skills externas

| Skill           | Origen                                                                                          | Cuándo                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | **Obligatoria** para los agentes UI, UX y Design System antes de diseñar o construir cualquier pantalla |

Instalada en `~/.claude/skills/ui-ux-pro-max-skill`. Aporta paletas, tipografía, estilos y
guías de UX. **Ante conflicto con este repositorio, gana `@eusse/tokens` y
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md).**
