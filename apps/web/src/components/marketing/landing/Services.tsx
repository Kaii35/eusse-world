import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import {
  HUBS,
  LAST_MILE_STAGES,
  SECTION_IDS,
  SERVICE_FEATURES,
  STANDARD_SERVICES,
  TRANSPORT_MODES,
  type ServiceKey,
} from './data'
import { ArrowRightIcon, CheckIcon, PlaneIcon } from './icons'
import styles from './landing.module.css'
import { ServiceIcon, ShipIcon, TruckIcon } from './serviceIcons'

/**
 * Servicios en bento grid: dos tarjetas anchas con visual animado (transporte y última
 * milla), cuatro estándar y una de llamada a la acción.
 *
 * Movimiento: CSS y SMIL, sin JS salvo el foco de luz que sigue al cursor (motion.ts).
 * Con `prefers-reduced-motion` las animaciones en bucle se detienen.
 */

const MODE_ICONS = { air: PlaneIcon, sea: ShipIcon, land: TruckIcon } as const

const pad = (n: number): string => String(n).padStart(2, '0')

type T = Awaited<ReturnType<typeof getTranslations<'landing.services'>>>

function Features({ t, service, label }: { t: T; service: ServiceKey; label: string }) {
  return (
    <ul className={styles.svcFeatures} aria-label={label}>
      {SERVICE_FEATURES.map((f) => (
        <li key={f}>
          <CheckIcon size={14} className={styles.svcFeatureIcon} />
          {t(`${service}.features.${f}`)}
        </li>
      ))}
    </ul>
  )
}

function QuoteLink({ service, label }: { service: ServiceKey; label: string }) {
  return (
    <a className={styles.svcLink} href={`#${SECTION_IDS.contact}`} data-quote-service={service}>
      {label}
      <ArrowRightIcon size={16} className={styles.svcLinkArrow} />
    </a>
  )
}

/* Trazados de 24×24 (los mismos de los iconos) para usarlos dentro de la escena SVG. */
const PLANE =
  'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z'
const SHIP = [
  'M12 10.189V14',
  'M12 2v3',
  'M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6',
  'M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76',
]
const TRUCK = [
  'M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2',
  'M15 18H9',
  'M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14',
]

/** Icono de 24×24 centrado en el origen, para mover con `transform` o `animateMotion`. */
function SceneIcon({ paths, size, wheels }: { paths: string[]; size: number; wheels?: boolean }) {
  const s = size / 24
  return (
    <g transform={`translate(${String(-size / 2)} ${String(-size / 2)}) scale(${String(s)})`}>
      <rect x="-3" y="-3" width="30" height="30" rx="8" className={styles.sceneIconBg} />
      {paths.map((d) => (
        <path key={d} d={d} className={styles.sceneIconStroke} />
      ))}
      {wheels ? (
        <>
          <circle cx="17" cy="18" r="2" className={styles.sceneIconStroke} />
          <circle cx="7" cy="18" r="2" className={styles.sceneIconStroke} />
        </>
      ) : null}
    </g>
  )
}

/**
 * Escena de los tres modos de transporte, animada sólo con SVG y CSS:
 *  · Aéreo: un avión vuela en arco BOG → MIA dejando estela (animateMotion + trazo).
 *  · Marítimo: un barco cruza un mar de olas en movimiento.
 *  · Terrestre: un camión avanza por una carretera con marcas que fluyen.
 * Un ciclo de 9 s destaca cada capa por turnos, sincronizado con las etiquetas de modo.
 * Con `prefers-reduced-motion` la escena queda quieta y completa.
 */
function ModesVisual() {
  const [from, to] = [HUBS[0], HUBS[3]]
  const flight = 'M46 112 C 110 18, 238 6, 300 70'
  const wave =
    'M0 6 q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0'
  return (
    <svg className={styles.scene} viewBox="0 0 340 250" aria-hidden="true">
      <defs>
        <pattern id="scene-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" className={styles.routeDot} />
        </pattern>
        <linearGradient id="scene-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scene-sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="scene-clip">
          <rect width="340" height="250" rx="18" />
        </clipPath>
      </defs>

      <g clipPath="url(#scene-clip)">
        <rect width="340" height="250" fill="url(#scene-dots)" />
        <rect width="340" height="150" fill="url(#scene-sky)" />

        {/* Aéreo */}
        <g className={styles.sceneLayer} data-layer="air">
          <path d={flight} className={styles.routeBase} />
          <path d={flight} pathLength={1} className={styles.sceneTrail} />
          {[
            { x: 46, y: 112, code: from?.iata },
            { x: 300, y: 70, code: to?.iata },
          ].map((node) => (
            <g key={node.code}>
              <circle cx={node.x} cy={node.y} r="13" className={styles.routePulse} />
              <circle cx={node.x} cy={node.y} r="5" className={styles.routeNode} />
              <text x={node.x} y={node.y + 24} textAnchor="middle" className={styles.routeLabel}>
                {node.code}
              </text>
            </g>
          ))}
          <g className={styles.scenePlane}>
            <g transform="rotate(45)">
              <SceneIcon paths={[PLANE]} size={22} />
            </g>
            <animateMotion
              dur="4.5s"
              repeatCount="indefinite"
              path={flight}
              rotate="auto"
              calcMode="linear"
              keyPoints="0;1"
              keyTimes="0;1"
            />
          </g>
        </g>

        {/* Marítimo */}
        <g className={styles.sceneLayer} data-layer="sea">
          <rect y="160" width="340" height="44" fill="url(#scene-sea)" />
          <g className={styles.sceneWaves}>
            <path d={wave} transform="translate(0 166)" className={styles.sceneWave} />
            <path
              d={wave}
              transform="translate(-10 182)"
              className={cx(styles.sceneWave, styles.sceneWaveSoft)}
            />
          </g>
          <g className={styles.sceneShipLane}>
            <g className={styles.sceneShip}>
              <SceneIcon paths={SHIP} size={26} />
            </g>
          </g>
        </g>

        {/* Terrestre */}
        <g className={styles.sceneLayer} data-layer="land">
          <rect y="214" width="340" height="22" className={styles.sceneRoad} />
          <line x1="0" y1="225" x2="340" y2="225" className={styles.sceneRoadMarks} />
          <g className={styles.sceneTruckLane}>
            <SceneIcon paths={TRUCK} size={24} wheels />
          </g>
        </g>
      </g>
    </svg>
  )
}

function StagesVisual({ labels }: { labels: string[] }) {
  return (
    <div className={styles.stages} aria-hidden="true">
      <div className={styles.stageTrack}>
        <span className={styles.stageFill} />
        <span className={styles.stageTruckLane}>
          <span className={styles.stageTruck}>
            <TruckIcon />
          </span>
        </span>
      </div>
      <ol className={styles.stageList}>
        {labels.map((label) => (
          <li key={label} className={styles.stage}>
            <span className={styles.stageDot} />
            {label}
          </li>
        ))}
      </ol>
    </div>
  )
}

export async function Services() {
  const t = await getTranslations('landing.services')
  const featuresLabel = t('featuresLabel')
  const cta = t('cta')

  return (
    <section id={SECTION_IDS.services} className={styles.services} aria-labelledby="services-title">
      <div className={styles.container}>
        <div className={styles.sectionHead} data-reveal="">
          <div>
            <span className={styles.eyebrow}>{t('eyebrow')}</span>
            <h2 id="services-title" className={styles.sectionTitle}>
              {t('title')}
            </h2>
          </div>
          <p className={styles.lead}>{t('lead')}</p>
        </div>

        <ul className={styles.bento} data-spotlight-group="">
          {/* Destacada: transporte internacional */}
          <li className={styles.bentoWide}>
            <article
              className={cx(styles.svcCard, styles.svcNight)}
              data-spotlight=""
              data-reveal=""
            >
              <div className={styles.svcFeaturedLayout}>
                <div className={styles.svcBody}>
                  <div className={styles.svcTop}>
                    <span className={styles.svcIcon}>
                      <ServiceIcon service="transport" />
                    </span>
                    <span className={styles.svcIndex}>{pad(1)}</span>
                  </div>
                  <h3 className={styles.svcTitle}>{t('transport.title')}</h3>
                  <p className={styles.svcText}>{t('transport.description')}</p>
                  <ul className={styles.modeList}>
                    {TRANSPORT_MODES.map((mode) => {
                      const Icon = MODE_ICONS[mode]
                      return (
                        <li key={mode} className={styles.mode} data-mode={mode}>
                          <Icon />
                          {t(`transport.modes.${mode}`)}
                        </li>
                      )
                    })}
                  </ul>
                  <Features t={t} service="transport" label={featuresLabel} />
                  <QuoteLink service="transport" label={cta} />
                </div>
                <ModesVisual />
              </div>
            </article>
          </li>

          {STANDARD_SERVICES.map((service, i) => (
            <li key={service}>
              <article
                className={styles.svcCard}
                data-spotlight=""
                data-reveal=""
                data-delay={(i % 3) * 80}
              >
                <div className={styles.svcTop}>
                  <span className={styles.svcIcon}>
                    <ServiceIcon service={service} />
                  </span>
                  <span className={styles.svcIndex}>{pad(i + 2)}</span>
                </div>
                <h3 className={styles.svcTitle}>
                  {t(`${service}.title`)}
                  {service === 'personalShopper' ? (
                    <span className={styles.serviceNote}>{t('personalShopper.note')}</span>
                  ) : null}
                </h3>
                <p className={styles.svcText}>{t(`${service}.description`)}</p>
                <Features t={t} service={service} label={featuresLabel} />
                <QuoteLink service={service} label={cta} />
              </article>
            </li>
          ))}

          {/* Ancha: última milla, con la línea de entrega animada */}
          <li className={styles.bentoWide}>
            <article className={styles.svcCard} data-spotlight="" data-reveal="">
              <div className={styles.svcFeaturedLayout}>
                <div className={styles.svcBody}>
                  <div className={styles.svcTop}>
                    <span className={styles.svcIcon}>
                      <ServiceIcon service="lastMile" />
                    </span>
                    <span className={styles.svcIndex}>{pad(6)}</span>
                  </div>
                  <h3 className={styles.svcTitle}>{t('lastMile.title')}</h3>
                  <p className={styles.svcText}>{t('lastMile.description')}</p>
                  <Features t={t} service="lastMile" label={featuresLabel} />
                  <QuoteLink service="lastMile" label={cta} />
                </div>
                <StagesVisual labels={LAST_MILE_STAGES.map((s) => t(`lastMile.stages.${s}`))} />
              </div>
            </article>
          </li>

          {/* Llamada a la acción */}
          <li>
            <article
              className={cx(styles.svcCard, styles.svcNight, styles.svcCta)}
              data-spotlight=""
              data-reveal=""
              data-delay="80"
            >
              <img
                src="/landing/logo-mark.png"
                alt=""
                width={153}
                height={96}
                className={styles.svcCtaMark}
                decoding="async"
                loading="lazy"
              />
              <span className={cx(styles.eyebrow, styles.eyebrowNight)}>{t('custom.eyebrow')}</span>
              <h3 className={styles.svcTitle}>{t('custom.title')}</h3>
              <p className={styles.svcText}>{t('custom.description')}</p>
              <a
                className={cx(styles.button, styles.buttonPrimary)}
                href={`#${SECTION_IDS.contact}`}
              >
                {t('custom.cta')}
                <ArrowRightIcon className={styles.buttonArrow} />
              </a>
            </article>
          </li>
        </ul>
      </div>
    </section>
  )
}
