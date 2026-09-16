'use client'

import { useEffect, useRef } from 'react'

import type { PointerEvent } from 'react'

type LatLng = readonly [lat: number, lng: number]
type Vec3 = [number, number, number]

export type GlobeMarker = {
  lat: number
  lng: number
  label?: string
  /** Lado de la etiqueta: separa nodos cercanos, como Managua y San José. */
  labelSide?: 'left' | 'right'
}

export type GlobeConnection = { from: LatLng; to: LatLng }

type InteractiveGlobeProps = {
  markers: readonly GlobeMarker[]
  connections: readonly GlobeConnection[]
  className?: string
}

const DOT_COUNT = 1200
const FOV = 600
/** Radianes por segundo: la velocidad no depende de la tasa de refresco. */
const AUTO_ROTATE_SPEED = 0.12
/** 30 fps bastan para un giro lento y reducen a la mitad el trabajo del hilo principal. */
const FRAME_MS = 1000 / 30
/** Los puntos se agrupan por profundidad: un fill por grupo en vez de uno por punto. */
const DEPTH_BUCKETS = 6
const TAU = Math.PI * 2
const DRAG_SENSITIVITY = 0.005
const TILT_LIMIT = 1
/** Rotación inicial: centra el continente americano en la cara visible. */
const INITIAL_ROTATION = { y: 3, x: -0.2 }

/** Esfera de Fibonacci: reparto uniforme de puntos, calculada una sola vez. */
const SPHERE: Vec3[] = Array.from({ length: DOT_COUNT }, (_, index) => {
  const brandenRatio = (1 + Math.sqrt(5)) / 2
  const theta = (2 * Math.PI * index) / brandenRatio
  const phi = Math.acos(1 - (2 * (index + 0.5)) / DOT_COUNT)
  return [Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)]
})

/** Mismo color con alfa 0: un degradado hacia 'transparent' se ensucia de gris. */
function transparentOf(color: string): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color)?.[1]
  if (!hex) return 'transparent'
  const channel = (start: number) => Number.parseInt(hex.slice(start, start + 2), 16)
  return `rgba(${String(channel(0))}, ${String(channel(2))}, ${String(channel(4))}, 0)`
}

function latLngToXYZ(lat: number, lng: number, radius: number): Vec3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

/** Gira el globo sobre su eje y después inclina la vista. */
function rotate([x, y, z]: Vec3, rotY: number, rotX: number): Vec3 {
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY)
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY)
  return [x1, y * Math.cos(rotX) - z1 * Math.sin(rotX), y * Math.sin(rotX) + z1 * Math.cos(rotX)]
}

/** Perspectiva con el eje Y hacia arriba: el norte queda arriba y el este a la derecha. */
function project([x, y, z]: Vec3, cx: number, cy: number): [number, number] {
  const scale = FOV / (FOV + z)
  return [cx - x * scale, cy - y * scale]
}

/**
 * Globo de puntos interactivo en canvas 2D: se arrastra para girarlo, los arcos
 * dibujan los corredores y un pulso recorre cada uno. Sin three.js.
 *
 * Los colores salen de variables CSS de @eusse/tokens (--globe-*), no del código.
 * Se detiene fuera de pantalla y respeta prefers-reduced-motion.
 */
export function InteractiveGlobe({ markers, connections, className }: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotation = useRef({ ...INITIAL_ROTATION })
  const drag = useRef({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 })
  /** Pide un repintado cuando el globo está quieto (movimiento reducido) y se arrastra. */
  const dirty = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const styles = getComputedStyle(canvas)
    const token = (name: string) => styles.getPropertyValue(name).trim()
    const palette = {
      dot: token('--globe-dot'),
      arc: token('--globe-arc'),
      marker: token('--globe-marker'),
    }
    const labelFont = `500 11px ${styles.fontFamily}`
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let time = 0
    let raf = 0
    let last = 0

    // El tamaño llega por ResizeObserver: leer getBoundingClientRect en cada frame forzaba
    // un recálculo de estilos por frame.
    // Halo y contorno no cambian al girar: se pintan una vez por tamaño en un lienzo aparte.
    const backdrop = document.createElement('canvas')
    const backdropCtx = backdrop.getContext('2d')

    const paintBackdrop = (dpr: number) => {
      if (!backdropCtx) return
      backdrop.width = canvas.width
      backdrop.height = canvas.height
      backdropCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.4
      const glow = backdropCtx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.25)
      glow.addColorStop(0, palette.arc)
      glow.addColorStop(1, transparentOf(palette.arc))
      backdropCtx.globalAlpha = 0.12
      backdropCtx.fillStyle = glow
      backdropCtx.beginPath()
      backdropCtx.arc(cx, cy, radius * 1.25, 0, TAU)
      backdropCtx.fill()
      backdropCtx.globalAlpha = 0.15
      backdropCtx.strokeStyle = palette.arc
      backdropCtx.lineWidth = 1
      backdropCtx.beginPath()
      backdropCtx.arc(cx, cy, radius, 0, TAU)
      backdropCtx.stroke()
    }

    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = entry.contentRect.width
      height = entry.contentRect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Cambiar el tamaño reinicia el estado del contexto. La fuente se fija aquí y no en
      // cada frame: asignar ctx.font obliga al navegador a interpretarla como CSS.
      ctx.font = labelFont
      ctx.textBaseline = 'middle'
      paintBackdrop(dpr)
      dirty.current = true
    })
    resize.observe(canvas)

    const draw = (seconds: number) => {
      if (width < 2 || height < 2) return

      if (!reduced) {
        time += seconds * 0.9
        if (!drag.current.active) rotation.current.y += AUTO_ROTATE_SPEED * seconds
      }

      const { y: rotY, x: rotX } = rotation.current
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) * 0.4

      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(backdrop, 0, 0)
      const dpr = canvas.width / width
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Puntos de la cara visible, agrupados por profundidad: más tenues hacia el borde.
      const buckets = Array.from({ length: DEPTH_BUCKETS }, () => new Path2D())
      for (const unit of SPHERE) {
        const point = rotate([unit[0] * radius, unit[1] * radius, unit[2] * radius], rotY, rotX)
        if (point[2] > 0) continue
        const depth = Math.max(0.1, 1 - (point[2] + radius) / (2 * radius))
        const bucket = Math.min(DEPTH_BUCKETS - 1, Math.floor(depth * DEPTH_BUCKETS))
        const [sx, sy] = project(point, cx, cy)
        const dotRadius = 1 + ((bucket + 0.5) / DEPTH_BUCKETS) * 0.8
        const path = buckets[bucket]
        if (!path) continue
        path.moveTo(sx + dotRadius, sy)
        path.arc(sx, sy, dotRadius, 0, TAU)
      }
      ctx.fillStyle = palette.dot
      buckets.forEach((path, bucket) => {
        ctx.globalAlpha = (bucket + 0.5) / DEPTH_BUCKETS
        ctx.fill(path)
      })

      // Corredores: arco elevado y un pulso que lo recorre de origen a destino
      connections.forEach((connection, index) => {
        const start = rotate(
          latLngToXYZ(connection.from[0], connection.from[1], radius),
          rotY,
          rotX,
        )
        const end = rotate(latLngToXYZ(connection.to[0], connection.to[1], radius), rotY, rotX)
        if (start[2] > radius * 0.3 && end[2] > radius * 0.3) return

        const mid: Vec3 = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ]
        const midLength = Math.hypot(mid[0], mid[1], mid[2])
        if (midLength === 0) return
        const lift = (radius * 1.25) / midLength
        const [ax, ay] = project(start, cx, cy)
        const [bx, by] = project(end, cx, cy)
        const [qx, qy] = project([mid[0] * lift, mid[1] * lift, mid[2] * lift], cx, cy)

        ctx.globalAlpha = 0.55
        ctx.strokeStyle = palette.arc
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(qx, qy, bx, by)
        ctx.stroke()

        const t = (time * 0.25 + index * 0.17) % 1
        const u = 1 - t
        ctx.globalAlpha = 1
        ctx.fillStyle = palette.marker
        ctx.beginPath()
        ctx.arc(
          u * u * ax + 2 * u * t * qx + t * t * bx,
          u * u * ay + 2 * u * t * qy + t * t * by,
          2,
          0,
          TAU,
        )
        ctx.fill()
      })

      // Nodos: anillo pulsante, núcleo y etiqueta
      for (const marker of markers) {
        const point = rotate(latLngToXYZ(marker.lat, marker.lng, radius), rotY, rotX)
        if (point[2] > radius * 0.1) continue
        const [sx, sy] = project(point, cx, cy)
        const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5

        ctx.globalAlpha = 0.25 + pulse * 0.2
        ctx.strokeStyle = palette.marker
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(sx, sy, 4 + pulse * 4, 0, TAU)
        ctx.stroke()

        ctx.globalAlpha = 1
        ctx.fillStyle = palette.marker
        ctx.beginPath()
        ctx.arc(sx, sy, 2.5, 0, TAU)
        ctx.fill()

        if (marker.label) {
          const left = marker.labelSide === 'left'
          ctx.globalAlpha = 0.8
          ctx.textAlign = left ? 'right' : 'left'
          ctx.fillText(marker.label, left ? sx - 10 : sx + 10, sy)
        }
      }

      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const elapsed = now - last
      if (elapsed < FRAME_MS) return
      last = now
      if (reduced && !dirty.current) return
      dirty.current = false
      draw(Math.min(elapsed, 100) / 1000)
    }

    // Fuera de pantalla no se dibuja: el hero no debe gastar batería mientras se lee el resto.
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      if (!entry?.isIntersecting) return
      last = performance.now() - FRAME_MS
      dirty.current = true
      raf = requestAnimationFrame(loop)
    })
    visibility.observe(canvas)

    return () => {
      visibility.disconnect()
      resize.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [markers, connections])

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    drag.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startRotY: rotation.current.y,
      startRotX: rotation.current.x,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current.active) return
    const dx = event.clientX - drag.current.startX
    const dy = event.clientY - drag.current.startY
    rotation.current.y = drag.current.startRotY + dx * DRAG_SENSITIVITY
    dirty.current = true
    rotation.current.x = Math.max(
      -TILT_LIMIT,
      Math.min(TILT_LIMIT, drag.current.startRotX - dy * DRAG_SENSITIVITY),
    )
  }

  const endDrag = () => {
    drag.current.active = false
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // touch-pan-y: en móvil el arrastre horizontal gira el globo sin bloquear el scroll.
      className={`size-full cursor-grab touch-pan-y active:cursor-grabbing ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  )
}
