/**
 * Globo 3D del hero con las rutas entre centros de operación (three.js, ADR-0021).
 *
 * Se importa con `import()` desde `motion.ts`: three.js nunca entra en el JS inicial.
 * Se pausa cuando sale de pantalla y devuelve `null` si no hay WebGL, en cuyo caso el
 * hero se queda sin globo pero completo.
 */
import * as THREE from 'three'

import { HUBS, ROUTES } from './data'

import type { GlobeHandle } from './motion'

/** Máscara de agua/tierra (720×360, blanco = agua). Servida desde `public/`. */
const LAND_MASK = '/landing/earth-water.png'
const MASK_W = 720
const MASK_H = 360

/*
 * Colores de la escena. WebGL no lee variables CSS: son los mismos valores que los
 * primitivos `--eusse-steel-*` y `--eusse-silver-500` de @eusse/tokens, expresados en hexadecimal.
 */
const COLOR = {
  core: 0x0a1c40, // steel-950 / sombra del globo del logo
  grid: 0x3a74b8, // steel-500
  land: 0x7fb6e6, // steel-300
  hub: 0xeef6fd, // steel-50
  ring: 0xa9d3f2, // steel-200
  orbit: 0x878fa2, // silver-500: el anillo plateado del logo
  pulse: 0xffffff,
} as const

function toVector(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lng + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function loadMask(): Promise<Uint8ClampedArray | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = MASK_W
      canvas.height = MASK_H
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.drawImage(img, 0, 0, MASK_W, MASK_H)
      try {
        resolve(ctx.getImageData(0, 0, MASK_W, MASK_H).data)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = LAND_MASK
  })
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    // Sin GPU, WebGL se emula por software: el globo costaría CPU y batería sin aportar
    // nada esencial. Con este flag el contexto falla y el hero se queda sin globo.
    const options = { failIfMajorPerformanceCaveat: true }
    const gl =
      (canvas.getContext('webgl2', options) as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl', options) as WebGLRenderingContext | null)
    // El contexto de prueba se libera enseguida: el navegador limita los contextos vivos.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return gl !== null
  } catch {
    return false
  }
}

export function createGlobe(
  el: HTMLElement,
  { reducedMotion }: { reducedMotion: boolean },
): GlobeHandle | null {
  if (!supportsWebGL()) return null

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'width:100%;height:100%;display:block;opacity:0;transition:opacity 1.6s ease'
  el.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 5.6)

  const tilt = new THREE.Group()
  const spin = new THREE.Group()
  tilt.add(spin)
  scene.add(tilt)
  const baseX = 0.24
  const baseY = -0.16
  tilt.rotation.x = baseX

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item)
    return item
  }

  let disposed = false

  // Núcleo y halo atmosférico
  spin.add(
    new THREE.Mesh(
      keep(new THREE.SphereGeometry(0.995, 64, 64)),
      keep(new THREE.MeshBasicMaterial({ color: COLOR.core })),
    ),
  )
  const glow = new THREE.Mesh(
    keep(new THREE.SphereGeometry(1, 64, 64)),
    keep(
      new THREE.ShaderMaterial({
        vertexShader:
          'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.35,0.73,0.90,1.0) * i; }',
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    ),
  )
  glow.scale.setScalar(1.18)
  scene.add(glow)

  // Retícula de meridianos y paralelos
  const gridMaterial = keep(
    new THREE.LineBasicMaterial({ color: COLOR.grid, transparent: true, opacity: 0.22 }),
  )
  const addLine = (points: THREE.Vector3[]): void => {
    spin.add(new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(points)), gridMaterial))
  }
  for (let lat = -80; lat <= 80; lat += 20) {
    const points: THREE.Vector3[] = []
    for (let lng = -180; lng <= 180; lng += 4) points.push(toVector(lat, lng, 1.001))
    addLine(points)
  }
  for (let lng = -180; lng < 180; lng += 20) {
    const points: THREE.Vector3[] = []
    for (let lat = -90; lat <= 90; lat += 4) points.push(toVector(lat, lng, 1.001))
    addLine(points)
  }

  // Continentes como nube de puntos (espiral de Fibonacci filtrada por la máscara)
  const landMaterial = keep(
    new THREE.PointsMaterial({
      color: COLOR.land,
      size: 0.0115,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
    }),
  )
  void loadMask().then((mask) => {
    if (disposed) return
    const count = mask ? 16000 : 5000
    const golden = Math.PI * (3 - Math.sqrt(5))
    const positions: number[] = []
    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = golden * i
      const v = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r)
      const lat = (Math.asin(v.y) * 180) / Math.PI
      let lng = (Math.atan2(v.z, -v.x) * 180) / Math.PI - 180
      if (lng < -180) lng += 360
      if (mask) {
        const px = Math.min(MASK_W - 1, Math.floor(((lng + 180) / 360) * MASK_W))
        const py = Math.min(MASK_H - 1, Math.floor(((90 - lat) / 180) * MASK_H))
        if ((mask[(py * MASK_W + px) * 4] ?? 0) > 110) continue
      } else if (i % 3) continue
      v.multiplyScalar(1.003)
      positions.push(v.x, v.y, v.z)
    }
    const geometry = keep(new THREE.BufferGeometry())
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    spin.add(new THREE.Points(geometry, landMaterial))
    if (reducedMotion) render(0)
  })

  // Centros de operación con onda expansiva
  const hubMaterial = keep(new THREE.MeshBasicMaterial({ color: COLOR.hub }))
  const ringMaterial = keep(
    new THREE.MeshBasicMaterial({
      color: COLOR.ring,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  const hubGeometry = keep(new THREE.SphereGeometry(0.014, 16, 16))
  const ringGeometry = keep(new THREE.RingGeometry(0.022, 0.028, 48))
  const rings = HUBS.map((hub, i) => {
    const position = toVector(hub.lat, hub.lng, 1.004)
    const dot = new THREE.Mesh(hubGeometry, hubMaterial)
    dot.position.copy(position)
    spin.add(dot)
    const material = keep(ringMaterial.clone())
    const ring = new THREE.Mesh(ringGeometry, material)
    ring.position.copy(position)
    ring.lookAt(position.clone().multiplyScalar(2))
    spin.add(ring)
    return { ring, material, phase: i * 0.6 }
  })

  // Arcos entre centros con un pulso que los recorre
  const arcMaterial = keep(
    new THREE.LineBasicMaterial({ color: COLOR.land, transparent: true, opacity: 0.45 }),
  )
  const pulseMaterial = keep(
    new THREE.LineBasicMaterial({ color: COLOR.pulse, transparent: true, opacity: 1 }),
  )
  const headGeometry = keep(new THREE.SphereGeometry(0.009, 12, 12))
  const SEGMENTS = 90
  const TAIL = 16
  const arcs = ROUTES.flatMap(([from, to], i) => {
    const a = HUBS[from]
    const b = HUBS[to]
    if (!a || !b) return []
    const start = toVector(a.lat, a.lng)
    const end = toVector(b.lat, b.lng)
    const distance = start.distanceTo(end)
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(1 + distance * 0.75)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const geometry = keep(new THREE.BufferGeometry().setFromPoints(curve.getPoints(SEGMENTS)))
    spin.add(new THREE.Line(geometry, arcMaterial))
    const pulse = new THREE.Line(keep(geometry.clone()), pulseMaterial)
    spin.add(pulse)
    const head = new THREE.Mesh(headGeometry, hubMaterial)
    spin.add(head)
    return [
      { curve, pulse, head, speed: 0.16 + (i % 3) * 0.05, offset: i * 0.37, dir: i % 2 ? -1 : 1 },
    ]
  })

  // Órbita con satélites
  const orbit = new THREE.Group()
  orbit.rotation.set(1.15, 0.2, -0.35)
  scene.add(orbit)
  const orbitPoints: THREE.Vector3[] = []
  for (let i = 0; i <= 160; i += 1) {
    const t = (i / 160) * Math.PI * 2
    orbitPoints.push(new THREE.Vector3(Math.cos(t) * 1.42, Math.sin(t) * 1.42, 0))
  }
  const orbitLine = new THREE.LineLoop(
    keep(new THREE.BufferGeometry().setFromPoints(orbitPoints)),
    keep(
      new THREE.LineDashedMaterial({
        color: COLOR.orbit,
        dashSize: 0.03,
        gapSize: 0.03,
        transparent: true,
        opacity: 0.55,
      }),
    ),
  )
  orbitLine.computeLineDistances()
  orbit.add(orbitLine)
  const satellites = [0, 2.1, 4.2].map((offset) => {
    const mesh = new THREE.Mesh(headGeometry, hubMaterial)
    mesh.scale.setScalar(1.3)
    orbit.add(mesh)
    return { mesh, offset }
  })

  let pointerX = 0
  let pointerY = 0
  let scroll = 0
  let raf = 0
  let visible = true
  let shown = false
  const clock = new THREE.Clock()

  function render(t: number): void {
    spin.rotation.y = baseY + Math.sin(t * 0.12) * 0.22 + pointerX * 0.28 + scroll * 0.9
    tilt.rotation.x = baseX + pointerY * 0.12 - scroll * 0.15
    for (const { ring, material, phase } of rings) {
      const k = ((t * 0.7 + phase) % 1.6) / 1.6
      ring.scale.setScalar(0.6 + k * 1.3)
      material.opacity = 0.9 * (1 - k)
    }
    for (const arc of arcs) {
      let k = (t * arc.speed + arc.offset) % 1
      if (arc.dir < 0) k = 1 - k
      const s = Math.floor(k * (SEGMENTS - TAIL))
      arc.pulse.geometry.setDrawRange(s, TAIL)
      arc.head.position.copy(
        arc.curve.getPoint(arc.dir > 0 ? Math.min(1, (s + TAIL) / SEGMENTS) : s / SEGMENTS),
      )
    }
    for (const { mesh, offset } of satellites) {
      const angle = t * 0.25 + offset
      mesh.position.set(Math.cos(angle) * 1.42, Math.sin(angle) * 1.42, 0)
    }
    renderer.render(scene, camera)
    if (!shown) {
      shown = true
      canvas.style.opacity = '1'
    }
  }

  function loop(): void {
    raf = 0
    if (disposed || !visible) return
    render(clock.getElapsedTime())
    raf = requestAnimationFrame(loop)
  }

  const resize = (): void => {
    const rect = el.getBoundingClientRect()
    const width = Math.max(1, rect.width)
    const height = Math.max(1, rect.height)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    // Con movimiento reducido el globo es una imagen fija: se repinta sólo al cambiar de tamaño.
    if (reducedMotion) render(0)
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(el)
  resize()

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible && !raf && !reducedMotion) raf = requestAnimationFrame(loop)
  })
  visibilityObserver.observe(el)

  if (!reducedMotion) raf = requestAnimationFrame(loop)

  return {
    setPointer(x, y) {
      pointerX = x
      pointerY = y
    },
    setScroll(progress) {
      scroll = progress
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      for (const item of disposables) item.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
