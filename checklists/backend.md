# Checklist — Backend

Para cualquier trabajo en `apps/api` o `apps/workers`.

---

## Capas y fronteras

- [ ] `domain/` **sin** imports de `@nestjs/*`, `@prisma/client` ni de otro módulo
- [ ] Prisma **sólo** en `infrastructure/persistence/`
- [ ] Sólo se importa el `public/` de otros módulos
- [ ] Sin dependencias circulares entre módulos
- [ ] El controller valida, delega y mapea. **No piensa**

## Dominio

- [ ] Cada invariante del RFC tiene su test unitario
- [ ] Imposible construir una entidad en estado inválido
- [ ] Value objects donde hay reglas (`Money`, `Quantity`, `Sku`, `Email`)
- [ ] Métodos con nombre del negocio (`order.approve()`, no `setStatus()`)
- [ ] Referencias entre agregados **por ID**, no por objeto
- [ ] Errores extienden `DomainError` con código del catálogo

## Aplicación

- [ ] Un caso de uso por operación de negocio, con un solo método público
- [ ] **Una transacción modifica un solo agregado**
- [ ] La transacción se gestiona en la capa de aplicación
- [ ] Se inyectan puertos, no implementaciones
- [ ] `Result` para errores esperados; excepciones sólo para lo imprevisto

## Contratos y validación

- [ ] Entrada validada con el esquema de `@eusse/contracts`
- [ ] Sin DTOs escritos a mano en paralelo al esquema Zod
- [ ] Respuesta mapeada explícitamente; **sin devolver el modelo de Prisma**
- [ ] Contract tests verdes
- [ ] OpenAPI regenerado y `@eusse/sdk` actualizado

## Seguridad

- [ ] **`accountId` desde la sesión, nunca del cliente**
- [ ] Autorización verificada sobre el recurso concreto
- [ ] Repositorio con ámbito de cuenta obligatorio por tipo
- [ ] **Test de IDOR**: cuenta A pide recurso de B → 404
- [ ] Importes calculados en el servidor
- [ ] `Idempotency-Key` en mutaciones sensibles, con restricción única en base de datos

## Eventos

- [ ] Publicados por **outbox**, dentro de la transacción
- [ ] Esquema versionado (`.v1`) y validado al publicar
- [ ] Payload autocontenido
- [ ] Consumidores idempotentes por `eventId`
- [ ] Consumidores toleran desorden
- [ ] Reintento exponencial, DLQ y runbook

## Datos

- [ ] **Sin N+1**: consultas en lote
- [ ] `select` explícito; sin traer columnas innecesarias
- [ ] `EXPLAIN ANALYZE` adjunto en consultas de listado
- [ ] Paginación por cursor
- [ ] Migración con checklist propia completada

## Observabilidad

- [ ] Logs estructurados con `correlationId`
- [ ] **Sin datos personales ni secretos en logs**
- [ ] Nivel de log correcto (un error de negocio esperado es `info`, no `error`)
- [ ] Span por caso de uso y por consulta

## Calidad

- [ ] Cobertura: dominio ≥ 90%, aplicación ≥ 80%
- [ ] Tests de integración con PostgreSQL y Redis reales
- [ ] Camino de error probado, no sólo el feliz
- [ ] `lint`, `typecheck`, `test`, `build` en verde
- [ ] `.env.example` actualizado si hay configuración nueva
