/**
 * Movimiento de la landing: un único bucle rAF, sólo `transform` y `opacity`.
 *
 * Reglas (RFC-0009 §4.4, ADR-0016):
 *  - El contenido es visible sin JS: los estados iniciales ocultos los pone ESTE script.
 *  - El h1 no lleva `data-intro`: es el LCP y no espera a ninguna animación.
 *  - `prefers-reduced-motion`: sin desplazamientos; a lo sumo opacidad.
 *  - El globo sólo responde al puntero en escritorio.
 *
 * CSS + rAF en lugar de Motion: son tres efectos ligados a scroll y puntero, y Motion
 * añadiría peso sin aportar orquestación (ADR-0016, criterio de revisión).
 */

import { initRoutePlanner } from './planner'

export type GlobeHandle = {
  setPointer: (x: number, y: number) => void
  setScroll: (progress: number) => void
  dispose: () => void
}

export type GlobeModule = {
  createGlobe: (el: HTMLElement, options: { reducedMotion: boolean }) => GlobeHandle | null
}

const EASE = 'cubic-bezier(.16,1,.3,1)'

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value))

export function initLandingMotion(
  root: HTMLElement,
  loadGlobe: () => Promise<GlobeModule>,
): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  let disposed = false
  let globe: GlobeHandle | null = null
  let raf = 0

  // ── Globo: diferido, nunca en el JS inicial ──────────────────────────────
  const globeEl = root.querySelector<HTMLElement>('[data-globe]')
  if (globeEl) {
    loadGlobe()
      .then((module) => {
        if (!disposed) globe = module.createGlobe(globeEl, { reducedMotion: reduce })
      })
      .catch(() => {
        // Sin WebGL o sin red: el hero sigue completo con la esfera de respaldo.
      })
  }

  // ── Entrada del hero, escalonada ─────────────────────────────────────────
  if (!reduce) {
    root.querySelectorAll<HTMLElement>('[data-intro]').forEach((el, i) => {
      const delay = 80 + i * 90
      el.style.opacity = '0'
      el.style.transform = 'translate3d(0,16px,0)'
      el.style.transition = `opacity .7s ${EASE} ${delay}ms, transform .7s ${EASE} ${delay}ms`
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.style.opacity = '1'
          el.style.transform = 'none'
        }),
      )
    })
  }

  // ── Revelado al scroll, una sola vez ─────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.style.opacity = '1'
        el.style.transform = 'none'
        observer.unobserve(el)
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
  )
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return
    const delay = Number(el.dataset.delay ?? 0)
    el.style.opacity = '0'
    if (reduce) {
      el.style.transition = `opacity .4s ease ${delay}ms`
    } else {
      el.style.transform = 'translate3d(0,16px,0)'
      el.style.transition = `opacity .6s ${EASE} ${delay}ms, transform .6s ${EASE} ${delay}ms`
    }
    observer.observe(el)
  })

  // ── Cabecera transparente sólo sobre el hero; globo con puntero y scroll ─
  const nav = root.querySelector<HTMLElement>('[data-nav]')
  let pointerX = 0
  let pointerY = 0
  let smoothX = 0
  let smoothY = 0
  let atTop: boolean | null = null

  const onPointerMove = (event: PointerEvent): void => {
    pointerX = event.clientX / window.innerWidth - 0.5
    pointerY = event.clientY / window.innerHeight - 0.5
  }
  if (finePointer && !reduce) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
  }

  // Foco de luz de las tarjetas: sólo actualiza dos variables CSS; no hay desplazamiento.
  const onSpotlight = (event: PointerEvent): void => {
    const card = (event.target as Element | null)?.closest<HTMLElement>('[data-spotlight]')
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${String(event.clientX - rect.left)}px`)
    card.style.setProperty('--my', `${String(event.clientY - rect.top)}px`)
  }
  if (finePointer) root.addEventListener('pointermove', onSpotlight, { passive: true })

  // ── Línea de tiempo del proceso: se llena con el scroll y marca el paso en lectura ─
  const process = root.querySelector<HTMLElement>('[data-process]')
  const processFill = root.querySelector<HTMLElement>('[data-process-fill]')
  const processSteps = Array.from(root.querySelectorAll<HTMLElement>('[data-process-step]'))
  let lastY = -1
  const updateProcess = (): void => {
    if (!process || !processFill) return
    const vh = window.innerHeight
    const rect = process.getBoundingClientRect()
    if (rect.bottom < 0 || rect.top > vh) return
    const anchor = vh * 0.55
    // Movimiento reducido: la línea se muestra completa; sólo cambia el paso activo.
    const progress = reduce ? 1 : clamp((anchor - rect.top - 120) / (rect.height - 240))
    processFill.style.transform = `scaleY(${String(progress)})`
    let active = -1
    processSteps.forEach((step, i) => {
      if (step.getBoundingClientRect().top < anchor) active = i
    })
    processSteps.forEach((step, i) => {
      step.dataset.active = String(i === active)
      step.dataset.done = String(i < active)
    })
  }

  // ── Planificador de ruta ─────────────────────────────────────────────────
  const disposePlanner = initRoutePlanner(root, { reducedMotion: reduce })

  const frame = (): void => {
    const y = window.scrollY
    const nextAtTop = y <= 16
    if (nav && nextAtTop !== atTop) {
      atTop = nextAtTop
      nav.dataset.atTop = String(nextAtTop)
    }
    if (y !== lastY) {
      lastY = y
      updateProcess()
    }

    if (globe) {
      smoothX += (pointerX - smoothX) * 0.06
      smoothY += (pointerY - smoothY) * 0.06
      globe.setPointer(smoothX, smoothY)
      globe.setScroll(clamp(y / window.innerHeight, 0, 1))
    }

    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => {
    disposed = true
    cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointermove', onSpotlight)
    disposePlanner()
    globe?.dispose()
  }
}
