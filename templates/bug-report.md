# <Título: qué falla, en una línea, sin diagnóstico>

| Campo             | Valor                                         |
| ----------------- | --------------------------------------------- |
| **Severidad**     | Crítica · Alta · Media · Baja                 |
| **Reportado por** |                                               |
| **Fecha**         |                                               |
| **Entorno**       | producción · staging · preview-PR-NNN · local |
| **Reproducible**  | N de M intentos                               |

## Severidad

| Nivel       | Definición                                                        | ¿Bloquea la aceptación? |
| ----------- | ----------------------------------------------------------------- | :---------------------: |
| **Crítica** | El negocio se detiene, hay pérdida de datos o fuga de información |           Sí            |
| **Alta**    | Funcionalidad principal rota, sin alternativa                     |           Sí            |
| **Media**   | Funcionalidad rota, con alternativa viable                        |           No            |
| **Baja**    | Cosmético o de conveniencia                                       |           No            |

## Entorno

|                          |     |
| ------------------------ | --- |
| Navegador y versión      |     |
| Sistema operativo        |     |
| Dispositivo y resolución |     |
| Idioma / tema            |     |
| Rol del usuario          |     |
| Cuenta                   |     |

## Pasos de reproducción

**Exactos. Sin ellos, no es un reporte.**

1. …
2. …
3. …

## Resultado esperado

Qué debería ocurrir, y por qué (enlaza el criterio de aceptación o la regla).

## Resultado obtenido

Qué ocurre en realidad.

## Evidencia

- Captura o vídeo
- **`correlationId`** de la petición fallida
- Mensaje de error mostrado al usuario
- Errores de consola
- Registro relevante

## Impacto

- ¿A cuántos usuarios afecta?
- ¿Hay alternativa? ¿Cuál?
- ¿Hay pérdida o corrupción de datos?
- ¿Hay implicación de seguridad o privacidad? _(si sí, no lo publiques con detalle
  explotable: escala al agente de Seguridad)_

## Diagnóstico

_Lo rellena quien lo corrige, no quien lo reporta._

**Causa raíz:**
**Corrección:**
**Test que lo previene:**
**¿Por qué no lo detectamos antes?**

## Prevención

- [ ] Test automatizado añadido que fallaría con este bug
- [ ] Checklist actualizada si revela un hueco del proceso
- [ ] Alerta creada si es detectable en producción
- [ ] Riesgo añadido a `docs/08-technical-risks.md` si es una clase nueva de fallo
