import type { CountryCode } from './data'

/**
 * Banderas en SVG (proporción 3:2, simplificadas para tamaño de icono).
 *
 * Sus colores son los oficiales de cada bandera, no colores de marca: por eso no salen de
 * @eusse/tokens y no cambian con el tema. No se usan emojis de bandera porque Windows no
 * los dibuja (muestra "CO", "US"...).
 *
 * Decorativas (`aria-hidden`): el nombre del país siempre va al lado.
 */

const W = 30
const H = 20

function Colombia() {
  return (
    <>
      <rect width={W} height={10} fill="#FCD116" />
      <rect y={10} width={W} height={5} fill="#003893" />
      <rect y={15} width={W} height={5} fill="#CE1126" />
    </>
  )
}

function CostaRica() {
  const band = H / 6
  return (
    <>
      <rect width={W} height={H} fill="#FFFFFF" />
      <rect width={W} height={band} fill="#002B7F" />
      <rect y={band * 2} width={W} height={band * 2} fill="#CE1126" />
      <rect y={band * 5} width={W} height={band} fill="#002B7F" />
    </>
  )
}

function Nicaragua() {
  const band = H / 3
  return (
    <>
      <rect width={W} height={H} fill="#FFFFFF" />
      <rect width={W} height={band} fill="#0067C6" />
      <rect y={band * 2} width={W} height={band} fill="#0067C6" />
      {/* Escudo simplificado: el triángulo equilátero central. */}
      <path d="M15 7.6 17.4 11.8H12.6Z" fill="none" stroke="#0067C6" strokeWidth={0.7} />
    </>
  )
}

function UnitedStates() {
  const stripe = H / 13
  const cantonH = stripe * 7
  const cantonW = 12
  const stars: [number, number][] = []
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      stars.push([1.4 + col * 2.3 + (row % 2) * 1.1, 1.3 + row * 2.6])
    }
  }
  return (
    <>
      <rect width={W} height={H} fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width={W} height={stripe} fill="#B22234" />
      ))}
      <rect width={cantonW} height={cantonH} fill="#3C3B6E" />
      {stars.map(([cx, cy]) => (
        <circle key={`${String(cx)}-${String(cy)}`} cx={cx} cy={cy} r={0.45} fill="#FFFFFF" />
      ))}
    </>
  )
}

const FLAGS: Record<CountryCode, () => React.ReactNode> = {
  CO: Colombia,
  CR: CostaRica,
  NI: Nicaragua,
  US: UnitedStates,
}

export function Flag({
  country,
  width = 30,
  className,
}: {
  country: CountryCode
  width?: number
  className?: string | undefined
}) {
  const Content = FLAGS[country]
  return (
    <svg
      width={width}
      height={(width * H) / W}
      viewBox={`0 0 ${String(W)} ${String(H)}`}
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <Content />
    </svg>
  )
}
