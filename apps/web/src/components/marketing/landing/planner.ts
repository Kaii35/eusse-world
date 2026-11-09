import { arcPath, HUBS, projectHub, type CountryCode } from './data'

import type { RouteGlobe } from './routeGlobe'

type Group = 'origin' | 'destination' | 'mode'

/**
 * Comportamiento del planificador de ruta (RoutePlanner.tsx). El HTML llega completo del
 * servidor; aquí sólo se cambian atributos, textos ya traducidos (`data-label`) y el
 * trazado del arco. Devuelve la función de limpieza.
 */
export function initRoutePlanner(
  root: HTMLElement,
  { reducedMotion }: { reducedMotion: boolean },
): () => void {
  const shell = root.querySelector<HTMLElement>('[data-planner]')
  if (!shell) return () => undefined

  const points = new Map(HUBS.map((hub) => [hub.country, projectHub(hub)]))
  const state: Record<Group, string> = {
    origin: shell.dataset.origin ?? 'US',
    destination: shell.dataset.destination ?? 'CO',
    mode: shell.dataset.mode ?? 'air',
  }

  // Globo interactivo (cobe): se crea al entrar en pantalla; si no hay GPU, se queda el SVG.
  let globe: RouteGlobe | null = null
  let disposed = false
  const canvas = shell.querySelector<HTMLCanvasElement>('[data-planner-globe]')
  const globeObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || !canvas) return
      globeObserver.disconnect()
      void import('./routeGlobe')
        .then(({ createRouteGlobe }) =>
          createRouteGlobe(canvas, {
            reducedMotion,
            from: state.origin as CountryCode,
            to: state.destination as CountryCode,
          }),
        )
        .then((created) => {
          if (disposed) {
            created?.dispose()
            return
          }
          globe = created
          if (globe) shell.dataset.globe = 'ready'
        })
        .catch(() => {
          // Sin cobe o sin WebGL: el diagrama SVG sigue funcionando.
        })
    },
    { rootMargin: '200px 0px' },
  )
  if (canvas) globeObserver.observe(shell)

  const labelOf = (group: Group, value: string): string =>
    shell.querySelector<HTMLElement>(`[data-planner-pick="${group}"][data-value="${value}"]`)
      ?.dataset.label ?? value

  const render = (): void => {
    shell.querySelectorAll<HTMLElement>('[data-planner-pick]').forEach((button) => {
      const group = button.dataset.plannerPick as Group
      button.setAttribute('aria-pressed', String(state[group] === button.dataset.value))
    })

    shell.querySelectorAll<SVGGElement>('[data-planner-node]').forEach((node) => {
      const code = node.dataset.plannerNode
      node.dataset.role =
        code === state.origin ? 'origin' : code === state.destination ? 'destination' : 'idle'
    })

    const from = points.get(state.origin as CountryCode)
    const to = points.get(state.destination as CountryCode)
    if (from && to) {
      const d = arcPath(from, to)
      shell.querySelectorAll('[data-planner-arc]').forEach((arc) => {
        arc.setAttribute('d', d)
      })
      const motion = shell.querySelector<SVGAnimateMotionElement>('[data-planner-motion]')
      motion?.setAttribute('path', d)
      motion?.beginElement()
    }

    // Reinicia el trazado del arco (animación CSS sobre `data-drawing`).
    shell.removeAttribute('data-drawing')
    void shell.getBoundingClientRect()
    shell.setAttribute('data-drawing', '')

    globe?.setRoute(state.origin as CountryCode, state.destination as CountryCode)
    shell.querySelectorAll<HTMLElement>('[data-planner-label]').forEach((label) => {
      const code = label.dataset.plannerLabel
      label.dataset.role =
        code === state.origin ? 'origin' : code === state.destination ? 'destination' : 'idle'
    })

    for (const group of ['origin', 'destination', 'mode'] as const) {
      shell.dataset[group] = state[group]
      const text = shell.querySelector(`[data-planner-text="${group}"]`)
      if (text) text.textContent = labelOf(group, state[group])
    }
  }

  const onClick = (event: MouseEvent): void => {
    const target = event.target as Element | null
    const pick = target?.closest<HTMLElement>('[data-planner-pick]')
    if (pick) {
      const group = pick.dataset.plannerPick as Group
      const value = pick.dataset.value ?? ''
      if (state[group] === value) return
      // Origen y destino no pueden coincidir: se intercambian.
      if (group === 'origin' && value === state.destination) state.destination = state.origin
      if (group === 'destination' && value === state.origin) state.origin = state.destination
      state[group] = value
      render()
      return
    }

    // "Cotizar esta ruta": lleva la elección al formulario. El enlace sigue haciendo scroll.
    const submit = target?.closest<HTMLElement>('[data-planner-submit]')
    const form = root.querySelector<HTMLFormElement>('#contacto form')
    if (!submit || !form) return
    const set = (name: string, value: string): void => {
      const field = form.elements.namedItem(name)
      if (field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
        field.value = value
      }
    }
    set('origin', state.origin)
    set('destination', state.destination)
    set('service', 'transport')
    const details = form.elements.namedItem('details')
    if (details instanceof HTMLTextAreaElement && details.value.trim() === '') {
      details.value = `${submit.dataset.modePrefix ?? ''}: ${labelOf('mode', state.mode)}`
    }
  }

  shell.addEventListener('click', onClick)
  return () => {
    disposed = true
    globeObserver.disconnect()
    globe?.dispose()
    shell.removeEventListener('click', onClick)
  }
}
