import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { formatCoords, HIGHLIGHTS, HUBS, SECTION_IDS } from './data'
import { Flag } from './Flags'
import { ArrowRightIcon } from './icons'
import styles from './landing.module.css'
import { HighlightIcon } from './serviceIcons'

export async function Hero() {
  const t = await getTranslations('landing.hero')
  const tc = await getTranslations('landing.countries')

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={cx(styles.container, styles.heroLayout)}>
        <div>
          <p className={styles.pill} data-intro="">
            {t('eyebrow')}
          </p>
          {/* El h1 NO lleva data-intro: es el LCP y no espera a ninguna animación. */}
          <h1 id="hero-title" className={styles.heroTitle}>
            <span>{t('titleLine1')}</span>{' '}
            <span className={styles.heroTitleAccent}>{t('titleLine2')}</span>
          </h1>
          <p className={styles.heroLead} data-intro="">
            {t('lead')}
          </p>
          <div className={styles.heroActions} data-intro="">
            <a className={cx(styles.button, styles.buttonPrimary)} href={`#${SECTION_IDS.contact}`}>
              {t('ctaPrimary')}
              <ArrowRightIcon className={styles.buttonArrow} />
            </a>
            <a className={cx(styles.button, styles.buttonGhost)} href={`#${SECTION_IDS.services}`}>
              {t('ctaSecondary')}
            </a>
          </div>
        </div>

        <div className={styles.heroVisual} data-intro="">
          <div className={styles.globe} aria-hidden="true">
            <div className={styles.globeCanvas} data-globe="" />
          </div>
        </div>
      </div>

      {/* Panel a todo el ancho: no tapa el globo y da a cada centro el mismo peso. */}
      <div className={styles.container}>
        <div className={styles.hubPanel} data-intro="">
          <p className={styles.hubPanelTitle} id="hubs-title">
            {t('hubsLabel')}
          </p>
          <ul className={styles.hubGrid} aria-labelledby="hubs-title">
            {HUBS.map((hub) => (
              <li key={hub.iata} className={styles.hubItem}>
                <Flag country={hub.country} width={32} className={styles.flag} />
                <div className={styles.hubText}>
                  <span className={styles.hubName}>{tc(hub.country)}</span>
                  <span className={styles.hubMeta}>
                    <span className={styles.hubCode}>{hub.iata}</span>
                    {formatCoords(hub)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export async function Highlights() {
  const t = await getTranslations('landing.highlights')

  return (
    <section className={styles.highlights} aria-label={t('label')}>
      <div className={styles.container}>
        <ul className={styles.highlightList}>
          {HIGHLIGHTS.map((key) => (
            <li key={key} className={styles.highlight}>
              <span className={styles.highlightIcon}>
                <HighlightIcon name={key} />
              </span>
              <div>
                <p className={styles.highlightTitle}>{t(`${key}.title`)}</p>
                <p className={styles.highlightText}>{t(`${key}.description`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
