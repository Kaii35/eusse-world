'use client'

import { useEffect } from 'react'

const SCROLLED_AFTER_PX = 24

/**
 * Marca `data-scrolled` en <html> para que la barra se condense en vidrio
 * (variante `scrolled` de landing-theme.css). Un rAF por frame de scroll como máximo.
 */
export function useScrolledFlag(): void {
  useEffect(() => {
    const root = document.documentElement
    let pending = false

    const update = () => {
      pending = false
      root.dataset.scrolled = String(window.scrollY > SCROLLED_AFTER_PX)
    }

    const onScroll = () => {
      if (pending) return
      pending = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      delete root.dataset.scrolled
    }
  }, [])
}

/**
 * Foco de luz de las tarjetas [data-spotlight]: un solo listener delegado escribe la
 * posición del puntero en --spot-x/--spot-y. Sólo en dispositivos con hover real.
 */
export function useSpotlight(): void {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return

    const onMove = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      const card = event.target.closest<HTMLElement>('[data-spotlight]')
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${String(event.clientX - rect.left)}px`)
      card.style.setProperty('--spot-y', `${String(event.clientY - rect.top)}px`)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
    }
  }, [])
}
