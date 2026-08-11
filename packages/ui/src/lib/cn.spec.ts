import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('debería combinar clases', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('debería resolver conflictos quedándose con la última', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('debería permitir que el consumidor sobrescriba', () => {
    // Sin esto haría falta !important, que es señal de mala composición.
    expect(cn('w-auto', 'w-full')).toBe('w-full')
  })

  it('debería ignorar valores falsos', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2')
  })

  describe('escala tipográfica propia', () => {
    /**
     * Regresión de un fallo real: tailwind-merge no conocía `text-body-lg`, lo trataba
     * como color de texto y **eliminaba `text-primary-foreground`**. El botón primario
     * quedaba con texto oscuro sobre azul, 3.68:1, por debajo de WCAG AA.
     */
    it('NO debería eliminar el color de texto al combinarlo con un tamaño', () => {
      const result = cn('text-primary-foreground', 'text-body-lg')

      expect(result).toContain('text-primary-foreground')
      expect(result).toContain('text-body-lg')
    })

    it('debería mantener color y tamaño en cualquier orden', () => {
      const result = cn('text-body-sm', 'text-danger')

      expect(result).toContain('text-body-sm')
      expect(result).toContain('text-danger')
    })

    it.each(['caption', 'body-sm', 'body', 'body-lg', 'h4', 'h3', 'h2', 'h1', 'display'])(
      'debería reconocer text-%s como tamaño, no como color',
      (size) => {
        const result = cn('text-foreground', `text-${size}`)

        expect(result).toContain('text-foreground')
        expect(result).toContain(`text-${size}`)
      },
    )

    it('debería seguir resolviendo conflictos entre dos tamaños', () => {
      expect(cn('text-body-sm', 'text-body-lg')).toBe('text-body-lg')
    })

    it('debería seguir resolviendo conflictos entre dos colores', () => {
      expect(cn('text-foreground', 'text-danger')).toBe('text-danger')
    })
  })
})
