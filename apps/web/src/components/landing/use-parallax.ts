'use client'

import { useEffect } from 'react'

/**
 * Parallax por atributo: [data-parallax="0.18"] es el factor de velocidad.
 * Sólo transform, un rAF por frame de scroll, desactivado en móvil y con
 * prefers-reduced-motion (RFC-0009 §4.4).
 */
export function useParallax(): void {
  useEffect(() => {
    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    if (layers.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    let pending = false

    const update = () => {
      pending = false
      const viewport = window.innerHeight
      layers.forEach((layer) => {
        const rect = layer.getBoundingClientRect()
        const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
        const speed = Number.parseFloat(layer.dataset.parallax ?? '0')
        layer.style.transform = 'translate3d(0,' + (progress * speed * 220).toFixed(2) + 'px,0)'
      })
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
    }
  }, [])
}
