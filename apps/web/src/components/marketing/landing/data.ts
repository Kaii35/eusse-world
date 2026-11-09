/**
 * Datos estructurales de la landing: identificadores, coordenadas y orden.
 * Los textos visibles viven en `messages/*.json` bajo `landing.*`.
 */

export type CountryCode = 'CO' | 'CR' | 'NI' | 'US'

export type Hub = {
  country: CountryCode
  /** Código IATA del aeropuerto de referencia. */
  iata: string
  lat: number
  lng: number
}

export const HUBS: readonly Hub[] = [
  { country: 'CO', iata: 'BOG', lat: 4.71, lng: -74.07 },
  { country: 'CR', iata: 'SJO', lat: 9.93, lng: -84.08 },
  { country: 'NI', iata: 'MGA', lat: 12.13, lng: -86.25 },
  { country: 'US', iata: 'MIA', lat: 25.76, lng: -80.19 },
]

/** Rutas del globo como pares de índices de `HUBS`. */
export const ROUTES: readonly (readonly [number, number])[] = [
  [0, 3],
  [1, 3],
  [2, 3],
  [0, 1],
  [1, 2],
  [0, 2],
]

export const HIGHLIGHTS = ['coverage', 'modes', 'doorToDoor', 'advisor'] as const

export const ABOUT_POINTS = ['business', 'opportunities', 'trust'] as const

export const CONTACT_POINTS = ['response', 'coverage', 'proposal'] as const

export const SERVICES = [
  'transport',
  'trade',
  'personalShopper',
  'sourcing',
  'warehousing',
  'lastMile',
] as const

export type ServiceKey = (typeof SERVICES)[number]

export type NetworkTag = 'import' | 'export' | 'distribution' | 'purchasing' | 'consolidation'

export const NETWORK_TAGS: Record<CountryCode, readonly NetworkTag[]> = {
  CO: ['import', 'export', 'distribution'],
  CR: ['import', 'export', 'distribution'],
  NI: ['import', 'export', 'distribution'],
  US: ['purchasing', 'consolidation', 'export'],
}

export const PROCESS_STEPS = ['quote', 'purchase', 'transit', 'delivery'] as const

/** Orden de los selectores del formulario: el origen más habitual primero. */
export const ORIGINS: readonly CountryCode[] = ['US', 'CO', 'CR', 'NI']
export const DESTINATIONS: readonly CountryCode[] = ['CO', 'CR', 'NI', 'US']

export const SECTION_IDS = {
  main: 'contenido',
  services: 'servicios',
  network: 'red',
  process: 'proceso',
  contact: 'contacto',
} as const

/** Formatea coordenadas como "04.71°N · 74.07°W". */
export function formatCoords({ lat, lng }: Pick<Hub, 'lat' | 'lng'>): string {
  const part = (value: number, positive: string, negative: string): string =>
    `${Math.abs(value).toFixed(2).padStart(5, '0')}°${value >= 0 ? positive : negative}`
  return `${part(lat, 'N', 'S')} · ${part(lng, 'E', 'W')}`
}

export const SERVICE_FEATURES = ['f1', 'f2', 'f3'] as const

/** Servicios del grid con tamaño estándar; `transport` y `lastMile` tienen tarjeta propia. */
export const STANDARD_SERVICES = ['trade', 'personalShopper', 'sourcing', 'warehousing'] as const

export const TRANSPORT_MODES = ['air', 'sea', 'land'] as const

export const LAST_MILE_STAGES = ['warehouse', 'transit', 'delivered'] as const

export const PLANNER_INCLUDES = ['purchase', 'customs', 'tracking', 'delivery'] as const

/**
 * Mapa del planificador: diagrama esquemático (como un plano de metro), no geográfico.
 * San José y Managua están a 300 km: a escala real se solaparían. Se conserva la
 * orientación relativa (Miami al norte, Bogotá al sureste).
 */
export const PLANNER_MAP = { width: 420, height: 360 }

const PLANNER_POSITIONS: Record<CountryCode, { x: number; y: number }> = {
  US: { x: 330, y: 64 },
  NI: { x: 72, y: 150 },
  CR: { x: 160, y: 280 },
  CO: { x: 350, y: 292 },
}

export function projectHub({ country }: Pick<Hub, 'country'>): { x: number; y: number } {
  return PLANNER_POSITIONS[country]
}

/**
 * Arco entre dos puntos: el control se desplaza en perpendicular a la ruta, siempre
 * hacia arriba, así cualquier par (también los casi verticales) traza una curva limpia.
 * Lo comparten el servidor y `planner.ts`.
 */
export function arcPath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  let nx = -dy / length
  let ny = dx / length
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const bend = length * 0.28
  const cx = Math.round((a.x + b.x) / 2 + nx * bend)
  const cy = Math.round((a.y + b.y) / 2 + ny * bend)
  return `M${String(a.x)} ${String(a.y)} Q${String(cx)} ${String(cy)} ${String(b.x)} ${String(b.y)}`
}

/** Identificadores de anclaje CSS que cobe expone (`--cobe-bog`, `--cobe-visible-bog`). */
export const globeMarkerId = (iata: string): string => iata.toLowerCase()
export const GLOBE_ROUTE_ARC_ID = 'route'
