# Skill — Design System

## Objetivo

Un solo sistema visual, accesible y versionado, que haga que `apps/web` y `apps/admin` se
sientan el mismo producto y que construir una pantalla nueva sea ensamblar, no inventar.

> **Antes de trabajar, invoca la skill `ui-ux-pro-max`** para paletas, tipografía y
> estilos. Inspira; **`@eusse/tokens` decide**.

## Buenas prácticas

- **Tokens semánticos, no literales.** `--color-primary`, no `--color-blue-600`. El
  componente no debe saber que el primario es azul.
- **Dos temas simultáneos.** Un token sin par oscuro no existe.
- **Contraste verificado por test**, no por buen ojo.
- **Radix como base** de todo componente interactivo. Accesibilidad resuelta por gente que
  lleva años en ello.
- **CVA para variantes**, tipadas y exhaustivas.
- **`forwardRef` + props nativas + `asChild`** en todo primitivo.
- **Regla de las dos apariciones**: un componente sube a `@eusse/ui` cuando ya se usa en
  dos sitios y es agnóstico del dominio. Antes, vive en la app.
- **Story por variante y estado.** El Storybook es el catálogo y la documentación.

## Errores comunes

| Error | Consecuencia |
| ----- | ------------ |
| Tokens literales (`--blue-500`) | Cambiar la marca implica tocar 200 archivos |
| Token sin par oscuro | El modo oscuro se rompe de forma silenciosa |
| Contraste "a ojo" | Falla WCAG y nadie se entera hasta la auditoría |
| Componente que conoce el dominio | Deja de ser reutilizable |
| Reimplementar un `Select` accesible | Meses de bugs de teclado y ARIA |
| Variantes con strings concatenados | Imposible de tipar y de auditar |
| Promover a `@eusse/ui` en la primera aparición | API equivocada, congelada demasiado pronto |
| Cambio rompedor sin changeset | Consumidores rotos sin aviso |

## Patrones

**Tokens en capas**

```
/* 1. Primitivos — sólo los usa la capa semántica */
--blue-600: oklch(0.55 0.18 250);
/* 2. Semánticos — los usan los componentes */
--color-primary: var(--blue-600);
--color-primary-foreground: var(--white);
/* 3. De componente — sólo donde el componente lo exija */
--button-primary-bg: var(--color-primary);
```

Cambiar de marca toca la capa 1. Los componentes ni se enteran.

**Variantes con CVA**

```
const button = cva('inline-flex items-center justify-center rounded-md ...', {
  variants: {
    variant: { primary: '...', secondary: '...', ghost: '...', danger: '...' },
    size:    { sm: '...', md: '...', lg: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})
```

**Primitivo polimórfico**

```
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  },
)
```

**Test de contraste**

```
it('todos los pares texto/fondo cumplen AA en ambos temas', () => {
  for (const [fg, bg] of TOKEN_PAIRS) {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  }
})
```

**Vidrio como token**, no como clases sueltas: `--surface-glass-bg`, `--surface-glass-blur`,
`--surface-glass-border`, con fallback sólido.

## Antipatrones

- **Valores mágicos** (`p-[13px]`, `text-[#1a2b3c]`): la deriva empieza así.
- **Componente que importa `@eusse/domain`**: deja de ser un sistema de diseño.
- **`!important` para sobrescribir**: señal de mala composición.
- **Un componente por caso de uso** (`ProductCardWithPriceAndBadge`): explosión combinatoria.
- **CSS-in-JS en runtime**: coste en cada render.
- **`z-index` a mano**: guerra de capas garantizada.
- **Modo oscuro como filtro de inversión**: se ve mal y rompe imágenes.

## Ejemplos

**Bien**

```
<Button variant="primary" size="lg" asChild>
  <Link href="/register">Crear cuenta mayorista</Link>
</Button>
```

Accesible, tokenizado, polimórfico, tipado.

**Mal**

```
<div className="bg-[#0f62fe] text-white px-[18px] py-[9px] rounded-[7px] cursor-pointer"
     onClick={handleClick}>
  Crear cuenta
</div>
```

No es un botón (sin teclado, sin rol, sin foco), y cinco valores mágicos.

## Convenciones

- `packages/ui/src/primitives/` — Button, Input, Select, Dialog, Sheet, Tooltip, Toast…
- `packages/ui/src/patterns/` — DataTable, FormField, EmptyState, PageHeader…
- `packages/ui/src/motion/` — FadeIn, ScrollReveal, Stagger
- Export nombrado; sin barrels internos.
- Props extienden las del elemento nativo.
- Un changeset por cambio publicable.
- Story: `<Component>.stories.tsx` junto al componente.

## Checklist

- [ ] Tokens semánticos, con par claro/oscuro
- [ ] Contraste AA verificado por test en ambos temas
- [ ] Basado en Radix si es interactivo
- [ ] Variantes con CVA, tipadas
- [ ] `forwardRef` y props nativas propagadas
- [ ] `className` componible con `cn`
- [ ] `asChild` donde tenga sentido
- [ ] Sin dependencia del dominio
- [ ] Story con todas las variantes y estados, en ambos temas
- [ ] Test de comportamiento accesible
- [ ] Snapshot visual registrado
- [ ] Changeset con notas de migración si rompe
- [ ] Impacto en bundle medido
- [ ] Documentado cuándo usarlo y cuándo no

## Plantillas

[`templates/component.md`](../templates/component.md) ·
[`docs/12-ux-guidelines.md`](../docs/12-ux-guidelines.md) ·
[`skills/accessibility.md`](accessibility.md)
