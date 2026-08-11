# Módulo — `<nombre>`

| Campo                | Valor         |
| -------------------- | ------------- |
| **Contexto acotado** |               |
| **RFC**              | RFC-XXXX      |
| **Fase**             | 1 · 2 · 3 · 4 |
| **Dueño**            | agente        |

## Responsabilidad

Una frase. **Qué NO hace:** igual de importante.

## Estructura

```
modules/<nombre>/
├── public/                       ← LO ÚNICO importable por otros módulos
│   ├── <nombre>.facade.ts
│   └── <nombre>.types.ts         DTOs planos, nunca entidades de dominio
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── errors/
│   ├── ports/
│   └── services/
├── application/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/
│   ├── persistence/
│   ├── messaging/
│   └── external/
├── interface/
│   ├── http/
│   └── consumers/
└── <nombre>.module.ts
```

## Interfaz pública

Lo único que otros módulos pueden usar:

```ts
export interface <Nombre>Facade {
  // firmas mínimas y estables, con DTOs planos
}
```

## Dependencias

| Depende de | Tipo              | Qué usa | Declarado en `07-module-dependencies.md` |
| ---------- | ----------------- | ------- | :--------------------------------------: |
|            | Síncrona / Evento |         |                    ☐                     |

**Verificar:** sin dependencias circulares. Si A necesita B y B necesita A, uno publica un
evento.

## Persistencia

**Esquema PostgreSQL:** `<nombre>` · **Sin FK hacia otros contextos.**

| Tabla | Propósito |
| ----- | --------- |
|       |           |

## Eventos

**Emite:** … · **Consume:** …

## Configuración

| Variable | Obligatoria | Descripción |
| -------- | ----------- | ----------- |
|          |             |             |

Añadir a `.env.example` y validar con Zod al arrancar.

## Checklist de creación

- [ ] RFC aprobado
- [ ] `docs/domain/<contexto>.md` escrito
- [ ] Contratos en `@eusse/contracts`
- [ ] Estructura de carpetas creada
- [ ] `public/` con la interfaz mínima
- [ ] Registrado en `app.module.ts`
- [ ] Esquema Prisma con migración inicial
- [ ] Fronteras verificadas por lint
- [ ] Añadido al grafo de `docs/07-module-dependencies.md`
- [ ] Tests de dominio con cobertura ≥ 90%
- [ ] Dashboard de observabilidad creado
