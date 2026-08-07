# .claude/

Configuración de Claude Code para este repositorio.

## Estructura

```
.claude/
├── settings.json     permisos, hooks, modelo — SE EDITA A MANO
├── agents/           GENERADO desde /agents — no editar
└── skills/           GENERADO desde /skills — no editar
```

## Fuente de verdad

Las carpetas **raíz** `agents/` y `skills/` son la fuente de verdad: versionadas,
revisables en PR y legibles por cualquier herramienta, no sólo por Claude Code.

`.claude/agents/` y `.claude/skills/` se **generan** desde ellas con:

```
pnpm sync:claude
```

Especificación del script: [`scripts/README.md`](../scripts/README.md).
CI verifica que estén sincronizadas (`pnpm sync:claude --check`).

> **Nunca edites `.claude/agents` ni `.claude/skills` a mano.** Se sobrescriben.

## Punto de entrada para agentes

[`CLAUDE.md`](../CLAUDE.md) en la raíz. Contiene la regla fundamental, las prohibiciones
absolutas y el contrato de contexto mínimo.

## Skills externas

`ui-ux-pro-max` está instalada a nivel de usuario, no del repositorio
(`~/.claude/skills/ui-ux-pro-max-skill`). Es **obligatoria** para los agentes UI, UX y
Design System antes de diseñar o construir cualquier pantalla.

Ante conflicto entre esa skill y este repositorio, gana `@eusse/tokens` y
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md).
