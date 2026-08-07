# Checklist — Release a producción

---

## Antes de desplegar

- [ ] `main` en verde: lint, typecheck, tests, build, E2E
- [ ] Todas las puertas de CI superadas
- [ ] Cambios probados en `staging` con datos realistas
- [ ] Definition of Done cumplida en todo lo que entra
- [ ] Sin defectos críticos ni altos abiertos
- [ ] Changesets creados y versiones publicadas
- [ ] Notas de versión generadas

## Base de datos

- [ ] **Migración desplegada antes que el código** que la usa
- [ ] Migración ensayada contra copia de producción
- [ ] Tiempo de ejecución conocido y aceptable
- [ ] **Copia de seguridad reciente y verificada**
- [ ] Plan de reversión escrito

## Configuración

- [ ] Variables de entorno nuevas creadas en producción
- [ ] Secretos rotados si corresponde
- [ ] Feature flags en el estado correcto (lo incompleto, apagado)
- [ ] `.env.example` actualizado

## Riesgo

- [ ] Cambios rompedores identificados y comunicados
- [ ] Consumidores actualizados
- [ ] Impacto en usuarios activos evaluado
- [ ] Ventana de despliegue adecuada (**no viernes por la tarde sin guardia**)
- [ ] Alguien disponible durante y después del despliegue

## Durante

- [ ] Despliegue ejecutado
- [ ] Health checks en verde
- [ ] Humo manual de los recorridos críticos:
  - [ ] Landing carga
  - [ ] Login funciona
  - [ ] Catálogo y búsqueda responden
  - [ ] Añadir al carrito funciona y muestra el precio correcto
  - [ ] Checkout completa un pedido de prueba
  - [ ] Admin accesible
- [ ] Métricas estables (tasa de error, latencia)
- [ ] Sin picos en los logs de error
- [ ] Colas procesando con normalidad
- [ ] Outbox sin pendientes acumulados

## Después

- [ ] Monitorización durante al menos 30 minutos
- [ ] Core Web Vitals sin regresión
- [ ] Alertas silenciosas
- [ ] Equipo informado
- [ ] Documentación actualizada
- [ ] Tareas cerradas

## Si algo va mal

- [ ] **Revertir primero, investigar después**
- [ ] Reversión al despliegue anterior en < 5 min
- [ ] Las migraciones **no se revierten**: se corrigen hacia adelante
- [ ] Incidente registrado ([`checklists/incident.md`](incident.md))
- [ ] Post-mortem sin culpables en menos de 48 h
