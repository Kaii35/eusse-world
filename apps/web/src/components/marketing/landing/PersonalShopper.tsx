import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { SECTION_IDS } from './data'
import { ArrowRightIcon } from './icons'
import styles from './landing.module.css'
import { RailLoader } from './rail/RailLoader'

import type { GarmentKind } from './rail/art'
import type { RailGarment } from './rail/ClothingRail'

/**
 * Prendas del perchero. Son ejemplos de lo que se compra por encargo (servicio Personal
 * Shopper), no un catálogo: sin precios (RFC-0009 §10.1). El color es el de la tela.
 * La etiqueta colgante muestra la ruta de compra.
 */
const GARMENTS: { id: string; kind: GarmentKind; color: string; route: string }[] = [
  { id: 'tee', kind: 'tee', color: 'oklch(0.94 0.012 85)', route: 'MIA → BOG' },
  { id: 'oxford', kind: 'shirt', color: 'oklch(0.84 0.05 232)', route: 'MIA → SJO' },
  { id: 'hoodie', kind: 'hoodie', color: 'oklch(0.7 0.01 250)', route: 'MIA → MGA' },
  { id: 'knit', kind: 'knit', color: 'oklch(0.56 0.07 125)', route: 'MIA → BOG' },
  { id: 'jacket', kind: 'jacket', color: 'oklch(0.36 0.08 257)', route: 'MIA → SJO' },
  { id: 'coat', kind: 'coat', color: 'oklch(0.63 0.08 65)', route: 'MIA → BOG' },
  { id: 'polo', kind: 'tee', color: 'oklch(0.42 0.08 155)', route: 'MIA → MGA' },
  { id: 'sweat', kind: 'knit', color: 'oklch(0.79 0.06 300)', route: 'MIA → SJO' },
]

export async function PersonalShopper() {
  const t = await getTranslations('landing.shopper')

  const items: RailGarment[] = GARMENTS.map((g) => ({
    id: g.id,
    kind: g.kind,
    color: g.color,
    tag: g.route,
    name: t(`items.${g.id}.name`),
    description: t(`items.${g.id}.description`),
    details: [t(`items.${g.id}.d1`), t(`items.${g.id}.d2`), t(`items.${g.id}.d3`)],
  }))

  const action = (
    <a
      className={cx(styles.button, styles.buttonPrimary)}
      href={`#${SECTION_IDS.contact}`}
      data-quote-service="personalShopper"
    >
      {t('cta')}
      <ArrowRightIcon className={styles.buttonArrow} />
    </a>
  )

  return (
    <section className={styles.shopper} aria-labelledby="shopper-title">
      <div className={styles.container}>
        <div className={styles.shopperHead} data-reveal="">
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h2 id="shopper-title" className={styles.sectionTitle}>
            {t('title')}
          </h2>
          <p className={styles.lead}>{t('lead')}</p>
        </div>
      </div>

      <RailLoader
        items={items}
        caption={t('caption')}
        action={action}
        autoplay
        labels={{
          rail: t('labels.rail'),
          roleDescription: t('labels.roleDescription'),
          front: t('labels.front'),
          back: t('labels.back'),
          close: t('labels.close'),
          show: t('labels.show'),
        }}
      >
        {/* Sin JS (o antes de cargar el perchero): la misma información, estática. */}
        <div className={styles.container}>
          <ul className={styles.shopperFallback} aria-label={t('fallbackLabel')}>
            {items.map((item) => (
              <li key={item.id} className={styles.shopperFallbackItem}>
                <span
                  className={styles.shopperSwatch}
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
                <span className={styles.shopperFallbackName}>{item.name}</span>
                <span className={styles.shopperFallbackText}>{item.description}</span>
              </li>
            ))}
          </ul>
          <div className={styles.shopperFallbackAction}>{action}</div>
        </div>
      </RailLoader>
    </section>
  )
}
