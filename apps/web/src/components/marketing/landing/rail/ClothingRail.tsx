'use client'

/**
 * Perchero de prendas interactivo (sección Personal Shopper).
 *
 * Adaptado del componente de referencia "product-rail-gallery"
 * (apps/web/prompts/shirts.md): misma física (balanceo, arrastre, giro 3D, carrusel en
 * móvil, vista de detalle que "levanta" la prenda). Cambios para este repositorio:
 *  · Estilos en `rail.module.css` con tokens `--landing-*`, no clases de Tailwind.
 *  · Textos por props (next-intl en el servidor); cero literales.
 *  · Sólo ilustraciones SVG: sin fotos de terceros.
 *  · Teclado en cada prenda (botón), no en un contenedor no interactivo.
 *  · El detalle se monta dentro de `<main>` para heredar la tipografía de la landing.
 *
 * Se carga diferido (RailLoader): no entra en el JS inicial de la landing.
 */
import * as React from 'react'
import { createPortal } from 'react-dom'

import { cx } from '../cx'

import {
  ASPECT,
  CAROUSEL_H,
  clamp,
  footprint,
  GAP,
  HOOK_TOP,
  lambert,
  MAX_H,
  MIN_WIDE_H,
  mix,
  PERSPECTIVE,
  RAIL_R,
  REST,
  SIDE,
  silhouetteMask,
  VB_H,
  type GarmentKind,
} from './art'
import { Defs, Fabric, Hanger, SideArt, SideHanger, type HangerMaterial } from './drawing'
import styles from './rail.module.css'

export type RailGarment = {
  id: string
  /** Nombre accesible, leyenda y título del detalle. */
  name: string
  description?: string
  kind: GarmentKind
  /** Color de la tela (cualquier color CSS). */
  color: string
  /** Color de puños, cordones y botones. */
  trim?: string
  /** Texto corto de la etiqueta colgante. */
  tag?: string
  /** Datos cortos del detalle. */
  details?: string[]
}

export type RailLabels = {
  /** Nombre del grupo de prendas para lectores de pantalla. */
  rail: string
  roleDescription: string
  front: string
  back: string
  close: string
  show: string
}

export type ClothingRailProps = {
  items: RailGarment[]
  labels: RailLabels
  /** Se muestra bajo el riel mientras ninguna prenda está de frente. */
  caption: string
  action?: React.ReactNode
  /** Gira las prendas de frente una a una hasta que el visitante interactúa. */
  autoplay?: boolean
  interval?: number
  hanger?: HangerMaterial
}

type Sim = {
  x: number[]
  vx: number[]
  tx: number[]
  px: number[]
  turn: number[]
  vturn: number[]
  tturn: number[]
  swing: number[]
  vswing: number[]
  tag: number[]
  vtag: number[]
  drag: number
  grab: number
  free: number
  last: number
  raf: number
}

function emptySim(): Sim {
  return {
    x: [],
    vx: [],
    tx: [],
    px: [],
    turn: [],
    vturn: [],
    tturn: [],
    swing: [],
    vswing: [],
    tag: [],
    vtag: [],
    drag: -1,
    grab: 0,
    free: 0,
    last: 0,
    raf: 0,
  }
}

const px = (n: number): string => `${n.toFixed(2)}px`
const pad2 = (n: number): string => String(n).padStart(2, '0')

export function ClothingRail({
  items,
  labels,
  caption,
  action,
  autoplay = false,
  interval = 2600,
  hanger = 'wood',
}: ClothingRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const count = items.length
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const slots = React.useRef<(HTMLButtonElement | null)[]>([])
  const swings = React.useRef<(HTMLSpanElement | null)[]>([])
  const turns = React.useRef<(HTMLSpanElement | null)[]>([])
  const sides = React.useRef<(HTMLSpanElement | null)[]>([])
  const drapes = React.useRef<(HTMLSpanElement | null)[]>([])
  const shades = React.useRef<(HTMLSpanElement | null)[]>([])
  const shadows = React.useRef<(HTMLSpanElement | null)[]>([])
  const tags = React.useRef<(HTMLSpanElement | null)[]>([])
  const sim = React.useRef(emptySim())
  const [size, setSize] = React.useState({ width: 0, h: 300, carousel: false })
  const [active, setActive] = React.useState<number | null>(null)
  const [focusIndex, setFocusIndex] = React.useState(0)
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  const [reduced, setReduced] = React.useState(false)
  const [playing, setPlaying] = React.useState(autoplay)
  const [lifted, setLifted] = React.useState<number | null>(null)
  const returnFocus = React.useRef<number | null>(null)
  const pendingOpen = React.useRef(-1)
  const pointer = React.useRef({
    id: -1,
    index: -1,
    x: 0,
    y: 0,
    t: 0,
    moved: false,
    kind: '',
    swipe: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
  })
  const sideWidths = React.useMemo(() => items.map((item) => SIDE[item.kind].width), [items])
  const live = React.useRef({
    active: null as number | null,
    size,
    reduced,
    count,
    openIndex: null as number | null,
    carouselIndex: 0,
    sideWidths,
  })
  live.current = { ...live.current, active, size, reduced, count, openIndex, sideWidths }

  const carouselIndex = size.carousel ? (active ?? live.current.carouselIndex) : null

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (): void => {
      setReduced(media.matches)
    }
    update()
    media.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
    }
  }, [])

  React.useEffect(() => {
    setPlaying(autoplay)
  }, [autoplay])

  React.useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const measure = (width: number): void => {
      const widths = live.current.sideWidths
      const sideW = widths.reduce((sum, w) => sum + w, 0) / Math.max(1, widths.length)
      const restK = footprint(1, REST, sideW) + GAP
      const activeK = footprint(1, 0, sideW) + GAP
      const fit = (width - 24) / (count * restK + (activeK - restK))
      const carousel = fit < MIN_WIDE_H
      const h = carousel ? Math.min(CAROUSEL_H, Math.max(220, width * 0.86)) : Math.min(MAX_H, fit)
      setSize((old) =>
        Math.abs(old.width - width) < 0.5 && old.carousel === carousel && Math.abs(old.h - h) < 0.5
          ? old
          : { width, h: Math.round(h), carousel },
      )
    }
    measure(stage.clientWidth)
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]
      if (box) measure(box.contentRect.width)
    })
    observer.observe(stage)
    return () => {
      observer.disconnect()
    }
  }, [count])

  const targets = React.useCallback(
    (h: number, width: number, carousel: boolean, front: number | null) => {
      const feet = items.map(
        (_, i) => footprint(h, i === front ? 0 : REST, sideWidths[i]) + h * GAP,
      )
      if (carousel) {
        const centre = front ?? 0
        const xs = feet.map(() => 0)
        xs[centre] = width / 2
        for (let i = centre + 1; i < feet.length; i++)
          xs[i] = (xs[i - 1] ?? 0) + ((feet[i - 1] ?? 0) + (feet[i] ?? 0)) / 2
        for (let i = centre - 1; i >= 0; i--)
          xs[i] = (xs[i + 1] ?? 0) - ((feet[i + 1] ?? 0) + (feet[i] ?? 0)) / 2
        return xs
      }
      const total = feet.reduce((sum, f) => sum + f, 0)
      let cursor = (width - total) / 2
      return feet.map((f) => {
        const x = cursor + f / 2
        cursor += f
        return x
      })
    },
    [items, sideWidths],
  )

  const paint = React.useCallback((i: number) => {
    const s = sim.current
    const { h } = live.current.size
    const w = h * ASPECT
    const slot = slots.current[i]
    if (!slot) return
    const angle = s.turn[i] ?? REST
    const swing = s.swing[i] ?? 0
    slot.style.transform = `translate3d(${px((s.x[i] ?? 0) - w / 2)},0,0)`
    const sw = swings.current[i]
    if (sw) sw.style.transform = `rotate(${swing.toFixed(3)}deg)`
    const e = clamp(1 - angle / REST, 0, 1)
    const tu = turns.current[i]
    const sd = sides.current[i]
    if (tu) {
      tu.style.transform = `perspective(${String(PERSPECTIVE)}px) rotateY(${angle.toFixed(2)}deg)`
      tu.style.opacity = sd ? clamp((e - 0.44) / 0.12, 0, 1).toFixed(3) : '1'
    }
    if (sd) {
      sd.style.opacity = clamp((0.56 - e) / 0.12, 0, 1).toFixed(3)
      sd.style.transform = `perspective(${String(PERSPECTIVE)}px) rotateY(${(Math.min(1, e * 2) * -84).toFixed(2)}deg)`
    }
    const lag = clamp(-(s.vswing[i] ?? 0) * 0.018, -5, 5)
    drapes.current[i]?.style.setProperty('--drape', `${lag.toFixed(3)}deg`)
    shades.current[i]?.style.setProperty('--shade', (1 - lambert(angle)).toFixed(3))
    const shadow = shadows.current[i]
    if (shadow) {
      const squash = Math.max(0.12, Math.abs(Math.cos((angle * Math.PI) / 180)))
      shadow.style.transform = `translate3d(${(w * 0.05).toFixed(1)}px, ${(h * 0.035).toFixed(1)}px, 0) scaleX(${squash.toFixed(3)})`
    }
    const tag = tags.current[i]
    if (tag) tag.style.transform = `rotate(${(-12 + (s.tag[i] ?? 0)).toFixed(2)}deg)`
  }, [])

  const step = React.useCallback(
    (now: number) => {
      const s = sim.current
      const n = live.current.count
      const dt = s.last ? Math.min(0.034, (now - s.last) / 1000) : 1 / 60
      s.last = now
      const { h, width, carousel } = live.current.size
      let busy = false
      const sub = 2
      const sdt = dt / sub
      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < n; i++) {
          const before = s.vx[i] ?? 0
          if (i !== s.drag) {
            const restoring = now > s.free
            const stiff = restoring ? 130 : 0
            const damp = restoring ? 2 * Math.sqrt(130) * 0.86 : 3.2
            const ax = -stiff * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - damp * before
            s.vx[i] = before + ax * sdt
            s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * sdt
          }
          const accel = ((s.vx[i] ?? 0) - before) / sdt
          const ta =
            -150 * ((s.turn[i] ?? 0) - (s.tturn[i] ?? 0)) -
            2 * Math.sqrt(150) * 0.78 * (s.vturn[i] ?? 0)
          s.vturn[i] = (s.vturn[i] ?? 0) + ta * sdt
          s.turn[i] = (s.turn[i] ?? 0) + (s.vturn[i] ?? 0) * sdt
          const sa =
            -24 * (s.swing[i] ?? 0) - 2.1 * (s.vswing[i] ?? 0) - clamp(accel, -6000, 6000) * 0.0045
          s.vswing[i] = (s.vswing[i] ?? 0) + sa * sdt
          s.swing[i] = clamp((s.swing[i] ?? 0) + (s.vswing[i] ?? 0) * sdt, -12, 12)
          const tagA =
            -46 * ((s.tag[i] ?? 0) - (s.swing[i] ?? 0) * 0.6) -
            3.4 * (s.vtag[i] ?? 0) -
            (s.vswing[i] ?? 0) * 0.9
          s.vtag[i] = (s.vtag[i] ?? 0) + tagA * sdt
          s.tag[i] = clamp((s.tag[i] ?? 0) + (s.vtag[i] ?? 0) * sdt, -30, 30)
        }
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < n - 1; i++) {
            const a = s.x[i] ?? 0
            const b = s.x[i + 1] ?? 0
            const widths = live.current.sideWidths
            const minGap =
              (footprint(h, s.turn[i] ?? REST, widths[i]) +
                footprint(h, s.turn[i + 1] ?? REST, widths[i + 1])) /
                2 +
              h * 0.012
            const overlap = minGap - (b - a)
            if (overlap <= 0) continue
            if (i === s.drag) s.x[i + 1] = b + overlap
            else if (i + 1 === s.drag) s.x[i] = a - overlap
            else {
              s.x[i] = a - overlap / 2
              s.x[i + 1] = b + overlap / 2
            }
            const va = s.vx[i] ?? 0
            const vb = s.vx[i + 1] ?? 0
            if (va > vb) {
              const shared = (va + vb) / 2
              if (i !== s.drag) s.vx[i] = shared
              if (i + 1 !== s.drag) s.vx[i + 1] = shared
            }
          }
        }
        if (!carousel && n > 0) {
          const widths = live.current.sideWidths
          const edge = h * 0.06
          const first = edge + footprint(h, s.turn[0] ?? REST, widths[0]) / 2
          const lastX = width - edge - footprint(h, s.turn[n - 1] ?? REST, widths[n - 1]) / 2
          if ((s.x[0] ?? 0) < first) {
            s.x[0] = first
            s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3
          }
          if ((s.x[n - 1] ?? 0) > lastX) {
            s.x[n - 1] = lastX
            s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3
          }
        }
      }
      for (let i = 0; i < n; i++) {
        paint(i)
        if (
          Math.abs(s.vx[i] ?? 0) > 0.4 ||
          (now > s.free && Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25) ||
          Math.abs((s.turn[i] ?? 0) - (s.tturn[i] ?? 0)) > 0.05 ||
          Math.abs(s.vturn[i] ?? 0) > 0.05 ||
          Math.abs(s.swing[i] ?? 0) > 0.02 ||
          Math.abs(s.vswing[i] ?? 0) > 0.05 ||
          Math.abs(s.tag[i] ?? 0) > 0.05 ||
          Math.abs(s.vtag[i] ?? 0) > 0.08
        )
          busy = true
      }
      if (s.drag >= 0 || now < s.free) busy = true
      if (busy) s.raf = requestAnimationFrame(step)
      else {
        s.raf = 0
        s.last = 0
        for (let i = 0; i < n; i++) {
          if (now > s.free) s.x[i] = s.tx[i] ?? 0
          s.swing[i] = 0
          s.vswing[i] = 0
          s.tag[i] = 0
          s.vtag[i] = 0
          paint(i)
        }
      }
    },
    [paint],
  )

  const kick = React.useCallback(() => {
    const s = sim.current
    if (live.current.reduced) {
      for (let i = 0; i < live.current.count; i++) {
        s.x[i] = s.tx[i] ?? 0
        s.turn[i] = s.tturn[i] ?? REST
        s.vx[i] = 0
        s.vturn[i] = 0
        s.swing[i] = 0
        s.vswing[i] = 0
        paint(i)
      }
      return
    }
    if (!s.raf) {
      s.last = 0
      s.raf = requestAnimationFrame(step)
    }
  }, [paint, step])

  const impulse = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current
      if (live.current.reduced || i < 0 || i >= live.current.count) return
      s.vswing[i] = (s.vswing[i] ?? 0) + amount
      kick()
    },
    [kick],
  )

  React.useLayoutEffect(() => {
    if (!size.width) return
    const s = sim.current
    const front = size.carousel ? (active ?? live.current.carouselIndex) : active
    const xs = targets(size.h, size.width, size.carousel, front)
    const fresh = s.x.length !== count
    for (let i = 0; i < count; i++) {
      s.tx[i] = (xs[i] ?? 0) + (size.carousel ? pointer.current.swipe : 0)
      s.tturn[i] = i === front ? 0 : REST
      if (fresh || reduced) {
        s.x[i] = s.tx[i] ?? 0
        s.vx[i] = 0
        s.px[i] = 0
        s.turn[i] = s.tturn[i] ?? REST
        s.vturn[i] = 0
        s.swing[i] = s.swing[i] ?? 0
        s.vswing[i] = s.vswing[i] ?? 0
        s.tag[i] = 0
        s.vtag[i] = 0
      }
    }
    if (fresh) {
      s.x.length = count
      for (let i = 0; i < count; i++) paint(i)
    }
    kick()
  }, [size, active, count, reduced, targets, paint, kick])

  // Al aparecer, una pasada de mano a lo largo del riel: las prendas se balancean.
  const brushed = React.useRef(false)
  React.useEffect(() => {
    if (!size.width || brushed.current || reduced) return undefined
    brushed.current = true
    const timers = items.map((_, i) =>
      window.setTimeout(
        () => {
          impulse(i, 46 - i * 2.5)
        },
        120 + i * 55,
      ),
    )
    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t)
      })
    }
  }, [size.width, reduced, items, impulse])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(sim.current.raf)
      sim.current.raf = 0
    },
    [],
  )

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return
    const index = returnFocus.current
    returnFocus.current = null
    slots.current[index]?.focus({ preventScroll: true })
  }, [openIndex, lifted])

  const choose = React.useCallback(
    (index: number | null) => {
      setActive((old) => {
        if (old === index) return old
        if (index !== null) {
          impulse(index - 1, -30)
          impulse(index + 1, 30)
        }
        if (old !== null && old !== index) {
          impulse(old - 1, 14)
          impulse(old + 1, -14)
        }
        if (index !== null) live.current.carouselIndex = index
        return index
      })
    },
    [impulse],
  )

  const stop = React.useCallback(() => {
    setPlaying(false)
  }, [])

  React.useEffect(() => {
    if (!playing || reduced || openIndex !== null || count === 0 || !size.width) return undefined
    let timer = window.setTimeout(
      function advance() {
        const current = live.current.active
        choose(current === null ? 0 : (current + 1) % live.current.count)
        timer = window.setTimeout(advance, interval)
      },
      active === null ? 1100 : interval,
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [playing, reduced, openIndex, count, interval, size.width, choose, active])

  const open = React.useCallback(
    (index: number) => {
      stop()
      setActive(index)
      setOpenIndex(index)
    },
    [stop],
  )

  const close = React.useCallback(() => {
    setOpenIndex(null)
  }, [])

  function nearest(clientX: number, clientY: number): number | null {
    const stage = stageRef.current
    if (!stage) return null
    const box = stage.getBoundingClientRect()
    const x = clientX - box.left
    const y = clientY - box.top
    const { h } = live.current.size
    if (y < 0 || y > h + 46) return null
    const s = sim.current
    let best: number | null = null
    let distance = Infinity
    for (let i = 0; i < live.current.count; i++) {
      const half = footprint(h, s.turn[i] ?? REST, live.current.sideWidths[i]) / 2 + 4
      const d = Math.abs(x - (s.x[i] ?? 0))
      if (d < half && d < distance) {
        best = i
        distance = d
      }
    }
    return best
  }

  const onPointerMove = (event: React.PointerEvent): void => {
    const p = pointer.current
    const s = sim.current
    const stage = stageRef.current
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x
      const now = performance.now()
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true
        stop()
        if (stage.isConnected) stage.setPointerCapture(event.pointerId)
        if (!live.current.size.carousel && p.index >= 0) {
          s.drag = p.index
          s.grab = event.clientX - stage.getBoundingClientRect().left - (s.x[p.index] ?? 0)
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT)
        p.v = p.v * 0.6 + v * 0.4
        p.lastX = event.clientX
        p.lastT = now
        if (s.drag >= 0) {
          s.vx[s.drag] = p.v * 1000
          s.x[s.drag] = event.clientX - stage.getBoundingClientRect().left - s.grab
          s.free = now + 900
          kick()
        } else if (live.current.size.carousel) {
          p.swipe = dx
          const { h, width } = live.current.size
          const xs = targets(h, width, true, live.current.active ?? live.current.carouselIndex)
          for (let i = 0; i < live.current.count; i++) s.tx[i] = (xs[i] ?? 0) + dx
          kick()
        }
      }
      return
    }
    if (
      event.pointerType !== 'mouse' ||
      live.current.size.carousel ||
      live.current.openIndex !== null
    )
      return
    const hit = nearest(event.clientX, event.clientY)
    const current = live.current.active
    if (current !== null && hit !== current) {
      const box = stage?.getBoundingClientRect()
      const keep = box
        ? Math.abs(event.clientX - box.left - (s.x[current] ?? 0)) <
          footprint(live.current.size.h, 0) / 2 + 14
        : false
      if (
        keep &&
        (hit === null || Math.abs(event.clientY - (box?.top ?? 0)) < live.current.size.h + 40)
      )
        return
    }
    if (hit !== null) {
      stop()
      choose(hit)
    }
  }

  const onPointerDown = (event: React.PointerEvent): void => {
    if (event.button !== 0) return
    const hit = nearest(event.clientX, event.clientY)
    const now = performance.now()
    pendingOpen.current = -1
    pointer.current = {
      id: event.pointerId,
      index: hit ?? -1,
      x: event.clientX,
      y: event.clientY,
      t: now,
      moved: false,
      kind: event.pointerType,
      swipe: 0,
      lastX: event.clientX,
      lastT: now,
      v: 0,
    }
  }

  const finishPointer = (event: React.PointerEvent, cancelled: boolean): void => {
    const p = pointer.current
    if (p.id !== event.pointerId) return
    const s = sim.current
    const stage = stageRef.current
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
    pointer.current = { ...p, id: -1 }
    if (s.drag >= 0) {
      s.drag = -1
      s.free = performance.now() + 700
      kick()
      return
    }
    if (p.moved && live.current.size.carousel) {
      const dx = event.clientX - p.x
      const current = live.current.active ?? live.current.carouselIndex
      const delta = Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0
      pointer.current.swipe = 0
      choose(clamp(current + delta, 0, live.current.count - 1))
      for (let i = 0; i < live.current.count; i++) impulse(i, clamp(-p.v * 22, -30, 30))
      return
    }
    if (cancelled || p.moved || p.index < 0) return
    stop()
    const touch = p.kind !== 'mouse'
    if (touch && live.current.active !== p.index) choose(p.index)
    else pendingOpen.current = p.index
  }

  const onGarmentKeyDown = (event: React.KeyboardEvent): void => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return
    event.preventDefault()
    stop()
    const from = active ?? focusIndex
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? count - 1
          : clamp(from + (event.key === 'ArrowRight' ? 1 : -1), 0, count - 1)
    setFocusIndex(next)
    choose(next)
    slots.current[next]?.focus({ preventScroll: true })
  }

  const current = active === null ? null : items[active]
  const h = size.h
  const boxW = h * ASPECT
  const railY = Math.round(h * 0.07) + 10
  const railR = Math.max(3, Math.round((RAIL_R / VB_H) * h * 10) / 10)
  const bottom = count ? Math.max(...items.map((item) => SIDE[item.kind].hem + 8)) / VB_H : 1
  const openItem = openIndex === null ? undefined : items[openIndex]

  return (
    <div
      className={styles.rail}
      data-mode={size.carousel ? 'carousel' : 'rail'}
      aria-roledescription={labels.roleDescription}
    >
      <Defs uid={uid} />

      <div
        ref={stageRef}
        role="group"
        aria-label={labels.rail}
        className={styles.stage}
        style={{ height: Math.round(railY + h * bottom + h * 0.05 + 12) }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => {
          finishPointer(event, false)
        }}
        onPointerCancel={(event) => {
          finishPointer(event, true)
        }}
        onPointerLeave={(event) => {
          if (
            event.pointerType === 'mouse' &&
            pointer.current.id < 0 &&
            !size.carousel &&
            !document.activeElement?.matches('[data-garment]:focus-visible')
          )
            choose(null)
        }}
      >
        <div
          aria-hidden="true"
          className={styles.railBar}
          style={{ top: railY - railR, height: railR * 2 }}
        >
          <div className={styles.railShadow} style={{ top: railR * 2 + 1 }} />
          <div className={styles.railTube} />
          <div className={styles.railShine} />
          <div className={cx(styles.railCap, styles.railCapLeft)}>
            <span className={styles.railScrewTop} />
            <span className={styles.railScrewBottom} />
          </div>
          <div className={cx(styles.railCap, styles.railCapRight)}>
            <span className={styles.railScrewTop} />
            <span className={styles.railScrewBottom} />
          </div>
        </div>

        {items.map((item, i) => {
          const trim = item.trim ?? mix(item.color, -0.12)
          const turned = active === i
          const garmentVars = {
            ['--garment-color' as string]: item.color,
            ['--garment-under' as string]: mix(item.color, -0.42),
          } as React.CSSProperties
          return (
            <button
              key={item.id}
              ref={(node) => {
                slots.current[i] = node
              }}
              type="button"
              data-garment={i}
              data-front={turned || undefined}
              tabIndex={i === (active ?? focusIndex) ? 0 : -1}
              aria-label={item.name}
              aria-describedby={`${uid}-caption`}
              aria-pressed={turned}
              className={styles.garment}
              style={{
                top: railY - (HOOK_TOP / VB_H) * h,
                width: boxW,
                height: h,
                zIndex: turned ? 30 : 10 + i,
                visibility: lifted === i ? 'hidden' : undefined,
                transform: `translate3d(${px((sim.current.x[i] ?? 0) - boxW / 2)},0,0)`,
              }}
              onKeyDown={onGarmentKeyDown}
              onFocus={() => {
                setFocusIndex(i)
                if (pointer.current.id < 0) {
                  stop()
                  choose(i)
                }
              }}
              onClick={(event) => {
                const pending = pendingOpen.current
                pendingOpen.current = -1
                if (event.detail === 0 || pending === i) open(i)
              }}
            >
              <span
                ref={(node) => {
                  swings.current[i] = node
                }}
                className={styles.fill}
                style={{ transformOrigin: `50% ${String((HOOK_TOP / VB_H) * 100)}%` }}
              >
                <span
                  aria-hidden="true"
                  className={styles.fillStatic}
                  style={{ filter: `blur(${Math.max(3, h * 0.022).toFixed(1)}px)` }}
                >
                  <span
                    ref={(node) => {
                      shadows.current[i] = node
                    }}
                    className={styles.garmentShadow}
                    style={{
                      WebkitMask: `${silhouetteMask(item.kind, 'front')} top center / contain no-repeat`,
                      mask: `${silhouetteMask(item.kind, 'front')} top center / contain no-repeat`,
                    }}
                  />
                </span>
                <span
                  ref={(node) => {
                    sides.current[i] = node
                  }}
                  className={styles.fill}
                  style={{ transform: `perspective(${String(PERSPECTIVE)}px) rotateY(0deg)` }}
                >
                  <SideHanger uid={uid} material={hanger} />
                  <SideArt uid={uid} kind={item.kind} color={item.color} trim={trim} />
                </span>
                <span
                  ref={(node) => {
                    turns.current[i] = node
                  }}
                  className={styles.turn}
                  style={{
                    transform: `perspective(${String(PERSPECTIVE)}px) rotateY(${String(REST)}deg)`,
                    opacity: 0,
                  }}
                >
                  {(['front', 'back'] as const).map((side) => (
                    <span
                      key={side}
                      className={styles.face}
                      style={{
                        ...garmentVars,
                        transform: side === 'back' ? 'rotateY(180deg)' : undefined,
                      }}
                    >
                      <Hanger uid={uid} side={side} kind={item.kind} material={hanger} />
                      <span
                        ref={
                          side === 'front'
                            ? (node) => {
                                drapes.current[i] = node
                              }
                            : undefined
                        }
                        className={side === 'front' ? styles.drape : styles.drapeBack}
                      >
                        <Fabric
                          uid={uid}
                          kind={item.kind}
                          side={side}
                          color={item.color}
                          trim={trim}
                        />
                        <span
                          ref={
                            side === 'front'
                              ? (node) => {
                                  shades.current[i] = node
                                }
                              : undefined
                          }
                          className={styles.shade}
                          style={{
                            WebkitMask: `${silhouetteMask(item.kind, side)} top center / contain no-repeat`,
                            mask: `${silhouetteMask(item.kind, side)} top center / contain no-repeat`,
                          }}
                        />
                      </span>
                    </span>
                  ))}
                </span>
                {item.tag ? (
                  <span
                    ref={(node) => {
                      tags.current[i] = node
                    }}
                    aria-hidden="true"
                    className={styles.tag}
                    style={{ top: (32 / VB_H) * h }}
                  >
                    <span className={styles.tagString} />
                    <span className={styles.tagCard}>
                      <span className={styles.tagHole} />
                      {item.tag}
                    </span>
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {size.carousel && count > 1 ? (
        <div className={styles.dots} role="group" aria-label={labels.show}>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${labels.show} ${item.name}`}
              aria-current={carouselIndex === i}
              className={styles.dot}
              onClick={() => {
                stop()
                choose(i)
              }}
            />
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <div id={`${uid}-caption`} aria-live="polite" className={styles.captionBox}>
          <p key={current?.id ?? 'caption'} className={styles.captionTitle}>
            {current ? current.name : caption}
          </p>
          {current?.description ? (
            <p key={`${current.id}-d`} className={styles.captionText}>
              {current.description}
            </p>
          ) : null}
        </div>
        {action}
      </div>

      {openIndex !== null && openItem ? (
        <Detail
          uid={uid}
          item={openItem}
          index={openIndex}
          total={count}
          hanger={hanger}
          labels={labels}
          reduced={reduced}
          portalFrom={stageRef}
          source={() => turns.current[openIndex]?.getBoundingClientRect() ?? null}
          onLift={(lift) => {
            setLifted(lift ? openIndex : null)
          }}
          onClose={() => {
            const index = openIndex
            returnFocus.current = index
            close()
            impulse(index, (index % 2 ? 1 : -1) * 44)
          }}
        />
      ) : null}
    </div>
  )
}

type DetailProps = {
  uid: string
  item: RailGarment
  index: number
  total: number
  hanger: HangerMaterial
  labels: RailLabels
  reduced: boolean
  portalFrom: React.RefObject<HTMLElement | null>
  source: () => DOMRect | null
  onLift: (lifted: boolean) => void
  onClose: () => void
}

function Detail({
  uid,
  item,
  index,
  total,
  hanger,
  labels,
  reduced,
  portalFrom,
  source,
  onLift,
  onClose,
}: DetailProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null)
  const figureRef = React.useRef<HTMLDivElement | null>(null)
  const spinRef = React.useRef<HTMLDivElement | null>(null)
  const closeRef = React.useRef<HTMLButtonElement | null>(null)
  const [side, setSide] = React.useState<'front' | 'back'>('front')
  const [shown, setShown] = React.useState(false)
  const angle = React.useRef({
    value: 0,
    target: 0,
    velocity: 0,
    raf: 0,
    last: 0,
    dragging: false,
    startX: 0,
    startAngle: 0,
  })
  const closing = React.useRef(false)
  const trim = item.trim ?? mix(item.color, -0.12)
  const titleId = `${uid}-detail-title`
  const garmentVars = {
    ['--garment-color' as string]: item.color,
    ['--garment-under' as string]: mix(item.color, -0.42),
  } as React.CSSProperties

  const spin = React.useCallback(() => {
    const a = angle.current
    const node = spinRef.current
    const loop = (now: number): void => {
      const dt = a.last ? Math.min(0.034, (now - a.last) / 1000) : 1 / 60
      a.last = now
      const accel = -90 * (a.value - a.target) - 2 * Math.sqrt(90) * 0.82 * a.velocity
      a.velocity += accel * dt
      a.value += a.velocity * dt
      if (node) node.style.transform = `rotateY(${a.value.toFixed(2)}deg)`
      if (Math.abs(a.value - a.target) < 0.05 && Math.abs(a.velocity) < 0.05) {
        a.value = a.target
        if (node) node.style.transform = `rotateY(${String(a.value)}deg)`
        a.raf = 0
        a.last = 0
        return
      }
      a.raf = requestAnimationFrame(loop)
    }
    if (reduced) {
      a.value = a.target
      if (node) node.style.transform = `rotateY(${String(a.value)}deg)`
      return
    }
    if (!a.raf) a.raf = requestAnimationFrame(loop)
  }, [reduced])

  const turnTo = React.useCallback(
    (next: 'front' | 'back') => {
      const a = angle.current
      const base = Math.round(a.value / 360) * 360
      a.target = base + (next === 'back' ? 180 : 0)
      if (Math.abs(a.target - a.value) > 180) a.target -= 360 * Math.sign(a.target - a.value)
      setSide(next)
      spin()
    },
    [spin],
  )

  React.useLayoutEffect(() => {
    const figure = figureRef.current
    const from = source()
    closeRef.current?.focus({ preventScroll: true })
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let animation: Animation | null = null
    if (figure && from && !reduced && from.width > 0) {
      const to = figure.getBoundingClientRect()
      const scale = from.height / to.height
      const dx = from.left + from.width / 2 - (to.left + to.width / 2)
      const dy = from.top - to.top
      const lift = Math.min(90, Math.abs(dy) * 0.25 + 30)
      onLift(true)
      animation = figure.animate(
        [
          { transform: `translate(${px(dx)}, ${px(dy)}) scale(${String(scale)})` },
          {
            transform: `translate(${px(dx * 0.4)}, ${px(dy * 0.4 - lift)}) scale(${String(((scale + 1) / 2) * 1.03)}) rotate(${dx > 0 ? '-2.5' : '2.5'}deg)`,
            offset: 0.5,
          },
          { transform: 'none' },
        ],
        { duration: 680, easing: 'cubic-bezier(.22,.85,.3,1)' },
      )
    }
    const raf = requestAnimationFrame(() => {
      setShown(true)
    })
    const spinState = angle.current
    return () => {
      cancelAnimationFrame(raf)
      animation?.cancel()
      document.body.style.overflow = overflow
      cancelAnimationFrame(spinState.raf)
      onLift(false)
    }
  }, [source, reduced, onLift])

  const dismiss = React.useCallback(() => {
    if (closing.current) return
    closing.current = true
    setShown(false)
    const figure = figureRef.current
    const to = source()
    if (!figure || !to || reduced || to.width === 0) {
      onClose()
      return
    }
    const from = figure.getBoundingClientRect()
    const scale = to.height / from.height
    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top - from.top
    const animation = figure.animate(
      [
        { transform: 'none' },
        {
          transform: `translate(${px(dx * 0.6)}, ${px(dy * 0.6 - 30)}) scale(${String((scale + 1) / 2)})`,
          offset: 0.55,
        },
        { transform: `translate(${px(dx)}, ${px(dy)}) scale(${String(scale)})` },
      ],
      { duration: 560, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' },
    )
    animation.onfinish = () => {
      onClose()
    }
  }, [source, reduced, onClose])

  // Teclado del diálogo en un único listener: Escape cierra, flechas giran la prenda y el
  // foco queda atrapado dentro (ciclo de Tab), también si se escapó fuera.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const dialog = dialogRef.current
      if (!dialog) return
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss()
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        turnTo(side === 'front' ? 'back' : 'front')
        return
      }
      if (event.key !== 'Tab') return
      const controls = [...dialog.querySelectorAll('button')].filter(
        (node) => !node.disabled && node.tabIndex >= 0,
      )
      const first = controls[0]
      const last = controls.at(-1)
      if (!first || !last) return
      if (!dialog.contains(event.target as Node)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [dismiss, turnTo, side])

  const counter = `${pad2(index + 1)} / ${pad2(total)}`

  // Dentro de <main>: hereda la tipografía y los tokens de la landing.
  const target = portalFrom.current?.closest('main') ?? document.body

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={styles.dialog}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={labels.close}
        className={styles.dialogBackdrop}
        data-shown={shown}
        onClick={dismiss}
      />
      <button
        ref={closeRef}
        type="button"
        onClick={dismiss}
        className={styles.dialogClose}
        data-shown={shown}
      >
        {labels.close}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={styles.dialogCloseIcon}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
      <div className={styles.dialogLayout}>
        <div ref={figureRef} className={styles.figure}>
          <div
            aria-hidden="true"
            className={styles.figureRope}
            style={{ top: `calc(-40vh + ${String((HOOK_TOP / VB_H) * 100)}%)` }}
          />
          <div
            aria-hidden="true"
            className={styles.figureDrag}
            onPointerDown={(event) => {
              const a = angle.current
              a.dragging = true
              a.startX = event.clientX
              a.startAngle = a.value
              cancelAnimationFrame(a.raf)
              a.raf = 0
              a.last = 0
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              const a = angle.current
              if (!a.dragging) return
              a.value = clamp(
                a.startAngle + (event.clientX - a.startX) * 0.45,
                a.startAngle - 220,
                a.startAngle + 220,
              )
              if (spinRef.current)
                spinRef.current.style.transform = `rotateY(${a.value.toFixed(2)}deg)`
            }}
            onPointerUp={() => {
              const a = angle.current
              if (!a.dragging) return
              a.dragging = false
              const facing = ((a.value % 360) + 360) % 360
              turnTo(facing > 90 && facing < 270 ? 'back' : 'front')
            }}
            onPointerCancel={() => {
              angle.current.dragging = false
              turnTo(side)
            }}
          >
            <div ref={spinRef} className={styles.spin}>
              {(['front', 'back'] as const).map((face) => (
                <div
                  key={face}
                  className={styles.face}
                  style={{
                    ...garmentVars,
                    transform: face === 'back' ? 'rotateY(180deg)' : undefined,
                  }}
                >
                  <Hanger uid={uid} side={face} kind={item.kind} material={hanger} />
                  <Fabric uid={uid} kind={item.kind} side={face} color={item.color} trim={trim} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.info} data-shown={shown}>
          <p className={styles.counter}>{counter}</p>
          <h3 id={titleId} className={styles.detailTitle}>
            {item.name}
          </h3>
          {item.description ? <p className={styles.detailText}>{item.description}</p> : null}
          {item.details && item.details.length > 0 ? (
            <ul className={styles.chips}>
              {item.details.map((detail) => (
                <li key={detail} className={styles.chip}>
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
          <div
            role="group"
            aria-label={`${labels.front} / ${labels.back}`}
            className={styles.sideToggle}
          >
            {(['front', 'back'] as const).map((face) => (
              <button
                key={face}
                type="button"
                aria-pressed={side === face}
                onClick={() => {
                  turnTo(face)
                }}
                className={styles.sideButton}
              >
                {face === 'front' ? labels.front : labels.back}
                <span aria-hidden="true" className={styles.sideUnderline} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    target,
  )
}

export default ClothingRail
