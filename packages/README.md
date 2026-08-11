# packages/

Librerías compartidas del monorepo. El grafo de dependencias es **normativo** y se verifica
en CI: ver [`docs/07-module-dependencies.md`](../docs/07-module-dependencies.md).

> Estas carpetas están vacías. El código se crea en el **Sprint 0**.

| Paquete                                   | Contenido                                                        | Depende de    | Paso |
| ----------------------------------------- | ---------------------------------------------------------------- | ------------- | ---- |
| [`utils`](utils/)                         | Helpers puros: fechas, strings, `Result`, invariantes            | —             | A2   |
| [`tokens`](tokens/)                       | Tokens de diseño, `@theme` de Tailwind v4, light/dark            | —             | A8   |
| [`domain`](domain/)                       | Tipos, enums, estados y reglas puras compartidas                 | utils         | A7   |
| [`contracts`](contracts/)                 | Esquemas Zod, tipos de API, errores, generación de OpenAPI       | domain, utils | A7   |
| [`ui`](ui/)                               | Design system: primitivos, patrones, Storybook                   | tokens, utils | A9   |
| [`sdk`](sdk/)                             | Cliente HTTP tipado + hooks de TanStack Query (subpath opcional) | contracts     | B1   |
| [`auth`](auth/)                           | Sesión cliente/servidor, guards, helpers de permisos             | contracts     | B7   |
| [`i18n`](i18n/)                           | Configuración de next-intl, formateadores                        | —             | A10  |
| [`analytics`](analytics/)                 | Puerto de eventos de producto, proveedores, consentimiento       | utils         | C6   |
| [`observability`](observability/)         | Logger, tracing, métricas, `correlationId`                       | utils         | A5   |
| [`testing`](testing/)                     | Setup de Vitest, Testcontainers, fábricas, matchers              | —             | A14  |
| [`config-typescript`](config-typescript/) | `tsconfig` base, next, nest, react, library                      | —             | A2   |
| [`config-eslint`](config-eslint/)         | Reglas base, react, next, nest, **boundaries**                   | —             | A2   |
| [`config-tailwind`](config-tailwind/)     | Preset de Tailwind v4                                            | tokens        | A2   |

## Reglas duras (verificadas en CI)

| Regla                                              | Motivo                                     |
| -------------------------------------------------- | ------------------------------------------ |
| `ui` **no** importa `domain`, `sdk` ni `contracts` | Un botón no sabe qué es una orden          |
| `contracts` **no** importa NestJS, React ni Prisma | Es el punto de encuentro: debe ser neutral |
| `domain` sin dependencias de runtime salvo `utils` | Reglas puras, compartibles con móvil       |
| `sdk` sin React como dependencia dura              | Núcleo agnóstico + capa opcional de hooks  |
| `tokens` no importa nada                           | Es la hoja del grafo                       |
| Ningún paquete importa de `apps/*`                 | Un paquete no depende de sus consumidores  |
| **Cero ciclos**                                    | `dependency-cruiser` rompe el build        |

## Publicación

Versionado con Changesets ([ADR-0019](../adrs/ADR-0019-versioning-releases.md)). Todo cambio
publicable lleva su changeset; los cambios rompedores, además, guía de migración.

Cada paquete tiene un README que dice **qué es, cuándo usarlo y cuándo NO usarlo**. Lo
último es lo que evita la deriva.
