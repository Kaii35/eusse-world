import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
