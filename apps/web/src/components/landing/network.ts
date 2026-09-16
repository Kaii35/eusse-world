import type { GlobeConnection, GlobeMarker } from './InteractiveGlobe'

/**
 * Red de operación: nodos, corredores y mercados en expansión. Única fuente para el
 * globo del hero, la cinta de corredores y el mapa de rutas. Los nombres visibles
 * salen de `landing.routes`; aquí sólo hay datos (código IATA y coordenadas).
 */
export const HUBS = {
  miami: { code: 'MIA', lat: 25.76, lng: -80.19, labelSide: 'right' },
  managua: { code: 'MGA', lat: 12.11, lng: -86.24, labelSide: 'left' },
  sanJose: { code: 'SJO', lat: 9.93, lng: -84.08, labelSide: 'right' },
  medellin: { code: 'MDE', lat: 6.25, lng: -75.56, labelSide: 'right' },
} as const

export type HubKey = keyof typeof HUBS

export const HUB_KEYS = Object.keys(HUBS) as HubKey[]

/** Corredores activos entre nodos. */
export const CORRIDORS: [HubKey, HubKey][] = [
  ['miami', 'medellin'],
  ['miami', 'sanJose'],
  ['miami', 'managua'],
  ['managua', 'sanJose'],
  ['sanJose', 'medellin'],
]

/** Mercados en expansión: se marcan en el globo, sin etiqueta. */
const EXPANSION = {
  mexicoCity: [19.43, -99.13],
  newYork: [40.71, -74.01],
  lima: [-12.05, -77.04],
} as const

export const EXPANSION_MARKERS: GlobeMarker[] = Object.values(EXPANSION).map(([lat, lng]) => ({
  lat,
  lng,
}))

const at = (hub: HubKey) => [HUBS[hub].lat, HUBS[hub].lng] as const

export const NETWORK_CONNECTIONS: GlobeConnection[] = [
  ...CORRIDORS.map(([from, to]) => ({ from: at(from), to: at(to) })),
  { from: at('miami'), to: EXPANSION.newYork },
  { from: at('miami'), to: EXPANSION.mexicoCity },
  { from: at('medellin'), to: EXPANSION.lima },
]

/** Lienzo del mapa punteado (public/maps/americas-dots.svg). */
export const MAP_VIEWBOX = { width: 95, height: 80 } as const

/**
 * Coordenadas de cada lugar dentro del mapa punteado, en unidades del viewBox. Salen de
 * dotted-map (getPoints) con la misma región y rejilla que generó el SVG, así que caen
 * exactamente sobre un punto de tierra.
 */
export const MAP_POINTS = {
  miami: [37, 30.31],
  managua: [33, 40.7],
  sanJose: [34.5, 41.57],
  medellin: [40, 44.17],
  newYork: [41, 18.19],
  mexicoCity: [24, 35.51],
  lima: [39.5, 57.16],
} as const

export type MapPlace = keyof typeof MAP_POINTS

/** Arcos del mapa: corredores activos y, más tenues, los de expansión. */
export const MAP_ARCS: { from: MapPlace; to: MapPlace; expansion?: boolean }[] = [
  ...CORRIDORS.map(([from, to]) => ({ from, to })),
  { from: 'miami', to: 'newYork', expansion: true },
  { from: 'miami', to: 'mexicoCity', expansion: true },
  { from: 'medellin', to: 'lima', expansion: true },
]
