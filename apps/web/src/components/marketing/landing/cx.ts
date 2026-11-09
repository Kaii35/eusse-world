/**
 * Une clases de CSS Modules. No usa `cn()` de @eusse/ui a propósito: aquí no hay clases
 * de Tailwind que fusionar y `tailwind-merge` añadiría ~20 KB al JS de la landing.
 */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
