import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn } from '../lib/cn'

/**
 * Variantes con CVA, no con concatenación de strings condicionales: así son tipadas,
 * exhaustivas y auditables (skills/design-system.md).
 *
 * CERO valores arbitrarios: todo sale de @eusse/tokens. Si falta un token, se añade
 * allí; no se inventa aquí (ADR-0010).
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium transition-colors',
    // Foco siempre visible, con contraste >= 3:1 (WCAG 2.2 AA)
    'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    // El icono no debe capturar el clic ni el foco
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'bg-surface-raised text-foreground border-border-strong hover:bg-surface-sunken border',
        ghost: 'text-foreground hover:bg-surface-raised',
        danger: 'bg-danger text-danger-foreground hover:opacity-90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'text-body-sm h-8 rounded-sm px-3 [&_svg]:size-4',
        md: 'text-body h-10 rounded-md px-4 [&_svg]:size-4',
        lg: 'text-body-lg h-12 rounded-md px-6 [&_svg]:size-5',
        icon: 'size-10 rounded-md [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    /**
     * Renderiza el hijo en lugar de un `<button>`, conservando estilos y accesibilidad.
     * Para envolver un `<Link>` sin anidar un botón dentro de un enlace.
     */
    asChild?: boolean
    /** Muestra estado de carga y bloquea la interacción. Evita el doble envío. */
    isLoading?: boolean
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, isLoading = false, disabled, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      // `aria-busy` anuncia el estado de carga al lector de pantalla; `disabled` impide
      // el segundo clic, que es la causa numero uno de ordenes duplicadas (riesgo R-04).
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      // El tipo por defecto de <button> dentro de un <form> es "submit": explicitarlo
      // evita envios accidentales.
      type={asChild ? undefined : (props.type ?? 'button')}
      {...props}
    >
      {children}
    </Comp>
  )
})
