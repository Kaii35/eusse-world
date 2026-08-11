import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Escala tipográfica de @eusse/tokens.
 *
 * Hay que DECLARÁRSELA a tailwind-merge. Si no, no sabe que `text-body-lg` es un tamaño
 * de fuente y lo agrupa con los colores de texto: al combinar
 * `text-primary-foreground` (color) con `text-body-lg` (tamaño), se queda con el último
 * y **elimina el color en silencio**.
 *
 * Ocurrió de verdad: el botón primario quedó con texto oscuro sobre azul, 3.68:1, por
 * debajo de WCAG AA. Los tests de contraste de los tokens pasaban —los tokens estaban
 * bien—; lo que fallaba era la composición.
 */
const FONT_SIZES = [
  'caption',
  'body-sm',
  'body',
  'body-lg',
  'h4',
  'h3',
  'h2',
  'h1',
  'display',
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZES] }],
    },
  },
})

/**
 * Compone clases de Tailwind resolviendo conflictos.
 *
 * Es lo que permite que el consumidor sobrescriba: `cn(button({ variant }), className)`.
 * Sin esto haría falta `!important`, que es señal de mala composición
 * (skills/design-system.md).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
