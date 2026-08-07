# Skill — QA

## Objetivo

Verificar que lo construido es lo especificado y que se comporta bien cuando algo sale mal.
QA no escribe la suite automatizada: comprueba lo que ninguna suite cubre.

## Buenas prácticas

- **Verifica criterio por criterio**, no "en general funciona".
- **El camino feliz es el 20% del trabajo.** El valor está en los alternos, los errores y
  la concurrencia.
- **Reproduce antes de reportar.** Un defecto sin pasos exactos no es un reporte.
- **Prueba con todos los roles.** Un `VIEWER` no debería poder pedir.
- **Prueba el aislamiento entre cuentas a mano**, además de con tests.
- **Sesión exploratoria acotada** (30 min, un objetivo) después de la verificación formal.
  Ahí aparece lo que nadie previó.
- **Si la especificación no lo dice, es un hallazgo de especificación**, no una decisión de
  QA.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Sólo probar el camino feliz | Los bugs llegan a producción |
| Reportar sin pasos de reproducción | El desarrollador no puede arreglarlo |
| "No funciona" como descripción | Ida y vuelta de tres días |
| Probar sólo en Chrome de escritorio | Safari en iOS revienta |
| No probar con datos reales | El catálogo real rompe el layout |
| Asumir el comportamiento esperado | Se aprueba algo incorrecto |
| Aprobar "con observaciones" un defecto alto | La deuda entra en producción |
| No probar la concurrencia | Órdenes duplicadas, carritos corruptos |
| Probar sólo con el rol de administrador | Los permisos nunca se verifican |

## Patrones

**Verificación estructurada**

```
Criterio CA-03: "Si el total supera el umbral del comprador, la orden queda pendiente
                 de aprobación y no se cursa"

Escenario A: total < umbral            → CONFIRMED           ✅
Escenario B: total = umbral exacto     → CONFIRMED           ✅  (borde)
Escenario C: total > umbral            → PENDING_APPROVAL    ✅
Escenario D: comprador sin umbral      → CONFIRMED           ✅
Escenario E: aprobador se aprueba a sí mismo → ¿?            ⚠️ hallazgo de especificación
```

**Reporte de defecto útil**

```
Título: El carrito pierde la cantidad al cambiar de cuenta activa
Severidad: Alta
Entorno: preview-PR-142 · Chrome 141 · Windows

Pasos:
 1. Iniciar sesión como buyer@acme.com (2 cuentas asociadas)
 2. Añadir TAL-500 con cantidad 24
 3. Cambiar a la cuenta "Acme Sur" desde el selector
 4. Volver a la cuenta "Acme Norte"

Esperado: el carrito muestra TAL-500 × 24
Obtenido: el carrito muestra TAL-500 × 12 (la cantidad mínima)

Evidencia: video adjunto · correlationId req-8f2a1c
Reproducible: 5/5
```

**Matriz de robustez** — para cada operación que muta datos:

| Prueba | Esperado |
| ------ | -------- |
| Doble clic rápido | Una sola operación |
| Recargar a mitad | Estado consistente |
| Botón atrás tras completar | Sin repetir la operación |
| Sesión expirada durante la operación | Mensaje claro, datos preservados |
| Red intermitente | Reintento o error recuperable |
| Dos pestañas abiertas | Sin corrupción |
| Dos usuarios de la misma cuenta | Sin pérdida de datos |

**Casos borde sistemáticos:** vacío · uno · muchos · máximo · nulo · negativo · cero ·
texto muy largo · caracteres especiales y emojis · expirado · concurrente.

## Antipatrones

- **QA como último filtro**: encontrar los bugs al final es lo más caro que existe.
- **Aprobar por presión de fecha.**
- **Probar sólo lo que se dijo que cambió**: las regresiones aparecen en lo que nadie tocó.
- **Reportar sin evidencia.**
- **Discutir la severidad en vez de arreglarlo.**
- **Confiar en que "los tests automatizados ya lo cubren".**

## Ejemplos

**Bien — hallazgo de especificación**

> **CA-03 no define si un aprobador puede autorizar su propio pedido.**
> Comportamiento actual: sí puede.
> Riesgo: anula el control interno que motiva la funcionalidad.
> Escalado a: Analista Funcional + Product Owner.
> Bloquea la aceptación: sí.

QA no lo decide. Lo detecta, lo escala y bloquea hasta que se resuelva **por escrito**.

## Convenciones

- Severidad: **Crítica** (bloquea el negocio o hay fuga de datos) · **Alta** (función
  principal rota, sin alternativa) · **Media** (rota con alternativa) · **Baja** (cosmético).
- Crítica y alta **bloquean la aceptación**.
- Todo defecto: pasos, esperado, obtenido, evidencia, `correlationId`, tasa de reproducción.
- Informe de verificación por criterio de aceptación.
- Matriz mínima: Chrome, Firefox, Safari, Edge · iOS, Android · 375/768/1280/1920 ·
  claro/oscuro · es/en.

## Checklist

- [ ] Cada criterio de aceptación verificado por separado
- [ ] Flujos alternos y de error probados
- [ ] Permisos verificados con **todos** los roles
- [ ] Aislamiento entre cuentas verificado manualmente
- [ ] Casos borde cubiertos
- [ ] Matriz de robustez completa
- [ ] Doble clic y doble envío probados
- [ ] Sesión expirada a mitad de operación
- [ ] Concurrencia probada
- [ ] Matriz de navegadores y dispositivos
- [ ] Ambos idiomas y ambos temas
- [ ] Los cinco estados presentes en cada vista
- [ ] Sin datos de prueba visibles
- [ ] Sesión exploratoria de ≥ 30 min
- [ ] Informe con recomendación explícita de aceptar o rechazar

## Plantillas

[`templates/bug-report.md`](../templates/bug-report.md) ·
[`templates/test-plan.md`](../templates/test-plan.md) ·
[`checklists/definition-of-done.md`](../checklists/definition-of-done.md)
