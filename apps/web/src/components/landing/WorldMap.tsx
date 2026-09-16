import { cn } from '@eusse/ui'

import { riseDelay } from './motion'
import { MAP_ARCS, MAP_POINTS, MAP_VIEWBOX } from './network'

import type { MapPlace } from './network'

type MapLabel = {
  place: MapPlace
  title: string
  detail: string
  side: 'left' | 'right' | 'below'
}

type WorldMapProps = {
  labels: MapLabel[]
  className?: string
}

/**
 * Curva cuadrática desplazada en perpendicular a la recta, proporcional a la distancia:
 * los corredores que salen de un mismo nodo se abren en abanico en vez de solaparse.
 */
function arcPath(from: MapPlace, to: MapPlace): string {
  const [x1, y1] = MAP_POINTS[from]
  const [x2, y2] = MAP_POINTS[to]
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const bend = length * 0.28 + 0.6
  const controlX = (x1 + x2) / 2 + (dy / length) * bend
  const controlY = (y1 + y2) / 2 - (dx / length) * bend
  return `M ${String(x1)} ${String(y1)} Q ${String(controlX)} ${String(controlY)} ${String(x2)} ${String(y2)}`
}

const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`

/**
 * Mapa punteado de las Américas con los corredores de la red.
 *
 * Server Component sin JavaScript: los puntos son un SVG estático generado una vez con
 * dotted-map (public/maps) y pintado como máscara con el token --color-map-dot; los
 * arcos se trazan con CSS al revelarse la sección y los nodos laten con transform.
 */
export function WorldMap({ labels, className }: WorldMapProps) {
  const places = Object.keys(MAP_POINTS) as MapPlace[]
  const labelled = new Set(labels.map((label) => label.place))

  return (
    <div className={cn('aspect-map relative w-full', className)}>
      <div aria-hidden className="mask-fade-y absolute inset-0">
        <div className="map-dots size-full" />
      </div>

      <svg
        aria-hidden
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        {MAP_ARCS.map(({ from, to, expansion }, index) => (
          <path
            key={from + to}
            d={arcPath(from, to)}
            pathLength={1}
            data-arc
            fill="none"
            strokeWidth={expansion ? 0.2 : 0.32}
            strokeLinecap="round"
            className={cn(
              riseDelay(index * 2),
              expansion ? 'stroke-brand-bright/50' : 'stroke-brand',
            )}
          />
        ))}

        {places.map((place, index) => {
          const [cx, cy] = MAP_POINTS[place]
          const hub = labelled.has(place)
          return (
            <g key={place}>
              {hub ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={0.7}
                  className={cn(
                    'fill-brand/40 transform-fill motion-safe:animate-glow',
                    riseDelay(index * 3),
                  )}
                />
              ) : null}
              <circle
                cx={cx}
                cy={cy}
                r={hub ? 0.7 : 0.45}
                className={cn(hub ? 'fill-brand stroke-page' : 'fill-brand-bright/70')}
                strokeWidth={hub ? 0.25 : 0}
              />
            </g>
          )
        })}
      </svg>

      {labels.map(({ place, title, detail, side }) => {
        const [x, y] = MAP_POINTS[place]
        return (
          <p
            key={place}
            className={cn(
              'pointer-events-none absolute flex flex-col leading-tight',
              side !== 'below' && '-translate-y-1/2',
              side === 'left' && '-translate-x-full items-end pr-4',
              side === 'right' && 'items-start pl-4',
              side === 'below' && '-translate-x-1/2 translate-y-2 items-center',
            )}
            style={{ left: percent(x, MAP_VIEWBOX.width), top: percent(y, MAP_VIEWBOX.height) }}
          >
            <span className="font-display text-ink text-body-sm font-semibold">{title}</span>
            <span className="text-brand text-caption font-mono">{detail}</span>
          </p>
        )
      })}
    </div>
  )
}
