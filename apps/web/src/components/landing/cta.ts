import { cn } from '@eusse/ui'

type CtaVariant = 'brand' | 'ghost'

const BASE =
  'group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-body-sm font-semibold transition duration-300 ease-out-soft focus-visible:outline-offset-4 active:scale-98 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-300'

const VARIANTS: Record<CtaVariant, string> = {
  brand: 'bg-brand text-on-night shadow-brand hover:bg-brand-strong hover:-translate-y-0.5',
  ghost:
    'border border-line-strong text-ink hover:border-brand/60 hover:bg-brand-tint hover:-translate-y-0.5',
}

/**
 * Estilo de los botones de la landing: píldora azul o fantasma. Es una función de
 * clases, no un componente, para aplicarlo igual a <a> y a <button>.
 */
export const ctaClass = (variant: CtaVariant, className?: string): string =>
  cn(BASE, VARIANTS[variant], className)
