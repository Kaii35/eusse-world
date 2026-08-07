# RFC-XXXX — <Título>

| Campo | Valor |
| ----- | ----- |
| **Estado** | Borrador · En revisión · Aprobado · Implementado · Rechazado · Supersedido |
| **Autor** | <agente / persona> |
| **Revisores** | <agentes afectados> |
| **Creado** | AAAA-MM-DD |
| **Última actualización** | AAAA-MM-DD |
| **ADR generados** | ADR-XXXX, ADR-YYYY |
| **Bloque / Sprint** | <referencia a docs/06 y docs/11> |

---

## 1. Problema

Qué problema resuelve, para quién y por qué ahora. En prosa, sin solución todavía.
Si no cabe en tres párrafos, el alcance es demasiado grande: divide el RFC.

## 2. Objetivos y no-objetivos

**Objetivos**
- …

**No-objetivos** (explícitos, para acotar)
- …

## 3. Alternativas consideradas

| Alternativa | Ventajas | Inconvenientes | Por qué se descarta |
| ----------- | -------- | -------------- | ------------------- |
| A | | | |
| B | | | |
| **C (elegida)** | | | — |

## 4. Diseño

Descripción de la solución. Diagramas en Mermaid.

### 4.1 Modelo de dominio
Agregados, entidades, value objects e invariantes. Enlaza `docs/domain/<contexto>.md`.

### 4.2 Casos de uso
Uno por uno, con actor, precondiciones, flujo principal, alternos, error y postcondiciones.
Formato: [`templates/use-case.md`](use-case.md).

### 4.3 Contratos
Esquemas Zod (forma, no necesariamente implementados). Endpoints con verbo, ruta,
entrada, salida y códigos de error.

### 4.4 Interfaces y puertos
Qué necesita el dominio del exterior y con qué firma.

### 4.5 Eventos
Emitidos y consumidos, con esquema versionado y consumidores previstos.

### 4.6 Estados
Máquinas de estado con todas las transiciones válidas. Diagrama Mermaid.

### 4.7 Errores
Tabla: código · HTTP · cuándo ocurre · qué ve el usuario.

### 4.8 Modelo de datos
Tablas, columnas, índices con su motivo, y estrategia de migración.

### 4.9 Interfaz de usuario
Flujos, estados (loading, empty, error, partial, success), y comportamiento responsive.

## 5. Impacto

| Área | Impacto |
| ---- | ------- |
| Contextos afectados | |
| Paquetes afectados | |
| Cambios rompedores | |
| Migración de datos | |
| Rendimiento | |
| Seguridad | |
| Accesibilidad | |
| i18n | |
| SEO | |
| Observabilidad | |

## 6. Riesgos

| Riesgo | Prob. | Impacto | Mitigación verificable |
| ------ | ----- | ------- | ---------------------- |
| | | | |

## 7. Criterios de aceptación

En Gherkin, verificables.

```gherkin
Escenario: …
  Dado …
  Cuando …
  Entonces …
```

## 8. Plan de implementación

Pasos ordenados, con agente responsable y dependencias.
Orden interno obligatorio: Contratos → Dominio → Aplicación → Infraestructura → HTTP →
SDK → UI → E2E.

## 9. Preparación para fases futuras

Qué hueco se deja (puerto, evento, columna) y **qué explícitamente NO se construye ahora**.

## 10. Preguntas abiertas

| # | Pregunta | Bloquea | Resuelta |
| - | -------- | ------- | -------- |
| 1 | | | |

**Un RFC no se aprueba con preguntas abiertas que bloqueen.**

## 11. Enlaces

RFC relacionados · ADR generados · Documentos afectados · Checklists aplicables
