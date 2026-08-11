# ADR-0020 — Contenedores en PaaS gestionado, sin Kubernetes

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** DevOps + Arquitecto · **RFC** RFC-0015 |
| ------ | ------------------------------------------------------------------------------------ |

## Contexto

Cuatro procesos que desplegar (`web`, `admin`, `api`, `workers`) más PostgreSQL y Redis
gestionados. Equipo de tres personas, **sin nadie de guardia con experiencia en
Kubernetes**. Volumen esperado del año 1: ~120 peticiones/s en pico.

Elegir Kubernetes aquí sería elegir un problema de operación que no tenemos, a cambio de
una flexibilidad que no vamos a usar.

## Decisión

**Contenedores Docker desplegados en un PaaS gestionado** (Vercel para las apps Next.js;
un PaaS de contenedores para `api` y `workers`). PostgreSQL y Redis **gestionados**, no
autoalojados.

- Imágenes multi-etapa, sin usuario root, con health checks y apagado ordenado.
- Etiquetadas con el SHA del commit; nunca `latest`.
- Entornos: `local` → `preview` (automático por PR) → `staging` → `production`.
- **Las migraciones se despliegan antes que el código** que las usa.
- **Reversión al despliegue anterior en menos de 5 minutos, ensayada.**

## Alternativas descartadas

| Alternativa                     | Por qué se descarta                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Kubernetes                      | Coste operativo enorme sin equipo que lo opere de guardia; resuelve problemas de escala que no tenemos |
| Servidores propios (VPS a mano) | Configuración manual irreproducible; copias de seguridad y parcheo a cargo del equipo                  |
| Serverless por función          | Arranques en frío, gestión de conexiones a base de datos y el dominio troceado por la infraestructura  |
| PostgreSQL y Redis autoalojados | Copias de seguridad, réplicas, parcheo y guardia — trabajo que no aporta valor al producto             |

## Consecuencias

**Positivas** — cero tiempo dedicado a operar infraestructura · entornos de preview
automáticos por PR · copias de seguridad, parcheo y alta disponibilidad de la base de datos
incluidos · escalado horizontal con un ajuste de configuración.

**Negativas** — coste por unidad mayor que gestionarlo uno mismo (compensa de sobra frente
al coste de una persona operándolo) · menos control fino sobre el runtime · dependencia del
proveedor (mitigado: contenedores estándar, migrables a cualquier sitio).

**Neutras** — obliga a que las aplicaciones sean sin estado, que es correcto de todas formas.

## Criterio de revisión

Se evalúa Kubernetes cuando **se cumplan las tres**: el coste del PaaS supere claramente el
de operar por cuenta propia · exista personal con experiencia y disponibilidad de guardia ·
haya una necesidad real de orquestación que el PaaS no cubra.

Ninguna de las tres se cumple hoy ni se prevé en la Fase 1.

## Enlaces

[RFC-0015](../rfcs/RFC-0015-observability-and-quality.md) · [`skills/devops.md`](../skills/devops.md) ·
[`docs/09-scalability.md`](../docs/09-scalability.md) §5
