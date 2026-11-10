'use client'

import { useLocale, useTranslations } from 'next-intl'

import { cx, EmptyState, PageHeader, PreviewBanner, Surface } from './kit'
import { ORDER_STEPS, SAMPLE_ORDERS, type SampleOrder } from './sample'
import styles from './wholesale.module.css'

import { formatMoney } from '@/lib/marketplace/format'

/**
 * Pedidos del comerciante. Mientras el módulo de órdenes no esté en la API, se muestran
 * pedidos de ejemplo con un aviso visible: ningún importe aquí cobra ni se confirma.
 */
export function MerchantOrders() {
  const t = useTranslations('marketplace.orders')
  const tSample = useTranslations('marketplace.sample')
  const locale = useLocale()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('intro')} />
      <PreviewBanner>{t('previewNotice')}</PreviewBanner>

      {SAMPLE_ORDERS.length === 0 ? (
        <EmptyState title={t('emptyTitle')} body={t('emptyBody')} />
      ) : (
        <ul className="flex flex-col gap-5">
          {SAMPLE_ORDERS.map((order) => (
            <li key={order.id}>
              <Surface as="article" padded={false} labelledBy={`order-${order.id}`}>
                <div className={styles.orderHead}>
                  <div className="flex flex-col gap-1">
                    <h2 id={`order-${order.id}`} className={cx(styles.display, styles.h4)}>
                      {tSample(order.supplierKey)}
                    </h2>
                    <span className={cx(styles.muted, 'text-body-sm')}>
                      {t('orderMeta', { id: order.id, date: formatDate(order.date, locale) })}
                    </span>
                  </div>
                  <Figure label={t('units')} value={String(order.units)} />
                  <Figure
                    label={t('total')}
                    value={formatMoney(
                      { amount: order.totalMinor, currency: order.currency },
                      locale,
                    )}
                  />
                  <StepTag order={order} />
                </div>
                <div className={styles.orderTrack}>
                  <OrderTrack step={order.step} />
                </div>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Seguimiento del pedido en cuatro pasos. Los pasos ya cumplidos se pintan en azul. */
export function OrderTrack({ step }: { step: number }) {
  const t = useTranslations('marketplace.orders')
  return (
    <ol className={styles.track} aria-label={t('trackLabel')}>
      {ORDER_STEPS.map((key, index) => {
        const done = index <= step
        return (
          <li key={key} className={styles.trackStep}>
            <span aria-hidden="true" className={cx(styles.trackBar, done && styles.trackBarOn)} />
            <span className={cx('text-body-sm', done ? '' : styles.muted)}>
              {t(`steps.${key}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function StepTag({ order }: { order: SampleOrder }) {
  const t = useTranslations('marketplace.orders')
  const key = ORDER_STEPS[order.step] ?? ORDER_STEPS[0]
  return <span className={cx(styles.statusTag, styles.statusOn)}>{t(`steps.${key}`)}</span>
}

export function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={cx(styles.muted, 'text-caption')}>{label}</span>
      <span className="text-body font-medium">{value}</span>
    </div>
  )
}

function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`))
}
