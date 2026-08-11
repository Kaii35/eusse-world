# Skill — DevOps

## Objetivo

Que construir, probar, desplegar y revertir sea rápido, fiable y aburrido.

## Buenas prácticas

- **`main` siempre desplegable.** Trunk-based con feature flags. Sin ramas de larga vida.
- **CI rápida.** Si tarda más de 15 minutos, la gente deja de esperarla y empieza a
  saltársela.
- **`inputs` y `outputs` explícitos** en cada tarea de Turborepo. Una caché que miente es
  peor que no tener caché.
- **`--frozen-lockfile` en CI.** Siempre.
- **Migraciones antes que el código** que las usa.
- **Reversión en menos de 5 minutos, probada.** Un plan de reversión no ensayado no existe.
- **Contenedores multi-etapa, sin root, con health checks** y apagado ordenado.
- **Secretos en el gestor del entorno**, con rotación documentada.
- **Alertas por síntoma** (el usuario sufre), no por causa (CPU alta).

## Errores comunes

| Error                                      | Consecuencia                                       |
| ------------------------------------------ | -------------------------------------------------- |
| CI que tarda 40 minutos                    | Nadie la espera; se mergea a ciegas                |
| Caché de Turborepo mal configurada         | Builds que no reflejan el código                   |
| Sin `--frozen-lockfile`                    | Versiones distintas en local y en producción       |
| Desplegar código antes que la migración    | Errores de columna inexistente                     |
| Reversión no probada                       | Se descubre que no funciona durante el incidente   |
| Secretos en variables de build del cliente | Credenciales públicas                              |
| Contenedor como root                       | Escalada de privilegios                            |
| Sin health checks                          | Tráfico enrutado a instancias que aún arrancan     |
| Alertas ruidosas                           | Se ignoran, incluida la que importaba              |
| Copias de seguridad sin restaurar nunca    | Se descubre que están corruptas cuando hacen falta |

## Patrones

**Turborepo con dependencias explícitas**

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**", "dist/**"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

**CI que corre sólo lo afectado**

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm turbo lint typecheck test build --filter=...[origin/main]
```

**Despliegue en tres pasos**

```
1. Migración (expand)  — compatible con la versión actual
2. Código nuevo        — usa columnas viejas y nuevas
3. Migración (contract) — despliegue posterior
```

**Compose de desarrollo** — PostgreSQL, Redis, MailHog y MinIO. `pnpm dev` levanta todo.
Nadie debería instalar PostgreSQL a mano.

**Feature flag**

```
if (!flags.isEnabled('checkout.approvalFlow', { accountId })) return legacyFlow()
```

Lo incompleto se mergea apagado; se activa por cuenta para pruebas piloto.

**Apagado ordenado** — se deja de aceptar peticiones, se terminan las en curso, se cierran
las conexiones. Sin ello, cada despliegue corta peticiones a medias.

## Antipatrones

- **Kubernetes en Fase 1** sin nadie que lo opere de guardia.
- **Ramas `develop` y `release`**: sincronización eterna y conflictos.
- **Desplegar los viernes por la tarde** sin guardia.
- **Configuración duplicada** entre apps en vez de en `packages/config-*`.
- **`latest` como etiqueta de imagen**: irreproducible.
- **Ignorar un test inestable en CI**: se normaliza el rojo.
- **Snowflake servers**: configurados a mano, imposibles de recrear.

## Convenciones

- Entornos: `local` → `preview` (por PR) → `staging` → `production`.
- Imágenes etiquetadas con el SHA del commit, nunca `latest`.
- Configuraciones compartidas en `@eusse/config-*`.
- Secretos por entorno, sin solaparse.
- Changesets para versionar paquetes.
- Toda variable de entorno documentada en `.env.example`.

## Checklist

- [ ] `pnpm install && pnpm dev` funciona desde cero en < 5 min
- [ ] CI de un PR típico en < 10 min
- [ ] CI corre sólo lo afectado
- [ ] Todas las puertas de calidad activas y bloqueantes
- [ ] Entorno de preview automático por PR
- [ ] `--frozen-lockfile` en CI
- [ ] `inputs`/`outputs` explícitos en Turborepo
- [ ] Migraciones desplegadas antes que el código
- [ ] Reversión ensayada con éxito
- [ ] Imágenes multi-etapa, sin root
- [ ] Health checks y apagado ordenado
- [ ] Secretos en el gestor del entorno; gitleaks activo
- [ ] Logs estructurados con `correlationId`
- [ ] Trazas de punta a punta
- [ ] Alertas por síntoma, sin ruido
- [ ] SLO definidos y medidos
- [ ] Copias de seguridad **restauradas** al menos una vez
- [ ] Runbooks probados por alguien que no los escribió

## Plantillas

[`checklists/release.md`](../checklists/release.md) ·
[`checklists/incident.md`](../checklists/incident.md) ·
[`skills/observability.md`](observability.md)
