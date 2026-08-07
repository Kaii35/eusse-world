# Componente — `<NombreComponente>`

| Campo | Valor |
| ----- | ----- |
| **Ubicación** | `packages/ui/src/primitives/` · `patterns/` · `apps/*/components/` · `features/<x>/components/` |
| **Base** | Radix `<Primitive>` · ninguna |
| **RFC / Diseño** | |

## Propósito

Qué resuelve, en una frase.

**Cuándo usarlo:** …
**Cuándo NO usarlo:** … (esto es lo que evita la deriva del sistema)

## Decisión de ubicación

- ¿Es reutilizable **y** agnóstico del dominio? → `packages/ui`
- ¿Es una composición específica de una app? → `apps/*/components`
- ¿Sólo tiene sentido dentro de un feature? → `features/<x>/components`

**Regla de las dos apariciones:** sube a `packages/ui` cuando ya se usa en dos sitios.

## API

```ts
type <Nombre>Props = ComponentPropsWithoutRef<'element'> & {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}
```

| Prop | Tipo | Por defecto | Descripción |
| ---- | ---- | ----------- | ----------- |
| | | | |

## Variantes

| Variante | Cuándo usarla |
| -------- | ------------- |
| | |

## Estados

- [ ] Reposo
- [ ] Hover
- [ ] `focus-visible`
- [ ] Activo
- [ ] Deshabilitado
- [ ] Cargando
- [ ] Error

Si muestra datos, además: loading · empty · error · partial · success.

## Tokens usados

| Categoría | Tokens |
| --------- | ------ |
| Color | |
| Espaciado | |
| Radio | |
| Sombra | |
| Movimiento | |

**Cero valores arbitrarios.** Si falta un token, se pide al Design System.

## Accesibilidad

| Requisito | Cumplido |
| --------- | :---: |
| Rol correcto (elemento nativo o ARIA justificado) | ☐ |
| Nombre accesible | ☐ |
| Operable con teclado | ☐ |
| Foco visible con contraste ≥ 3:1 | ☐ |
| Estado anunciado (`aria-*`) | ☐ |
| Contraste AA en **ambos** temas | ☐ |
| Información no sólo por color | ☐ |
| Objetivo táctil ≥ 44×44 px | ☐ |
| `prefers-reduced-motion` respetado | ☐ |

## Movimiento

| Interacción | Duración | Curva |
| ----------- | -------- | ----- |
| | | |

Sólo `transform` y `opacity`.

## Ejemplo

```tsx
<NombreComponente variant="primary" size="md">
  {t('feature.action')}
</NombreComponente>
```

## Checklist

- [ ] Story con todas las variantes y estados, en claro y oscuro
- [ ] Test de comportamiento accesible
- [ ] axe sin violaciones
- [ ] Snapshot visual registrado
- [ ] `forwardRef` y props nativas propagadas
- [ ] `className` componible con `cn`
- [ ] Sin dependencia del dominio (si vive en `packages/ui`)
- [ ] Sin literales de texto
- [ ] Impacto en bundle medido
- [ ] Changeset si es publicable
