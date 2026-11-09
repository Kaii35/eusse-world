import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import {
  arcPath,
  globeMarkerId,
  HUBS,
  PLANNER_INCLUDES,
  PLANNER_MAP,
  projectHub,
  SECTION_IDS,
  TRANSPORT_MODES,
  type CountryCode,
} from './data'
import { Flag } from './Flags'
import { ArrowRightIcon, CheckIcon, PlaneIcon } from './icons'
import styles from './landing.module.css'
import { ShipIcon, TruckIcon } from './serviceIcons'

const MODE_ICONS = { air: PlaneIcon, sea: ShipIcon, land: TruckIcon } as const

/** Etiqueta anclada a un marcador o arco de cobe (CSS Anchor Positioning). */
function anchorStyle(id: string): React.CSSProperties {
  return {
    ['--label-anchor' as string]: `--cobe-${id}`,
    ['--label-visible' as string]: `var(--cobe-visible-${id}, 0)`,
  }
}

const DEFAULT = { origin: 'US' as CountryCode, destination: 'CO' as CountryCode, mode: 'air' }

/**
 * Planificador de ruta: el visitante elige origen, destino y modalidad, ve la ruta
 * dibujada y la envía al formulario con un clic.
 *
 * Todo se renderiza aquí, en el servidor, con la ruta por defecto. `planner.ts` sólo
 * cambia atributos y el trazado del arco: sin componente React en el cliente, para no
 * gastar presupuesto de JS. Sin JS se ve la ruta por defecto y el botón lleva al
 * formulario.
 *
 * No muestra precios ni tiempos: los precios nunca se calculan en el cliente y los
 * tiempos dependen de la carga (los da el asesor en la propuesta).
 */
export async function RoutePlanner() {
  const t = await getTranslations('landing.planner')
  const tc = await getTranslations('landing.countries')
  const tm = await getTranslations('landing.services.transport.modes')

  const points = Object.fromEntries(HUBS.map((hub) => [hub.country, projectHub(hub)])) as Record<
    CountryCode,
    { x: number; y: number }
  >
  const start = points[DEFAULT.origin]
  const end = points[DEFAULT.destination]
  const route = arcPath(start, end)

  const chip = (group: 'origin' | 'destination', code: CountryCode) => {
    const active = DEFAULT[group] === code
    return (
      <button
        key={code}
        type="button"
        className={styles.plannerChip}
        data-planner-pick={group}
        data-value={code}
        data-label={tc(code)}
        aria-pressed={active}
      >
        <Flag country={code} width={22} className={styles.flag} />
        {tc(code)}
      </button>
    )
  }

  return (
    <section className={styles.planner} aria-labelledby="planner-title">
      <div className={styles.container}>
        <div className={styles.plannerHead} data-reveal="">
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h2 id="planner-title" className={styles.sectionTitle}>
            {t('title')}
          </h2>
          <p className={styles.lead}>{t('lead')}</p>
        </div>

        <div
          className={styles.plannerShell}
          data-planner=""
          data-origin={DEFAULT.origin}
          data-destination={DEFAULT.destination}
          data-mode={DEFAULT.mode}
          data-reveal=""
        >
          {/* Controles */}
          <div className={styles.plannerControls}>
            <fieldset className={styles.plannerGroup}>
              <legend className={styles.plannerLegend}>{t('origin')}</legend>
              <div className={styles.plannerChips}>
                {HUBS.map((hub) => chip('origin', hub.country))}
              </div>
            </fieldset>
            <fieldset className={styles.plannerGroup}>
              <legend className={styles.plannerLegend}>{t('destination')}</legend>
              <div className={styles.plannerChips}>
                {HUBS.map((hub) => chip('destination', hub.country))}
              </div>
            </fieldset>
            <fieldset className={styles.plannerGroup}>
              <legend className={styles.plannerLegend}>{t('mode')}</legend>
              <div className={styles.plannerChips}>
                {TRANSPORT_MODES.map((mode) => {
                  const Icon = MODE_ICONS[mode]
                  return (
                    <button
                      key={mode}
                      type="button"
                      className={styles.plannerChip}
                      data-planner-pick="mode"
                      data-value={mode}
                      data-label={tm(mode)}
                      aria-pressed={DEFAULT.mode === mode}
                    >
                      <Icon />
                      {tm(mode)}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>

          {/* Mapa y resumen */}
          <div className={styles.plannerStage}>
            <div className={styles.plannerVisual} role="img" aria-label={t('mapLabel')}>
              <svg
                className={styles.plannerMap}
                viewBox={`0 0 ${String(PLANNER_MAP.width)} ${String(PLANNER_MAP.height)}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="planner-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.1" className={styles.plannerDot} />
                  </pattern>
                  <radialGradient id="planner-glow">
                    <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#planner-dots)" />
                {/* Todas las rutas posibles, tenues: la red completa */}
                {HUBS.flatMap((a, i) =>
                  HUBS.slice(i + 1).map((b) => (
                    <path
                      key={`${a.country}-${b.country}`}
                      d={arcPath(points[a.country], points[b.country])}
                      className={styles.plannerNetwork}
                    />
                  )),
                )}
                <path d={route} className={styles.plannerArcGlow} data-planner-arc="" />
                <path d={route} className={styles.plannerArc} data-planner-arc="" />
                <g className={styles.plannerShipment}>
                  <circle r="10" className={styles.plannerHalo} />
                  <circle r="5" className={styles.plannerHead} />
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={route}
                    data-planner-motion=""
                  />
                </g>
                {HUBS.map((hub) => {
                  const p = points[hub.country]
                  const role =
                    hub.country === DEFAULT.origin
                      ? 'origin'
                      : hub.country === DEFAULT.destination
                        ? 'destination'
                        : 'idle'
                  return (
                    <g
                      key={hub.country}
                      className={styles.plannerNode}
                      data-planner-node={hub.country}
                      data-role={role}
                      transform={`translate(${String(p.x)} ${String(p.y)})`}
                    >
                      <circle r="26" fill="url(#planner-glow)" className={styles.plannerNodeGlow} />
                      <circle r="16" className={styles.plannerNodePulse} />
                      <circle r="6" className={styles.plannerNodeDot} />
                      <text y="-16" textAnchor="middle" className={styles.plannerNodeLabel}>
                        {hub.iata}
                      </text>
                      <text y="28" textAnchor="middle" className={styles.plannerNodeName}>
                        {tc(hub.country)}
                      </text>
                    </g>
                  )
                })}
              </svg>
              {/* Globo interactivo (cobe): sustituye al diagrama cuando hay GPU. */}
              <div className={styles.plannerGlobe} aria-hidden="true">
                {/* Caja cuadrada: cobe envuelve el canvas y coloca sus anclas en % de ella. */}
                <div className={styles.plannerGlobeBox}>
                  <canvas className={styles.plannerGlobeCanvas} data-planner-globe="" />
                </div>
                {HUBS.map((hub) => (
                  <span
                    key={hub.iata}
                    className={styles.globeLabel}
                    style={anchorStyle(globeMarkerId(hub.iata))}
                    data-planner-label={hub.country}
                    data-role={
                      hub.country === DEFAULT.origin
                        ? 'origin'
                        : hub.country === DEFAULT.destination
                          ? 'destination'
                          : 'idle'
                    }
                  >
                    {tc(hub.country)}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.plannerSummary}>
              <p className={styles.plannerSummaryLabel}>{t('summary')}</p>
              <p className={styles.plannerRoute} aria-live="polite">
                <span data-planner-text="origin">{tc(DEFAULT.origin)}</span>
                <ArrowRightIcon size={16} className={styles.plannerRouteArrow} />
                <span data-planner-text="destination">{tc(DEFAULT.destination)}</span>
                <span className={styles.plannerModeTag} data-planner-text="mode">
                  {tm(DEFAULT.mode as 'air')}
                </span>
              </p>
              <p className={styles.plannerIncludesTitle}>{t('includesTitle')}</p>
              <ul className={styles.plannerIncludes}>
                {PLANNER_INCLUDES.map((key) => (
                  <li key={key}>
                    <CheckIcon size={14} />
                    {t(`includes.${key}`)}
                  </li>
                ))}
              </ul>
              <a
                className={cx(styles.button, styles.buttonPrimary, styles.plannerCta)}
                href={`#${SECTION_IDS.contact}`}
                data-planner-submit=""
                data-mode-prefix={t('detailsPrefill')}
              >
                {t('cta')}
                <ArrowRightIcon className={styles.buttonArrow} />
              </a>
              <p className={styles.plannerNote}>{t('note')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
