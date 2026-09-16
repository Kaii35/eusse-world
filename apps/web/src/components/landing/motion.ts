/**
 * Clases de retraso escalonado escritas enteras: Tailwind sólo genera las clases que
 * encuentra literalmente en el código, nunca las construidas con plantillas.
 */
const RISE_DELAYS = [
  'rise-delay-0',
  'rise-delay-1',
  'rise-delay-2',
  'rise-delay-3',
  'rise-delay-4',
  'rise-delay-5',
  'rise-delay-6',
  'rise-delay-7',
  'rise-delay-8',
  'rise-delay-9',
  'rise-delay-10',
  'rise-delay-11',
  'rise-delay-12',
  'rise-delay-13',
  'rise-delay-14',
  'rise-delay-15',
  'rise-delay-16',
  'rise-delay-17',
  'rise-delay-18',
] as const

/** Clase de retraso para el paso `step` (110 ms por paso), acotada a la tabla. */
export const riseDelay = (step: number): string =>
  RISE_DELAYS[Math.min(Math.max(step, 0), RISE_DELAYS.length - 1)] ?? 'rise-delay-0'
