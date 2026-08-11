import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contrastRatioOklch, WCAG_AA_LARGE, WCAG_AA_NORMAL, WCAG_AA_UI } from './contrast'

/**
 * Puerta de accesibilidad del design system (RFC-0008 §4.6).
 *
 * Si un par texto/fondo baja del umbral, ESTE TEST ROMPE EL BUILD.
 * Es la diferencia entre "creemos que es accesible" y "es accesible".
 */

// Los comentarios se eliminan antes de parsear: si no, la primera declaración
// que sigue a un comentario se pierde al dividir por ';'.
const themeCss = readFileSync(join(__dirname, 'theme.css'), 'utf-8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/** Extrae las variables CSS del bloque cuyo selector coincide. */
function readBlock(selector: string): Map<string, string> {
  // Busca `selector { ... }` (o `@theme { ... }`) y captura sus declaraciones.
  const pattern = new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`, 'g')
  const vars = new Map<string, string>()
  let match: RegExpExecArray | null
  while ((match = pattern.exec(themeCss)) !== null) {
    const body = match[1] ?? ''
    for (const decl of body.split(';')) {
      const [rawName, ...rest] = decl.split(':')
      const name = rawName?.trim()
      const value = rest.join(':').trim()
      if (name?.startsWith('--') && value) vars.set(name, value)
    }
  }
  return vars
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const primitives = readBlock(':root')
const lightSemantic = readBlock('@theme')
const darkSemantic = readBlock('.dark')

/** Resuelve `var(--x)` hasta llegar a un `oklch(...)` literal. */
function resolve(token: string, theme: 'light' | 'dark'): string {
  const semantic = theme === 'light' ? lightSemantic : darkSemantic
  let value = semantic.get(token) ?? lightSemantic.get(token)
  if (!value) throw new Error(`Token no encontrado en tema ${theme}: ${token}`)

  for (let depth = 0; depth < 5; depth += 1) {
    const varMatch = /^var\((--[\w-]+)\)$/.exec(value.trim())
    if (!varMatch) return value.trim()
    const referenced = varMatch[1]
    if (!referenced) break
    const next = primitives.get(referenced) ?? semantic.get(referenced)
    if (!next) throw new Error(`Primitivo no encontrado: ${referenced} (desde ${token})`)
    value = next
  }
  return value.trim()
}

/** Pares que DEBEN cumplir AA. Añadir un token de color obliga a añadirlo aquí. */
const TEXT_PAIRS: [fg: string, bg: string, label: string][] = [
  ['--color-foreground', '--color-background', 'texto principal sobre fondo'],
  ['--color-foreground', '--color-surface', 'texto principal sobre superficie'],
  ['--color-foreground', '--color-surface-raised', 'texto principal sobre superficie elevada'],
  ['--color-muted-foreground', '--color-background', 'texto atenuado sobre fondo'],
  ['--color-muted-foreground', '--color-surface', 'texto atenuado sobre superficie'],
  ['--color-primary-foreground', '--color-primary', 'texto sobre primario'],
  ['--color-primary-subtle-foreground', '--color-primary-subtle', 'texto sobre primario sutil'],
  ['--color-accent-foreground', '--color-accent', 'texto sobre acento'],
  ['--color-success-foreground', '--color-success', 'texto sobre éxito'],
  ['--color-success-subtle-foreground', '--color-success-subtle', 'texto sobre éxito sutil'],
  ['--color-warning-foreground', '--color-warning', 'texto sobre aviso'],
  ['--color-warning-subtle-foreground', '--color-warning-subtle', 'texto sobre aviso sutil'],
  ['--color-danger-foreground', '--color-danger', 'texto sobre peligro'],
  ['--color-danger-subtle-foreground', '--color-danger-subtle', 'texto sobre peligro sutil'],
  ['--color-info-foreground', '--color-info', 'texto sobre info'],
  ['--color-info-subtle-foreground', '--color-info-subtle', 'texto sobre info sutil'],
]

/** Elementos de interfaz y foco: umbral 3:1. */
const UI_PAIRS: [fg: string, bg: string, label: string][] = [
  ['--color-ring', '--color-background', 'anillo de foco sobre fondo'],
  ['--color-ring', '--color-surface', 'anillo de foco sobre superficie'],
  ['--color-border-strong', '--color-background', 'borde fuerte sobre fondo'],
  ['--color-primary', '--color-background', 'primario sobre fondo (iconos, enlaces)'],
  ['--color-danger', '--color-background', 'peligro sobre fondo'],
]

describe.each(['light', 'dark'] as const)('contraste — tema %s', (theme) => {
  it.each(TEXT_PAIRS)('%s / %s → AA para texto normal (%s)', (fg, bg) => {
    const ratio = contrastRatioOklch(resolve(fg, theme), resolve(bg, theme))
    expect(
      ratio,
      `${fg} sobre ${bg} en tema ${theme}: ${ratio.toFixed(2)}:1 (mínimo ${WCAG_AA_NORMAL}:1)`,
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL)
  })

  it.each(UI_PAIRS)('%s / %s → AA para elementos de UI (%s)', (fg, bg) => {
    const ratio = contrastRatioOklch(resolve(fg, theme), resolve(bg, theme))
    expect(
      ratio,
      `${fg} sobre ${bg} en tema ${theme}: ${ratio.toFixed(2)}:1 (mínimo ${WCAG_AA_UI}:1)`,
    ).toBeGreaterThanOrEqual(WCAG_AA_UI)
  })
})

describe('todo token semántico tiene par en el tema opuesto', () => {
  it('no hay tokens de color definidos sólo en claro', () => {
    const lightColors = [...lightSemantic.keys()].filter((k) => k.startsWith('--color-'))
    const darkColors = new Set([...darkSemantic.keys()].filter((k) => k.startsWith('--color-')))
    const missing = lightColors.filter((token) => !darkColors.has(token))
    expect(missing, `Tokens sin par oscuro: ${missing.join(', ')}`).toEqual([])
  })

  it('no hay tokens de color definidos sólo en oscuro', () => {
    const darkColors = [...darkSemantic.keys()].filter((k) => k.startsWith('--color-'))
    const lightColors = new Set([...lightSemantic.keys()].filter((k) => k.startsWith('--color-')))
    const extra = darkColors.filter((token) => !lightColors.has(token))
    expect(extra, `Tokens sólo en oscuro: ${extra.join(', ')}`).toEqual([])
  })
})

describe('conversión de color', () => {
  it('devuelve 21:1 entre blanco y negro puros', () => {
    expect(contrastRatioOklch('oklch(1 0 0)', 'oklch(0 0 0)')).toBeCloseTo(21, 1)
  })

  it('devuelve 1:1 para el mismo color', () => {
    expect(contrastRatioOklch('oklch(0.546 0.198 258)', 'oklch(0.546 0.198 258)')).toBeCloseTo(1, 5)
  })

  it('rechaza un color mal formado', () => {
    expect(() => contrastRatioOklch('#ff0000', 'oklch(1 0 0)')).toThrow()
  })

  it('el umbral de texto grande es menor que el de texto normal', () => {
    expect(WCAG_AA_LARGE).toBeLessThan(WCAG_AA_NORMAL)
  })
})
