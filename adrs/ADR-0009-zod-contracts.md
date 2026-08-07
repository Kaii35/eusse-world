# ADR-0009 — Zod como fuente de verdad de los contratos

| Estado | Aceptado · **Fecha** 2026-08-06 · **Decisor** Arquitecto · **RFC** RFC-0012 |
| ------ | --- |

## Contexto

Backend y frontend deben avanzar en paralelo. Si los tipos se escriben dos veces, divergen
en la primera semana de prisa y el bug aparece en producción. Además, la app móvil de Fase 4
consumirá la misma API: los contratos deben ser neutrales.

## Decisión

Un esquema **Zod** en `@eusse/contracts` es la fuente única de verdad. De él salen:

```
esquema Zod ─┬─→ tipos TypeScript (z.infer)
             ├─→ validación en NestJS (parse en la frontera)
             ├─→ OpenAPI (generado en build)
             └─→ @eusse/sdk (cliente tipado + hooks de TanStack Query)
```

`@eusse/contracts` **no importa NestJS, React ni Prisma**. Regla verificada en CI.

**El contrato se aprueba y se mergea antes** de implementar; los contract tests se escriben
en rojo.

## Alternativas descartadas

| Alternativa | Por qué se descarta |
| ----------- | ------------------- |
| OpenAPI escrito a mano + generador | El esquema se desincroniza del código; nadie lo mantiene |
| Decoradores de NestJS como fuente | Ata el contrato al framework del backend; frontend y móvil no lo pueden importar |
| tRPC | Excelente en monorepos TypeScript, pero acopla cliente y servidor y complica cualquier consumidor no-TS |
| GraphQL | Maquinaria considerable para un consumidor principal; el problema que resuelve (sobre/infra-fetching) se resuelve con endpoints bien diseñados |
| Tipos escritos a mano | Divergen. Siempre |

## Consecuencias

**Positivas** — una sola definición · trabajo paralelo real tras aprobar el contrato ·
validación en tiempo de ejecución **y** tipos en tiempo de compilación desde la misma
fuente · un cambio incompatible rompe el build, no producción · reutilizable por la app
móvil sin cambios.

**Negativas** — Zod añade peso al bundle del cliente (mitigado importando por subruta) ·
esquemas muy complejos pueden ralentizar el chequeo de tipos de TypeScript · disciplina
necesaria: declarar un tipo de API fuera de `@eusse/contracts` debe estar prohibido por
lint.

**Neutras** — obliga a diseñar el contrato antes de codificar, que es el orden correcto.

## Criterio de revisión

Si el coste en bundle o en tiempo de compilación se vuelve medible y molesto, se evalúa
generar tipos estáticos en build y dejar Zod sólo en el servidor.

## Enlaces

[RFC-0012](../rfcs/RFC-0012-api-contracts.md) ·
[`skills/api-contracts.md`](../skills/api-contracts.md)
