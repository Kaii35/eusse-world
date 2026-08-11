# Skill — Movimiento y animación

## Objetivo

Movimiento que comunica causalidad y jerarquía, no que decora. Rápido, respetuoso con las
preferencias del usuario y sin coste de rendimiento.

## Buenas prácticas

- **Toda animación responde una pregunta**: ¿de dónde vino esto? ¿adónde fue? ¿qué causó
  qué? Si no responde ninguna, sobra.
- **Rápido.** 120–160 ms para microinteracciones, 200–280 ms para transiciones de estado.
  Nada por encima de 600 ms.
- **Sólo `transform` y `opacity`.** Todo lo demás provoca layout o paint.
- **`prefers-reduced-motion` siempre.** No es una mejora: es un requisito de accesibilidad.
- **`once: true` en revelados al scroll.** Reanimar al volver a subir marea al usuario.
- **El contenido nunca depende de la animación para existir.** Si el JS falla, el texto
  está ahí.
- **Motion cargado dinámicamente** en secciones no críticas: no debe pesar en el LCP.
- **Springs para lo físico** (arrastrar, soltar, rebotar), **easing para lo funcional**
  (abrir, cerrar, aparecer).

## Errores comunes

| Error                                          | Consecuencia                             |
| ---------------------------------------------- | ---------------------------------------- |
| Animaciones largas y "cinematográficas"        | La app se percibe lenta y rota           |
| Animar `width`, `height`, `top`, `box-shadow`  | Reflow, jank, batería                    |
| Ignorar `prefers-reduced-motion`               | Mareo, migrañas; incumple WCAG 2.3.3     |
| Revelado al scroll que se repite               | Distrae y molesta al releer              |
| Contenido invisible hasta que anima            | Si el JS falla, la página está en blanco |
| Parallax en móvil                              | Consumo de batería y mareo               |
| Animar cada elemento de una lista de 50        | Cascada eterna; se percibe lentísimo     |
| Motion en el bundle crítico                    | LCP penalizado en la landing             |
| Transición de página que bloquea la navegación | El usuario cree que no funcionó          |

## Patrones

**Respeto a la preferencia del usuario**

```
const reduced = useReducedMotion()
<motion.div
  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: reduced ? 0.01 : 0.4, ease: 'easeOut' }}
/>
```

Con la preferencia activa, sólo cambia la opacidad: sin desplazamiento ni escala.

**Revelado al scroll, una sola vez**

```
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
/>
```

**Escalonado acotado** — como mucho 6–8 elementos, con 40–60 ms entre ellos. Nunca los 50
de una lista.

**Layout compartido** — para que un elemento "viaje" entre estados (`layoutId`), en vez de
desaparecer y reaparecer.

**Microinteracción de feedback**

```
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.12 }}
```

**Carga diferida en secciones no críticas**

```
const Testimonials = dynamic(() => import('./testimonials'), { ssr: true })
```

## Antipatrones

- **Animación como decoración**: sin propósito, sólo porque queda bien.
- **Todo anima**: si todo se mueve, nada destaca.
- **Duración larga para parecer premium**: parece roto, no premium.
- **Animar durante el scroll continuo**: jank garantizado.
- **`setTimeout` para encadenar animaciones**: frágil e impredecible.
- **Animar la entrada de contenido crítico**: retrasa el LCP.
- **Carrusel automático**: nadie lo lee y perjudica la accesibilidad.

## Ejemplos

**Bien — hero que no compromete el LCP**

```
<h1 className="...">{t('hero.title')}</h1>       {/* visible de inmediato, sin animar */}
<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}>
  {t('hero.subtitle')}
</motion.p>
```

El título — que es el LCP — no espera a ninguna animación.

**Mal**

```
<motion.h1 initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5, delay: 0.8 }}>
  {t('hero.title')}
</motion.h1>
```

El LCP se retrasa 2.3 s por decisión propia. Presupuesto de landing incumplido.

## Convenciones

- Duraciones y curvas como tokens en `@eusse/tokens`: `--motion-fast` (150 ms),
  `--motion-base` (250 ms), `--motion-slow` (450 ms).
- Curvas: `--ease-out`, `--ease-in-out`, `--ease-emphasized`.
- Componentes de movimiento reutilizables en `@eusse/ui/motion`: `FadeIn`, `ScrollReveal`,
  `Stagger`.
- `useReducedMotion()` de `@eusse/ui/hooks` en todo componente animado.
- **Sin animaciones en `apps/admin`** salvo feedback de interacción.

## Checklist

- [ ] Cada animación tiene un propósito enunciable
- [ ] Duración dentro del rango (≤ 600 ms)
- [ ] Sólo `transform` y `opacity`
- [ ] `prefers-reduced-motion` respetado y probado
- [ ] `once: true` en revelados al scroll
- [ ] Contenido visible sin JavaScript
- [ ] El LCP no espera a ninguna animación
- [ ] Escalonado acotado a ≤ 8 elementos
- [ ] Sin parallax en móvil
- [ ] Motion diferido fuera de la ruta crítica
- [ ] 60 fps verificado en un dispositivo de gama media
- [ ] Sin animación en el back-office más allá del feedback

## Plantillas

[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) §4 ·
[`skills/performance.md`](performance.md) ·
[`skills/accessibility.md`](accessibility.md)
