/**
 * Muestra visual de un color por su nombre. Es sólo presentación: la API guarda el nombre y
 * ningún precio depende de este mapa. Un nombre desconocido cae en un gris neutro.
 */
const SWATCHES: Record<string, string> = {
  negro: '#1d1f20',
  blanco: '#f4f4f2',
  gris: '#a7a9ac',
  'gris jaspe': '#a7a9ac',
  marino: '#26344b',
  'azul marino': '#26344b',
  arena: '#d8c7a6',
  oliva: '#5d6b3f',
  'verde oliva': '#5d6b3f',
  vino: '#6b2737',
  cielo: '#a9c8e6',
  'azul cielo': '#a9c8e6',
  indigo: '#2f4466',
  índigo: '#2f4466',
  'azul clásico': '#4f6f96',
  clasico: '#4f6f96',
  caqui: '#a8946a',
  rojo: '#a8323e',
  verde: '#4d7a5a',
  amarillo: '#e3c35a',
  naranja: '#d9793b',
  rosa: '#e5a7b8',
}

const FALLBACK = '#c4c6c9'

export function swatchFor(name: string): string {
  return SWATCHES[name.trim().toLowerCase()] ?? FALLBACK
}

/** Color del texto que se lee sobre la muestra: claro sobre tonos oscuros, oscuro sobre claros. */
export function readableOn(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const luminance =
    (0.299 * (value >> 16) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255
  return luminance > 0.6 ? '#1d1f20' : '#f4f4f2'
}
