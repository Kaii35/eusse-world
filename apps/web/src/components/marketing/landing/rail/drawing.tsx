/**
 * Dibujo SVG de las prendas y perchas del perchero (PersonalShopper).
 *
 * Origen: componente de referencia "product-rail-gallery" (apps/web/prompts/shirts.md).
 * Los colores de este archivo (madera, cromo, sombras en blanco/negro con opacidad) son
 * materiales del dibujo, no colores de marca: no salen de @eusse/tokens. El color de cada
 * prenda llega como dato.
 */
import * as React from 'react'

import { cx } from '../cx'

import {
  artFor,
  KINDS,
  mix,
  SIDE,
  sideShapes,
  silhouettePaths,
  VB_H,
  VB_W,
  type GarmentKind,
} from './art'
import styles from './rail.module.css'

export type HangerMaterial = 'wood' | 'matte' | 'none'

export function Defs({ uid }: { uid: string }) {
  return (
    <svg aria-hidden="true" width="0" height="0" className={styles.defs} focusable="false">
      <defs>
        {KINDS.map((kind) =>
          (['front', 'back'] as const).map((side) => (
            <clipPath key={`${kind}-${side}`} id={`${uid}-clip-${kind}-${side}`}>
              {silhouettePaths(artFor(kind, side)).map((d) => (
                <path key={d} d={d} />
              ))}
            </clipPath>
          )),
        )}
        <linearGradient id={`${uid}-volume`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="black" stopOpacity="0.34" />
          <stop offset="0.16" stopColor="black" stopOpacity="0.1" />
          <stop offset="0.42" stopColor="white" stopOpacity="0.07" />
          <stop offset="0.58" stopColor="white" stopOpacity="0.04" />
          <stop offset="0.84" stopColor="black" stopOpacity="0.12" />
          <stop offset="1" stopColor="black" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${uid}-drape`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.16" />
          <stop offset="0.22" stopColor="white" stopOpacity="0" />
          <stop offset="0.75" stopColor="black" stopOpacity="0.04" />
          <stop offset="1" stopColor="black" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient
          id={`${uid}-sidevol`}
          gradientUnits="userSpaceOnUse"
          x1="80"
          x2="120"
          y1="0"
          y2="0"
        >
          <stop offset="0" stopColor="white" stopOpacity="0.14" />
          <stop offset="0.28" stopColor="white" stopOpacity="0.04" />
          <stop offset="0.7" stopColor="black" stopOpacity="0.08" />
          <stop offset="0.95" stopColor="black" stopOpacity="0.3" />
          <stop offset="1" stopColor="black" stopOpacity="0.18" />
        </linearGradient>
        <filter id={`${uid}-cloth`} x="-12%" y="-4%" width="124%" height="108%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.016 0.028"
            numOctaves="2"
            seed="3"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="2.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        {KINDS.map((kind) => (
          <React.Fragment key={`side-${kind}`}>
            <clipPath id={`${uid}-sb-${kind}`}>
              <path d={sideShapes(kind).body} />
            </clipPath>
            <clipPath id={`${uid}-ss-${kind}`}>
              <path d={sideShapes(kind).sleeve} />
            </clipPath>
          </React.Fragment>
        ))}
        <linearGradient id={`${uid}-wood`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, sienna 55%, white)" />
          <stop offset="0.45" stopColor="color-mix(in oklab, sienna 80%, black)" />
          <stop offset="1" stopColor="color-mix(in oklab, sienna 45%, black)" />
        </linearGradient>
        <linearGradient
          id={`${uid}-woodgrain`}
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
          x1="0"
          x2="11"
          y1="0"
          y2="0.6"
        >
          <stop offset="0" stopColor="black" stopOpacity="0" />
          <stop offset="0.45" stopColor="black" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.08" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${uid}-chrome`}
          gradientUnits="userSpaceOnUse"
          x1="98.5"
          x2="101.7"
          y1="0"
          y2="0"
        >
          <stop offset="0" stopColor="color-mix(in oklab, white 45%, gray)" />
          <stop offset="0.35" stopColor="white" />
          <stop offset="0.78" stopColor="color-mix(in oklab, gray 65%, black)" />
          <stop offset="1" stopColor="color-mix(in oklab, gray 75%, white)" />
        </linearGradient>
        <pattern id={`${uid}-rib`} width="2.6" height="8" patternUnits="userSpaceOnUse">
          <rect width="1.1" height="8" fill="black" fillOpacity="0.2" />
          <rect x="1.3" width="0.7" height="8" fill="white" fillOpacity="0.08" />
        </pattern>
        <pattern id={`${uid}-knit`} width="5" height="4" patternUnits="userSpaceOnUse">
          <path
            d="M0,0 L2.5,4 L5,0"
            fill="none"
            stroke="black"
            strokeOpacity="0.09"
            strokeWidth="0.7"
          />
        </pattern>
        <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
        <filter id={`${uid}-soft`} x="-20%" y="-5%" width="140%" height="110%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
    </svg>
  )
}

const HOOK = 'M100,36 L100,-0.4 C100,-3.4 102.2,-4.2 103.9,-2.8 C104.9,-2 105.4,-1.2 105.6,-0.2'
const HOOK_HI = 'M99.5,30 L99.5,-0.2 C99.5,-2.4 101,-3.2 102.4,-2.6'
const BAR = 'M38,57 Q70,38 100,36 Q130,38 162,57'
const BAR_HI = 'M40,54.5 Q71,35.5 100,33.5 Q129,35.5 160,54.5'

function Hook({ uid }: { uid: string }) {
  return (
    <>
      <path
        d={HOOK}
        fill="none"
        stroke="black"
        strokeOpacity="0.28"
        strokeWidth="3.4"
        strokeLinecap="round"
        transform="translate(0.9 1.1)"
      />
      <path
        d={HOOK}
        fill="none"
        stroke={`url(#${uid}-chrome)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d={HOOK_HI}
        fill="none"
        stroke="white"
        strokeOpacity="0.6"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <ellipse cx="105.9" cy="0.6" rx="1.9" ry="0.9" fill="black" fillOpacity="0.4" />
      <rect x="96" y="27" width="8" height="9" rx="2" fill={`url(#${uid}-chrome)`} />
      <rect x="97.2" y="28.2" width="2" height="6.6" rx="1" fill="white" fillOpacity="0.5" />
    </>
  )
}

export function Hanger({
  uid,
  side,
  kind,
  material,
}: {
  uid: string
  side: 'front' | 'back'
  kind: GarmentKind | null
  material: HangerMaterial
}) {
  const art = kind ? artFor(kind, side) : null
  const bar = material === 'wood' ? `url(#${uid}-wood)` : 'currentColor'
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMin meet"
      className={cx(styles.layer, material === 'matte' && styles.matte)}
    >
      {art?.hood && <path d={art.hood} fill="var(--garment-color)" />}
      {art?.hood && <path d={art.hood} fill="black" fillOpacity="0.22" />}
      {art?.under && <path d={art.under} fill="var(--garment-under)" />}
      {material !== 'none' && (
        <>
          <path
            d={BAR}
            fill="none"
            stroke="black"
            strokeOpacity="0.25"
            strokeWidth="9.5"
            strokeLinecap="round"
            transform="translate(0.6 1.6)"
          />
          <path d={BAR} fill="none" stroke={bar} strokeWidth="8.5" strokeLinecap="round" />
          {material === 'wood' && (
            <path
              d={BAR}
              fill="none"
              stroke={`url(#${uid}-woodgrain)`}
              strokeWidth="8.5"
              strokeLinecap="round"
            />
          )}
          <path
            d={BAR_HI}
            fill="none"
            stroke="white"
            strokeOpacity={material === 'wood' ? 0.3 : 0.14}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <Hook uid={uid} />
        </>
      )}
    </svg>
  )
}

export function SideHanger({ uid, material }: { uid: string; material: HangerMaterial }) {
  if (material === 'none') return null
  const bar = material === 'wood' ? `url(#${uid}-wood)` : 'currentColor'
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMin meet"
      className={cx(styles.layer, material === 'matte' && styles.matte)}
    >
      <path d="M97.8,35 L102.2,35 L104.5,50 L95.5,50 Z" fill={bar} />
      <path d="M98.6,36 L100,36 L100,49 L97.3,49 Z" fill="white" fillOpacity="0.22" />
      <Hook uid={uid} />
    </svg>
  )
}

export function Fabric({
  uid,
  kind,
  side,
  color,
  trim,
}: {
  uid: string
  kind: GarmentKind
  side: 'front' | 'back'
  color: string
  trim: string
}) {
  const art = artFor(kind, side)
  const clip = `url(#${uid}-clip-${kind}-${side})`
  const knitted = kind === 'knit'
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMin meet"
      className={styles.layer}
    >
      <path d={art.body} fill={color} />
      {art.sleeves.map((d) => (
        <path key={d} d={d} fill={color} />
      ))}
      <g clipPath={clip}>
        {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
        {art.panels.map((panel) => (
          <path key={panel.d} d={panel.d} fill={mix(color, panel.t)} />
        ))}
        {art.ribs.map((d) => (
          <path key={d} d={d} fill={mix(trim, 0)} />
        ))}
        {art.ribs.map((d) => (
          <path key={`${d}-rib`} d={d} fill={`url(#${uid}-rib)`} />
        ))}
        <g filter={`url(#${uid}-soft)`} fill="none" strokeLinecap="round">
          {art.folds.map((d) => (
            <path key={d} d={d} stroke="black" strokeOpacity="0.22" strokeWidth="4" />
          ))}
          {art.folds.map((d) => (
            <path
              key={`${d}-hi`}
              d={d}
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="2"
              transform="translate(2.2 0)"
            />
          ))}
          {art.sleeves.map((d) => (
            <path key={`${d}-edge`} d={d} stroke="black" strokeOpacity="0.2" strokeWidth="3" />
          ))}
        </g>
        <rect width={VB_W} height={VB_H} fill={`url(#${uid}-volume)`} />
        <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
        <rect
          width={VB_W}
          height={VB_H}
          filter={`url(#${uid}-grain)`}
          opacity="0.16"
          style={{ mixBlendMode: 'multiply' }}
        />
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {art.seams.map((d) => (
          <path key={d} d={d} stroke="black" strokeOpacity="0.22" strokeWidth="0.8" />
        ))}
        {art.stitches.map((d) => (
          <path
            key={d}
            d={d}
            stroke={mix(color, 0.35)}
            strokeOpacity="0.5"
            strokeWidth="0.6"
            strokeDasharray="1.6 1.4"
          />
        ))}
        {art.cords?.map((d) => (
          <path key={d} d={d} stroke={trim} strokeWidth="1.8" />
        ))}
      </g>
      {art.cords?.map((d) => {
        const end = d.trim().split(' ').at(-1)?.split(',').map(Number) ?? [0, 0]
        return (
          <rect
            key={`${d}-tip`}
            x={(end[0] ?? 0) - 1.4}
            y={(end[1] ?? 0) - 1}
            width="2.8"
            height="6"
            rx="1"
            fill={mix(trim, -0.3)}
          />
        )
      })}
      {art.buttons?.map(([x, y]) => (
        <g key={`${String(x)}-${String(y)}`}>
          <circle cx={x} cy={y} r="2.6" fill={mix(trim, -0.15)} />
          <circle cx={(x ?? 0) - 0.6} cy={(y ?? 0) - 0.7} r="0.9" fill="white" fillOpacity="0.45" />
        </g>
      ))}
    </svg>
  )
}

export function SideArt({
  uid,
  kind,
  color,
  trim,
}: {
  uid: string
  kind: GarmentKind
  color: string
  trim: string
}) {
  const { body, sleeve, hood, cuff } = sideShapes(kind)
  const knitted = kind === 'knit'
  const soft = `url(#${uid}-soft)`
  const hem = SIDE[kind].hem
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMin meet"
      className={styles.layer}
    >
      <g filter={`url(#${uid}-cloth)`}>
        {hood && <path d={hood} fill={mix(color, -0.14)} />}
        {hood && <path d={hood} fill="none" stroke="black" strokeOpacity="0.2" strokeWidth="1.2" />}
        <path d={body} fill={color} />
        <g clipPath={`url(#${uid}-sb-${kind})`}>
          {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
          <g filter={soft} fill="none" strokeLinecap="round">
            <path
              d={`M90,${cuff + 10} C87,150 92,190 88,${hem - 4}`}
              stroke="black"
              strokeOpacity="0.24"
              strokeWidth="2.6"
            />
            <path
              d={`M92,${cuff + 10} C89,150 94,190 90,${hem - 4}`}
              stroke="white"
              strokeOpacity="0.14"
              strokeWidth="1.2"
            />
            <path
              d={`M106,${cuff + 6} C109,140 104,186 108,${hem - 2}`}
              stroke="black"
              strokeOpacity="0.17"
              strokeWidth="2.2"
            />
            <path
              d={`M107.6,${cuff + 6} C110.6,140 105.6,186 109.6,${hem - 2}`}
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <path
              d={`M99,${cuff + 30} C97,170 101,205 98,${hem - 2}`}
              stroke="black"
              strokeOpacity="0.1"
              strokeWidth="2"
            />
            <path
              d={`M112,${cuff + 40} C113,170 111,200 113,${hem - 10}`}
              stroke="black"
              strokeOpacity="0.12"
              strokeWidth="1.6"
            />
            <path
              d={`M84,${cuff + 50} C86,160 85,200 86,${hem - 6}`}
              stroke="white"
              strokeOpacity="0.2"
              strokeWidth="1.4"
            />
            <path
              d={`M80,${cuff + 6} C90,${cuff + 12} 110,${cuff + 12} 120,${cuff + 7}`}
              stroke="black"
              strokeOpacity="0.4"
              strokeWidth="6"
            />
            <path
              d={`M84,${hem + 1} C92,${hem + 6} 108,${hem + 6} 116,${hem + 1}`}
              stroke="black"
              strokeOpacity="0.32"
              strokeWidth="6"
            />
          </g>
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sidevol)`} />
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
          <rect
            width={VB_W}
            height={VB_H}
            filter={`url(#${uid}-grain)`}
            opacity="0.16"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>
        <path d={sleeve} fill={color} />
        <g clipPath={`url(#${uid}-ss-${kind})`}>
          {knitted && <rect width={VB_W} height={VB_H} fill={`url(#${uid}-knit)`} />}
          <g filter={soft} fill="none" strokeLinecap="round">
            <path
              d={`M91,62 C88,78 90,${cuff - 14} 91,${cuff}`}
              stroke="black"
              strokeOpacity="0.16"
              strokeWidth="2.6"
            />
            <path
              d={`M92.6,62 C89.6,78 91.6,${cuff - 14} 92.6,${cuff}`}
              stroke="white"
              strokeOpacity="0.12"
              strokeWidth="1.1"
            />
            <path
              d={`M109,58 C112,76 110,${cuff - 14} 109,${cuff}`}
              stroke="black"
              strokeOpacity="0.2"
              strokeWidth="2.6"
            />
            <path
              d={`M86,72 C94,80 104,86 115,${cuff - 10}`}
              stroke="black"
              strokeOpacity="0.1"
              strokeWidth="2.4"
            />
            <path
              d="M84,53 C92,49 108,49 116,53"
              stroke="black"
              strokeOpacity="0.24"
              strokeWidth="3.6"
            />
            <path
              d={`M81,${cuff - 2} C92,${cuff + 4} 108,${cuff + 5} 119,${cuff + 2}`}
              stroke="black"
              strokeOpacity="0.34"
              strokeWidth="3.2"
            />
            <path
              d={`M85,60 C84,80 85,${cuff - 20} 85,${cuff - 4}`}
              stroke="white"
              strokeOpacity="0.22"
              strokeWidth="1.4"
            />
            <ellipse
              cx="94"
              cy="47.5"
              rx="6"
              ry="2.4"
              fill="white"
              fillOpacity="0.22"
              stroke="none"
            />
          </g>
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-sidevol)`} />
          <rect width={VB_W} height={VB_H} fill={`url(#${uid}-drape)`} />
          <rect
            width={VB_W}
            height={VB_H}
            filter={`url(#${uid}-grain)`}
            opacity="0.16"
            style={{ mixBlendMode: 'multiply' }}
          />
        </g>
        <path
          d={`M82,${cuff + 1} C92,${cuff + 6} 108,${cuff + 7} 118,${cuff + 4}`}
          fill="none"
          stroke={mix(color, 0.35)}
          strokeOpacity="0.45"
          strokeWidth="0.6"
          strokeDasharray="1.6 1.4"
        />
        <path
          d={`M86,${hem - 3} C92,${hem + 1} 109,${hem + 1} 115,${hem - 3}`}
          fill="none"
          stroke={mix(color, 0.35)}
          strokeOpacity="0.4"
          strokeWidth="0.6"
          strokeDasharray="1.6 1.4"
        />
      </g>
      <ellipse cx="100" cy="46" rx="10" ry="3.2" fill={trim} />
      <ellipse cx="100" cy="46" rx="10" ry="3.2" fill={`url(#${uid}-rib)`} />
      <ellipse
        cx="100"
        cy="46"
        rx="10"
        ry="3.2"
        fill="none"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="0.6"
      />
    </svg>
  )
}
