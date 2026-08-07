# Skill — Accesibilidad

## Objetivo

WCAG 2.2 AA **verificado**, no declarado. Es requisito de la Definition of Done, no una
mejora para más adelante.

## Buenas prácticas

- **HTML semántico primero.** `<button>`, `<nav>`, `<main>`, `<table>`. ARIA es el último
  recurso, no el primero.
- **Radix como base** de todo componente interactivo: teclado, foco y ARIA ya resueltos.
- **Prueba con teclado mientras construyes**, no al final. Cinco minutos de `Tab` detectan
  más que cualquier herramienta.
- **Las herramientas automáticas detectan como mucho un tercio de los problemas.** La
  verificación manual es obligatoria en recorridos críticos.
- **Foco visible siempre**, con contraste ≥ 3:1.
- **Gestiona el foco** al abrir y cerrar overlays: entra al diálogo, vuelve al disparador.
- **Anuncia los cambios dinámicos** con `aria-live`.
- **Contraste verificado en ambos temas**, contra el peor fondo posible.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| `div` con `onClick` | No funciona con teclado; sin rol; sin foco |
| `outline: none` sin alternativa | Imposible navegar con teclado |
| `placeholder` como etiqueta | Desaparece al escribir; muchos lectores lo ignoran |
| Error sólo en color rojo | Invisible para daltonismo |
| Trampa de foco en un modal mal hecho | El usuario queda atrapado |
| `tabindex` positivo | Rompe el orden natural de tabulación |
| `alt` vacío en imagen informativa | Contenido perdido |
| Contraste verificado sólo en claro | El modo oscuro falla |
| Contenido nuevo sin anunciar | El usuario de lector no se entera |
| Ignorar `prefers-reduced-motion` | Mareo; incumple WCAG 2.3.3 |
| Objetivo táctil menor de 44 px | Inutilizable en móvil |

## Patrones

**Campo de formulario accesible**

```
<label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
<input
  id={id}
  required={required}
  aria-invalid={!!error}
  aria-describedby={cn(error && errorId, hint && hintId)}
/>
{hint  && <p id={hintId}>{hint}</p>}
{error && <p id={errorId} role="alert">{error}</p>}
```

**Anuncio de cambios dinámicos**

```
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? t('a11y.loadingResults') : t('a11y.resultsCount', { count })}
</div>
```

**Gestión de foco en overlays** — Radix lo hace: al abrir, el foco entra; `Escape` cierra;
al cerrar, vuelve al disparador; el fondo queda inerte.

**Salto al contenido**

```
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  {t('a11y.skipToContent')}
</a>
```

**Información nunca sólo por color**

```
<Badge variant="danger"><AlertIcon aria-hidden="true" /> {t('order.rejected')}</Badge>
```

Icono + texto + color. Cualquiera de los tres basta para entenderlo.

## Antipatrones

- **ARIA para arreglar HTML mal elegido**: usa el elemento correcto.
- **`role="button"` en un `div`**: `<button>` existe y trae todo gratis.
- **`aria-label` que contradice el texto visible**: confunde a quien usa dictado por voz.
- **Ocultar con `display: none` lo que debe leerse**: usa `sr-only`.
- **Carrusel automático**: incumple 2.2.2 (pausar, detener, ocultar).
- **Confiar sólo en axe**: no detecta orden de foco ilógico ni etiquetas absurdas.
- **Comprobar accesibilidad al final del proyecto**: sale carísimo.

## Ejemplos

**Bien**

```
<button type="button" onClick={onAdd} disabled={isPending}
        aria-busy={isPending} className={button({ variant: 'primary' })}>
  {isPending && <Spinner aria-hidden="true" className="mr-2 size-4" />}
  {t('product.addToCart')}
</button>
```

**Mal**

```
<div className="btn" onClick={onAdd}>
  <img src="/plus.svg" />
</div>
```

Sin teclado, sin rol, sin nombre accesible, sin estado.

## Convenciones

- WCAG 2.2 AA como mínimo.
- `sr-only` de `@eusse/ui` para texto sólo de lectores.
- `aria-hidden="true"` en iconos decorativos; los informativos llevan texto acompañante.
- Todo componente de `@eusse/ui` con test de comportamiento accesible.
- axe integrado en la suite E2E.
- Verificación manual obligatoria en los siete recorridos críticos.

## Checklist

- [ ] Todo operable con teclado; orden lógico
- [ ] Foco visible con contraste ≥ 3:1
- [ ] Sin trampas de foco; `Escape` cierra overlays
- [ ] Foco gestionado al abrir y cerrar
- [ ] Enlace de salto al contenido
- [ ] HTML semántico; landmarks correctos
- [ ] Un `h1` por página; jerarquía sin saltos
- [ ] `<label>` real en todo campo
- [ ] Errores con `aria-describedby` y `role="alert"`
- [ ] Contraste AA en **ambos** temas
- [ ] Información nunca sólo por color
- [ ] Zoom al 200% sin pérdida
- [ ] Objetivos táctiles ≥ 44×44 px
- [ ] `prefers-reduced-motion` respetado
- [ ] Cambios dinámicos anunciados
- [ ] `alt` significativo; decorativas con `alt=""`
- [ ] **Verificado con teclado y con lector de pantalla**

## Plantillas

[`checklists/accessibility.md`](../checklists/accessibility.md) ·
[`skills/ui-implementation.md`](ui-implementation.md)
