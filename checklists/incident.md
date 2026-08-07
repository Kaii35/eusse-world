# Checklist — Incidente en producción

**Prioridad: restaurar el servicio. Entender la causa viene después.**

---

## 1. Detectar y declarar (primeros 5 minutos)

- [ ] Incidente declarado, con un responsable único de la coordinación
- [ ] Severidad asignada:
  - **SEV1** — el negocio está parado (no se puede comprar) o hay fuga de datos
  - **SEV2** — funcionalidad principal degradada, con alternativa
  - **SEV3** — funcionalidad secundaria afectada
- [ ] Canal de comunicación abierto
- [ ] Hora de inicio registrada

## 2. Contener

- [ ] **¿Se puede revertir? Revertir. Ahora.** No se investiga con el servicio caído
- [ ] Si no: ¿se puede desactivar con un feature flag?
- [ ] Si no: ¿se puede aislar el componente afectado?
- [ ] Impacto acotado y comunicado

## 3. Diagnosticar

- [ ] ¿Qué cambió? (últimos despliegues, migraciones, cambios de configuración)
- [ ] Métricas: tasa de error, latencia, saturación
- [ ] Logs filtrados por `correlationId` de una petición fallida
- [ ] Trazas de punta a punta
- [ ] Estado de las colas y del outbox
- [ ] Estado de la base de datos: conexiones, bloqueos, consultas lentas
- [ ] Estado de los terceros

## 4. Resolver

- [ ] Causa raíz identificada
- [ ] Corrección aplicada (revertida o hacia adelante)
- [ ] Verificado que el servicio se ha restablecido
- [ ] Recorridos críticos probados manualmente
- [ ] Métricas normalizadas
- [ ] Trabajo pendiente reprocesado (DLQ, outbox atascado)

## 5. Comunicar

- [ ] Usuarios afectados informados si procede
- [ ] Equipo comercial informado
- [ ] Hora de resolución registrada
- [ ] Duración total del incidente calculada

## 6. Post-mortem (dentro de 48 horas)

- [ ] Cronología con horas exactas
- [ ] Impacto cuantificado: usuarios, pedidos, dinero, duración
- [ ] Causa raíz — **no "error humano"**: ¿qué permitió que ocurriera?
- [ ] **Sin culpables.** Se buscan fallos de sistema, no de personas
- [ ] ¿Por qué no lo detectamos antes? → mejora de alertas
- [ ] ¿Por qué tardamos en resolverlo? → mejora de runbooks o herramientas
- [ ] Acciones concretas, con dueño y fecha
- [ ] Test que habría detectado esto, escrito
- [ ] Alerta que lo habría detectado, creada
- [ ] Runbook actualizado
- [ ] Riesgo añadido a `docs/08-technical-risks.md` si es una clase nueva
- [ ] Presupuesto de error consumido, calculado

## Regla del presupuesto de error

Si el SLO mensual se agota, **el sprint siguiente prioriza fiabilidad**. Automático, sin
discusión. Es el único mecanismo que impide que la fiabilidad pierda siempre contra las
funcionalidades nuevas.

---

## Contactos y accesos

> Completar en Sprint 0 con el equipo real: responsable de guardia, escalado, panel de
> proveedores, acceso a base de datos de emergencia.
