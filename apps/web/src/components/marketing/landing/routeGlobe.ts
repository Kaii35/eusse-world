/**
 * Globo interactivo del planificador de rutas (cobe, ADR-0022).
 *
 * Adaptado del componente de referencia `cobe-globe` (arrastre con inercia, marcadores y
 * arcos con etiqueta), sin React: el estado de la ruta vive en `planner.ts`, que llama a
 * `setRoute`. cobe se importa al crear el globo, nunca en el JS inicial.
 */
import { GLOBE_ROUTE_ARC_ID, globeMarkerId, HUBS, type CountryCode } from './data'

export type RouteGlobe = {
  setRoute: (from: CountryCode, to: CountryCode) => void
  dispose: () => void
}

type Vec3 = [number, number, number]

/*
 * cobe no lee variables CSS: colores de los primitivos de marca (@eusse/tokens) como
 * fracciones RGB. steel-950 / steel-300 / steel-200 / steel-600.
 */
const COLORS = {
  base: [0.12, 0.2, 0.36] as Vec3,
  marker: [0.5, 0.71, 0.9] as Vec3,
  arc: [0.66, 0.83, 0.95] as Vec3,
  glow: [0.14, 0.37, 0.65] as Vec3,
}

const toRad = (deg: number): number => (deg * Math.PI) / 180

/** Ángulos de cámara que ponen una coordenada de frente (fórmula de los ejemplos de cobe). */
function anglesFor(lat: number, lng: number): { phi: number; theta: number } {
  return { phi: Math.PI - (toRad(lng) - Math.PI / 2), theta: toRad(lat) }
}

/** Sin GPU, WebGL se emula por software: mejor dejar el diagrama SVG. */
function hasHardwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas')
    const options = { failIfMajorPerformanceCaveat: true }
    const gl =
      (probe.getContext('webgl2', options) as WebGL2RenderingContext | null) ??
      (probe.getContext('webgl', options) as WebGLRenderingContext | null)
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return gl !== null
  } catch {
    return false
  }
}

export async function createRouteGlobe(
  canvas: HTMLCanvasElement,
  { reducedMotion, from, to }: { reducedMotion: boolean; from: CountryCode; to: CountryCode },
): Promise<RouteGlobe | null> {
  if (!hasHardwareWebGL()) return null
  const { default: createGlobe } = await import('cobe')

  const hubOf = (code: CountryCode) => HUBS.find((hub) => hub.country === code)
  const markers = HUBS.map((hub) => ({
    location: [hub.lat, hub.lng] as [number, number],
    size: 0.035,
    id: globeMarkerId(hub.iata),
  }))
  const arcFor = (a: CountryCode, b: CountryCode) => {
    const start = hubOf(a)
    const end = hubOf(b)
    if (!start || !end) return []
    return [
      {
        from: [start.lat, start.lng] as [number, number],
        to: [end.lat, end.lng] as [number, number],
        id: GLOBE_ROUTE_ARC_ID,
      },
    ]
  }
  // Punto medio de la ruta: hacia ahí gira la cámara.
  const focusFor = (a: CountryCode, b: CountryCode) => {
    const start = hubOf(a)
    const end = hubOf(b)
    if (!start || !end) return anglesFor(14, -80)
    return anglesFor((start.lat + end.lat) / 2, (start.lng + end.lng) / 2)
  }

  let arcs = arcFor(from, to)
  let target = focusFor(from, to)
  let phi = target.phi
  let theta = target.theta

  // Arrastre con inercia (comportamiento del componente de referencia)
  let pointer: { x: number; y: number } | null = null
  let last: { x: number; y: number; t: number } | null = null
  const drag = { phi: 0, theta: 0 }
  const offset = { phi: 0, theta: 0 }
  const velocity = { phi: 0, theta: 0 }

  const onDown = (event: PointerEvent): void => {
    pointer = { x: event.clientX, y: event.clientY }
    canvas.style.cursor = 'grabbing'
  }
  const onMove = (event: PointerEvent): void => {
    if (!pointer) return
    drag.phi = (event.clientX - pointer.x) / 300
    drag.theta = (event.clientY - pointer.y) / 1000
    const now = performance.now()
    if (last) {
      const dt = Math.max(now - last.t, 1)
      const max = 0.15
      velocity.phi = Math.max(-max, Math.min(max, ((event.clientX - last.x) / dt) * 0.3))
      velocity.theta = Math.max(-max, Math.min(max, ((event.clientY - last.y) / dt) * 0.08))
    }
    last = { x: event.clientX, y: event.clientY, t: now }
  }
  const onUp = (): void => {
    if (pointer) {
      offset.phi += drag.phi
      offset.theta += drag.theta
      drag.phi = 0
      drag.theta = 0
      last = null
    }
    pointer = null
    canvas.style.cursor = 'grab'
  }
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })

  const width = Math.max(1, canvas.offsetWidth)
  if (width < 50) return null
  const globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width,
    height: width,
    phi,
    theta,
    dark: 1,
    diffuse: 1.4,
    mapSamples: 16000,
    mapBrightness: 5,
    mapBaseBrightness: 0.05,
    baseColor: COLORS.base,
    markerColor: COLORS.marker,
    glowColor: COLORS.glow,
    markers,
    markerElevation: 0.02,
    arcs,
    arcColor: COLORS.arc,
    arcWidth: 2,
    arcHeight: 0.18,
    opacity: 0.9,
    // Zoom al corredor Caribe–Centroamérica: a escala 1 los cuatro centros se amontonan.
    scale: 2.1,
    offset: [0, 0],
    context: { failIfMajorPerformanceCaveat: true },
  })

  let raf = 0
  let visible = true
  let t = 0
  const loop = (): void => {
    raf = 0
    if (!visible) return
    if (!pointer) {
      // Inercia del arrastre y vuelta suave al foco de la ruta
      offset.phi += velocity.phi
      offset.theta += velocity.theta
      velocity.phi *= 0.95
      velocity.theta *= 0.95
      offset.phi *= 0.985
      offset.theta *= 0.95
    }
    if (!reducedMotion) t += 0.008
    // La cámara persigue el foco de la ruta; un vaivén lento le da vida sin perderla.
    phi += (target.phi + Math.sin(t) * 0.18 - phi) * 0.06
    theta += (target.theta - theta) * 0.06
    globe.update({
      phi: phi + offset.phi + drag.phi,
      theta: Math.max(-0.6, Math.min(0.9, theta + offset.theta + drag.theta)),
      arcs,
    })
    raf = requestAnimationFrame(loop)
  }

  // cobe fija el tamaño al crearse: se actualiza si la caja cambia (giro, ventana).
  const resizeObserver = new ResizeObserver(() => {
    const size = Math.max(1, canvas.offsetWidth)
    globe.update({ width: size, height: size })
  })
  resizeObserver.observe(canvas)

  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible && !raf) raf = requestAnimationFrame(loop)
  })
  io.observe(canvas)
  raf = requestAnimationFrame(loop)
  canvas.style.opacity = '1'

  return {
    setRoute(a, b) {
      arcs = arcFor(a, b)
      target = focusFor(a, b)
      velocity.phi = 0
      velocity.theta = 0
    },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect()
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      globe.destroy()
    },
  }
}
