# Checklist — Antes de escribir un RFC

Un RFC que empieza por la solución rara vez encuentra la buena.

---

## Entender el problema

- [ ] Puedo enunciar el problema en tres frases, **sin mencionar ninguna solución**
- [ ] Sé quién lo sufre y con qué frecuencia
- [ ] Sé qué pasa hoy sin esto (el coste de no hacerlo)
- [ ] Sé cómo mediré si se resolvió
- [ ] He hablado con quien tiene el problema, no sólo con quien lo reportó

## Entender el contexto

- [ ] He leído los ADR vigentes que afectan a esta área
- [ ] He leído los RFC relacionados
- [ ] Sé qué contextos acotados toca
- [ ] Sé qué agentes se verán afectados
- [ ] He revisado si algo del sistema ya resuelve parte de esto

## Alcance

- [ ] Sé qué entra y qué **no** entra
- [ ] El alcance cabe en un RFC (si necesita más de ~10 páginas, divídelo)
- [ ] Sé qué se difiere a fases posteriores y qué hueco hay que dejar

## Alternativas

- [ ] Tengo al menos **dos alternativas reales**, no una y un espantapájaros
- [ ] Para cada una: ventajas, inconvenientes y por qué se descarta
- [ ] He considerado la opción "no hacer nada" y sé por qué no basta
- [ ] He considerado la opción más simple posible

## Antes de escribir

- [ ] Sé qué ADR va a generar este RFC
- [ ] Tengo los casos de uso del Analista Funcional (o los voy a producir con él)
- [ ] Sé qué criterios de aceptación serán verificables
- [ ] Sé quién debe revisarlo

---

**Regla:** si no puedes enunciar el problema sin nombrar la solución, todavía no lo
entiendes. Vuelve a hablar con quien lo sufre.

Plantilla: [`templates/rfc.md`](../templates/rfc.md)
