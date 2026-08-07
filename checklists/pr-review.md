# Checklist — Revisión de Pull Request

El revisor **no aprueba lo que no entiende**. Pedir explicación es parte del trabajo, no
una molestia.

Se revisa **en este orden**. Si falla el punto 1, no tiene sentido mirar el estilo.

---

## 1. ¿Resuelve el problema correcto?

- [ ] El PR enlaza un RFC aprobado (obligatorio si es `feat`)
- [ ] Lo implementado coincide con lo que dice el RFC
- [ ] El alcance no se ha ampliado en silencio
- [ ] Si el RFC estaba equivocado, se actualizó el RFC — no se improvisó

## 2. ¿Está en la capa correcta?

- [ ] Lógica de negocio en el **dominio**, no en controllers ni componentes
- [ ] **Ningún precio ni total calculado en el cliente**
- [ ] `domain/` sin imports de framework
- [ ] Prisma sólo en `infrastructure/persistence/`
- [ ] Sólo se importa el `public/` de otros módulos
- [ ] Un feature no importa de otro feature

## 3. ¿Están protegidos los invariantes?

- [ ] Las reglas de negocio están en el agregado, no en la validación de entrada
- [ ] Es imposible construir una entidad en estado inválido
- [ ] Una transacción modifica un solo agregado
- [ ] Cada invariante tiene su test

## 4. ¿Qué pasa cuando falla?

- [ ] Errores de dominio con código estable, no `throw new Error`
- [ ] Flujos de error implementados, no sólo el feliz
- [ ] Timeouts y reintentos considerados en llamadas externas
- [ ] Concurrencia considerada (doble clic, dos usuarios, reintento de cola)
- [ ] Idempotencia donde corresponde
- [ ] Un fallo de tercero deja el sistema en estado consistente

## 5. Seguridad

- [ ] Entradas validadas con Zod en la frontera
- [ ] Autorización en servidor, sobre el recurso concreto
- [ ] **`accountId` de la sesión, nunca del cliente**
- [ ] Test de IDOR si devuelve datos privados
- [ ] Sin secretos, sin datos personales en logs
- [ ] Redirecciones validadas contra allowlist

## 6. ¿Los tests probarían un bug real?

- [ ] Los tests fallan si se rompe el comportamiento (no sólo si cambia la implementación)
- [ ] Casos borde cubiertos
- [ ] No se mockea el módulo bajo prueba
- [ ] Integración con base de datos real, no con mock de Prisma
- [ ] Cobertura dentro de umbral

## 7. Rendimiento

- [ ] Sin N+1
- [ ] `EXPLAIN ANALYZE` adjunto si hay consulta de listado
- [ ] Presupuesto de bundle respetado
- [ ] Sin datos privados en caché compartida
- [ ] Caché nueva con política de invalidación escrita

## 8. Frontend (si aplica)

- [ ] Server Component salvo necesidad demostrada
- [ ] Los cinco estados implementados
- [ ] Sin literales de texto
- [ ] Sólo tokens: cero valores mágicos
- [ ] Teclado y contraste verificados
- [ ] Claro y oscuro verificados

## 9. ¿Se puede borrar código?

- [ ] Sin duplicación evitable
- [ ] Sin abstracciones especulativas ("por si acaso")
- [ ] Sin código muerto ni comentado
- [ ] La solución más simple que funciona

## 10. Convenciones y forma

- [ ] Nombres del glosario
- [ ] Conventional Commits
- [ ] PR ≤ ~400 líneas de diff productivo
- [ ] Sin `any`, sin `@ts-ignore` injustificado, sin `console.log`
- [ ] Documentación actualizada en el mismo PR
- [ ] Changeset si es paquete publicable

---

## Cómo se comenta

- **Bloqueante**: "Esto permite un IDOR: `accountId` viene del cuerpo."
- **Sugerencia**: "Se podría simplificar con X, pero no bloquea."
- **Pregunta**: "¿Por qué aquí y no en el dominio? Puede que se me escape algo."

Distinguir los tres tipos evita que una preferencia estética parezca un bloqueo.
