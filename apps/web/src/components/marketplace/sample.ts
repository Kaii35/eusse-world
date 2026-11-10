/**
 * Pedidos de ejemplo para las pantallas que todavía no tienen API (pedidos del comerciante y
 * órdenes del proveedor). Sólo llevan identificadores, fechas y cifras; los nombres se
 * traducen con next-intl y cada pantalla los marca como vista previa. Ningún importe de
 * aquí se usa para cobrar ni para calcular un precio real.
 */

/** Estados del pedido, en orden. Cada índice es un paso del seguimiento. */
export const ORDER_STEPS = ['new', 'confirmed', 'production', 'shipped'] as const
export type OrderStep = (typeof ORDER_STEPS)[number]

export type SampleOrder = {
  id: string
  /** Claves de nombre de ejemplo (marketplace.sample.*), traducidas por la pantalla. */
  merchantKey: 'merchantA' | 'merchantB' | 'merchantC'
  supplierKey: 'supplierA' | 'supplierB'
  date: string
  step: number
  units: number
  /** Importe en la menor unidad (centavos), como la API. */
  totalMinor: number
  currency: 'COP'
}

export const SAMPLE_ORDERS: SampleOrder[] = [
  {
    id: 'EW-10482',
    merchantKey: 'merchantA',
    supplierKey: 'supplierA',
    date: '2026-11-08',
    step: 0,
    units: 12,
    totalMinor: 11880000,
    currency: 'COP',
  },
  {
    id: 'EW-10479',
    merchantKey: 'merchantB',
    supplierKey: 'supplierB',
    date: '2026-11-07',
    step: 1,
    units: 18,
    totalMinor: 7440000,
    currency: 'COP',
  },
  {
    id: 'EW-10471',
    merchantKey: 'merchantC',
    supplierKey: 'supplierA',
    date: '2026-11-05',
    step: 2,
    units: 24,
    totalMinor: 9660000,
    currency: 'COP',
  },
  {
    id: 'EW-10433',
    merchantKey: 'merchantA',
    supplierKey: 'supplierB',
    date: '2026-10-28',
    step: 3,
    units: 18,
    totalMinor: 8640000,
    currency: 'COP',
  },
]
