# ADR-0004 — `apps/web` y `apps/admin` como aplicaciones separadas

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0001, RFC-0011 |
| ------ | ------------------------------------------------------------------------------------- |

## Contexto

Dos superficies con usuarios, riesgos y necesidades opuestas:

|                          | `web`                  | `admin`                    |
| ------------------------ | ---------------------- | -------------------------- |
| Usuario                  | Visitante y comprador  | Staff de Eusse             |
| Densidad                 | Aire, marketing        | Compacta, operativa        |
| Indexación               | Sí (landing, catálogo) | Nunca                      |
| Sesión                   | 30 días                | Corta, con reautenticación |
| Bundle                   | Crítico (LCP < 2.0 s)  | Menos crítico              |
| Frecuencia de despliegue | Alta                   | Media                      |

## Decisión

Dos aplicaciones Next.js independientes, compartiendo `@eusse/ui`, `@eusse/sdk`,
`@eusse/auth` y `@eusse/contracts`.

## Alternativas descartadas

| Alternativa                                    | Por qué se descarta                                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Una sola app con grupo de rutas `(admin)`      | El código del admin viaja en el mismo despliegue que la tienda; un fallo de build del admin tumba la landing; superficies de riesgo mezcladas |
| Admin como SPA aparte con otro stack           | Dos design systems; se duplican componentes y esfuerzo                                                                                        |
| Herramienta de admin generada (Retool, Forest) | No cubre los flujos B2B propios; datos de clientes en un tercero; sin control de la auditoría                                                 |

## Consecuencias

**Positivas** — aislamiento de riesgo y de despliegue · bundles optimizados por audiencia ·
cabeceras y política de sesión distintas · el admin puede desplegarse sin tocar producción
de cara al cliente.

**Negativas** — dos configuraciones de Next que mantener · dos pipelines · el riesgo de que
la UI derive entre ambas (mitigado por `@eusse/ui` y auditoría trimestral de duplicación).

**Neutras** — obliga a que todo lo compartido esté en `packages/`, que es lo correcto.

## Criterio de revisión

Si el coste de mantener dos aplicaciones supera claramente el beneficio de aislamiento —
por ejemplo, si más del 60% del código acaba duplicado a pesar de `@eusse/ui`.

## Enlaces

[RFC-0001](../rfcs/RFC-0001-platform-architecture.md) · [RFC-0011](../rfcs/RFC-0011-admin-backoffice.md) ·
[`docs/14-repo-structure.md`](../docs/14-repo-structure.md)
