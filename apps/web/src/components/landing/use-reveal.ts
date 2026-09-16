'use client'

import { useEffect } from 'react'

const SELECTOR = '[data-reveal], [data-reveal-line]'
const STAGGER_MS = 90

/**
 * Revela los [data-reveal] y [data-reveal-line] al entrar en viewport, una sola vez
 * (RFC-0009 §4.4). No devuelve estado: escribe un atributo y el CSS hace el resto.
 *
 * Los hermanos que entran juntos se escalonan por su posición. El retraso se retira al
 * terminar, para que no frene después las transiciones de hover del mismo elemento.
 */
export function useReveal(): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR))
    if (nodes.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => {
        node.setAttribute('data-shown', 'true')
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const node = entry.target as HTMLElement
          const siblings = Array.from(node.parentElement?.children ?? []).filter((child) =>
            child.hasAttribute('data-reveal'),
          )
          const position = Math.max(0, siblings.indexOf(node))
          node.style.setProperty('--reveal-delay', `${String((position % 6) * STAGGER_MS)}ms`)
          node.addEventListener(
            'transitionend',
            () => {
              node.style.removeProperty('--reveal-delay')
            },
            { once: true },
          )
          node.setAttribute('data-shown', 'true')
          observer.unobserve(node)
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    )

    nodes.forEach((node) => {
      observer.observe(node)
    })
    return () => {
      observer.disconnect()
    }
  }, [])
}
