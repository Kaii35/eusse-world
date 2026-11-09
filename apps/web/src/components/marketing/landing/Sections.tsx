import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { ABOUT_POINTS, HUBS, NETWORK_TAGS, SECTION_IDS } from './data'
import { Flag } from './Flags'
import { CheckIcon, PlusIcon } from './icons'
import styles from './landing.module.css'

export async function About() {
  const t = await getTranslations('landing.about')

  return (
    <section className={styles.about} aria-labelledby="about-title">
      <div className={cx(styles.container, styles.aboutLayout)}>
        <div data-reveal="">
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h2 id="about-title" className={styles.sectionTitle}>
            {t('title')}
          </h2>
        </div>
        <div data-reveal="" data-delay="80">
          <p className={styles.aboutBody}>{t('body')}</p>
          <ul className={styles.pointList}>
            {ABOUT_POINTS.map((key) => (
              <li key={key} className={styles.point}>
                <span className={styles.pointIcon}>
                  <CheckIcon size={14} />
                </span>
                {t(`points.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export async function Network() {
  const t = await getTranslations('landing.network')
  const tc = await getTranslations('landing.countries')

  return (
    <section id={SECTION_IDS.network} className={styles.network} aria-labelledby="network-title">
      <div className={styles.container}>
        <div className={styles.sectionHead} data-reveal="">
          <div>
            <span className={styles.eyebrow}>{t('eyebrow')}</span>
            <h2 id="network-title" className={styles.sectionTitle}>
              {t('title')}
            </h2>
          </div>
          <p className={styles.lead}>{t('lead')}</p>
        </div>
        <ul className={styles.countryGrid}>
          {HUBS.map((hub, index) => (
            <li key={hub.country} data-reveal="" data-delay={index * 60}>
              <div className={styles.country}>
                <div className={styles.countryMeta}>
                  <Flag country={hub.country} width={36} className={styles.flag} />
                  <span className={styles.countryIata}>
                    {hub.country} · {hub.iata}
                  </span>
                </div>
                <h3 className={styles.countryName}>{tc(hub.country)}</h3>
                <ul className={styles.tags}>
                  {NETWORK_TAGS[hub.country].map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {t(`tags.${tag}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.countrySoon} data-reveal="">
          <span className={styles.soonIcon} aria-hidden="true">
            <PlusIcon />
          </span>
          <div>
            <p className={styles.soonTitle}>
              {t('soon.title')}
              <span className={styles.soonTag}>{t('soon.tag')}</span>
            </p>
            <p className={styles.countryText}>{t('soon.description')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
