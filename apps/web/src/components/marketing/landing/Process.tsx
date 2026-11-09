import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { PROCESS_STEPS, SECTION_IDS } from './data'
import { ArrowRightIcon, FileTextIcon } from './icons'
import styles from './landing.module.css'
import { ServiceIcon } from './serviceIcons'

const STEP_ICONS = {
  quote: () => <FileTextIcon size={22} />,
  purchase: () => <ServiceIcon service="personalShopper" />,
  transit: () => <ServiceIcon service="transport" />,
  delivery: () => <ServiceIcon service="lastMile" />,
} as const

const pad = (n: number): string => String(n).padStart(2, '0')

/**
 * Cómo trabajamos: titular fijo a la izquierda y línea de tiempo a la derecha.
 *
 * `motion.ts` llena la línea según el scroll (`data-process-fill`, sólo `scaleY`) y marca
 * el paso que se está leyendo (`data-active`). Sin JS, todos los pasos se ven completos.
 */
export async function Process() {
  const t = await getTranslations('landing.process')

  return (
    <section
      id={SECTION_IDS.process}
      className={styles.process}
      aria-labelledby="process-title"
      data-process=""
    >
      <div className={styles.processGlow} aria-hidden="true" />
      <div className={cx(styles.container, styles.processLayout)}>
        <div className={styles.processIntro} data-reveal="">
          <span className={cx(styles.eyebrow, styles.eyebrowNight)}>{t('eyebrow')}</span>
          <h2 id="process-title" className={styles.sectionTitle}>
            {t('title')}
          </h2>
          <p className={cx(styles.lead, styles.processLead)}>{t('lead')}</p>
          <a className={cx(styles.button, styles.buttonPrimary)} href={`#${SECTION_IDS.contact}`}>
            {t('cta')}
            <ArrowRightIcon className={styles.buttonArrow} />
          </a>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineTrack} aria-hidden="true">
            <span className={styles.timelineFill} data-process-fill="" />
          </div>
          <ol className={styles.timelineList}>
            {PROCESS_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step]
              return (
                <li key={step} className={styles.timelineStep} data-process-step="">
                  <span className={styles.timelineNode} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <article className={styles.timelineCard}>
                    <div className={styles.timelineHead}>
                      <span className={styles.timelineIcon}>
                        <Icon />
                      </span>
                      <h3 className={styles.timelineTitle}>{t(`${step}.title`)}</h3>
                    </div>
                    <p className={styles.timelineText}>{t(`${step}.description`)}</p>
                    <p className={styles.timelineDeliverable}>
                      <span className={styles.timelineDeliverableLabel}>
                        {t('deliverableLabel')}
                      </span>
                      {t(`${step}.deliverable`)}
                    </p>
                  </article>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
