# Checklist — Definition of Done

Una tarea está terminada cuando **todo** esto es cierto. No "casi todo".

---

## Funcional

- [ ] Cumple **todos** los criterios de aceptación del RFC, verificados uno por uno
- [ ] Flujos alternos implementados
- [ ] Flujos de error implementados, con el mensaje correcto y accionable
- [ ] Los cinco estados en cada vista con datos: loading · empty · error · partial · success
- [ ] Permisos verificados con todos los roles aplicables
- [ ] Comportamiento concurrente correcto (dos usuarios, misma cuenta)

## Calidad de código

- [ ] `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` en verde
- [ ] Fronteras de arquitectura respetadas (verificado, no asumido)
- [ ] Cobertura: **≥ 90% en `domain/`**, **≥ 80% en `application/`**
- [ ] Sin `any`, sin `@ts-ignore` sin justificación e issue
- [ ] Sin `console.log`, sin código comentado, sin código muerto
- [ ] Sin `TODO` sin dueño e issue
- [ ] Nombres alineados con el glosario

## Tests

- [ ] Un test unitario por invariante de dominio
- [ ] Test de integración del caso de uso, camino feliz **y** de error
- [ ] Contract tests verdes
- [ ] E2E del recorrido crítico afectado, en verde
- [ ] Test de idempotencia si la operación lo requiere
- [ ] **Test de aislamiento entre cuentas** si devuelve datos privados
- [ ] Sin tests inestables introducidos

## No funcional

- [ ] **Accesibilidad**: teclado completo, foco visible, contraste AA en ambos temas,
      axe sin violaciones críticas ni serias
- [ ] **Rendimiento**: presupuesto de la ruta respetado; `EXPLAIN ANALYZE` adjunto si hay
      consulta de listado; sin N+1
- [ ] **i18n**: cero literales en el código; claves en `es` y `en`
- [ ] **Seguridad**: entradas validadas, autorización en servidor, `accountId` de la
      sesión, sin secretos expuestos
- [ ] **SEO** (si es página pública): metadatos, canónica, datos estructurados
- [ ] **Observabilidad**: logs con `correlationId`, errores con código de dominio,
      sin datos personales en logs

## Datos

- [ ] Migración probada hacia adelante
- [ ] Plan de reversión escrito
- [ ] Migración ensayada con volumen realista
- [ ] Índices justificados con su motivo escrito

## Documentación

- [ ] `docs/domain/<contexto>.md` actualizado si cambió el dominio
- [ ] OpenAPI regenerado si cambió un contrato
- [ ] `@eusse/sdk` actualizado
- [ ] `.env.example` actualizado si hay configuración nueva
- [ ] README del paquete actualizado si cambió su API
- [ ] Changeset creado si es un paquete publicable

## Proceso

- [ ] Checklist del dominio marcada y adjunta al PR
- [ ] PR ≤ ~400 líneas de diff productivo
- [ ] PR enlaza su RFC
- [ ] Revisado y aprobado por al menos una persona distinta al autor
- [ ] **Deuda introducida: ninguna**, o registrada en `docs/tech-debt.md` con fecha límite
- [ ] Probado en un entorno real, no sólo en local

---

**Si falta un ítem, la tarea no está terminada. Está casi terminada, que no es lo mismo.**
