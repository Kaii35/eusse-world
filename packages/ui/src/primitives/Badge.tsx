import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../lib/cn'

import type { ComponentPropsWithoutRef } from 'react'

export const badgeVariants = cva(
  'text-caption inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-sunken text-muted-foreground',
        success: 'bg-success-subtle text-success-subtle-foreground',
        warning: 'bg-warning-subtle text-warning-subtle-foreground',
        danger: 'bg-danger-subtle text-danger-subtle-foreground',
        info: 'bg-info-subtle text-info-subtle-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export type BadgeProps = ComponentPropsWithoutRef<'span'> & VariantProps<typeof badgeVariants>

/**
 * Etiqueta de estado.
 *
 * REGLA: la informacion nunca depende solo del color (WCAG 1.4.1). Un badge de estado
 * lleva SIEMPRE texto; si ademas lleva icono, mejor. Cualquiera de los tres canales
 * debe bastar para entenderlo.
 */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
