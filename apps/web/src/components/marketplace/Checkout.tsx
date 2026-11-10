'use client'

import { Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import {
  Breadcrumb,
  buttonClass,
  controlClass,
  cx,
  EmptyState,
  Field,
  Notice,
  PreviewBanner,
} from './kit'
import styles from './wholesale.module.css'

import { Link } from '@/lib/i18n/navigation'
import { useActiveSuppliers, useCart } from '@/lib/marketplace/api/queries'
import { formatMoney, initialsOf } from '@/lib/marketplace/format'

/** Métodos de pago que se ofrecerán. Ninguno cobra todavía: la pasarela aún no está conectada. */
const PAYMENT_METHODS = ['card', 'pse', 'nequi', 'bancolombia'] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/**
 * Pago del pedido. Muestra la dirección y el método, y el resumen con los importes del
 * servidor. El envío no se calcula aquí: se confirma con la dirección en el servidor.
 * El botón de pagar queda deshabilitado hasta que exista la pasarela (RFC-0016, P-01).
 */
export function CheckoutView() {
  const t = useTranslations('marketplace.checkout')
  const locale = useLocale()
  const cart = useCart()
  const suppliers = useActiveSuppliers()
  const ids = useId()
  const [method, setMethod] = useState<PaymentMethod>('card')

  if (cart.isPending) return <Skeleton className="h-96 w-full" />

  if (cart.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('loadFailed')}
      </Notice>
    )
  }

  const data = cart.data
  if (data.lines.length === 0) {
    return (
      <EmptyState
        title={t('emptyTitle')}
        body={t('emptyBody')}
        action={
          <Link href="/tienda" className={buttonClass()}>
            {t('emptyCta')}
          </Link>
        }
      />
    )
  }

  const blocked = data.suppliers.some((minimum) => !minimum.met)
  const nameOf = (supplierId: string) =>
    suppliers.data?.find((item) => item.id === supplierId)?.legalName ?? '…'

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[{ href: '/carrito', label: t('breadcrumbCart') }, { label: t('breadcrumbPay') }]}
      />

      {blocked ? (
        <Notice tone="warning" role="alert">
          {t('blocked')}{' '}
          <Link href="/carrito" className="underline underline-offset-4">
            {t('backToCart')}
          </Link>
        </Notice>
      ) : null}

      <div className={styles.checkoutGrid}>
        <div className="flex flex-col gap-6">
          <section
            className={cx(styles.card, styles.cardBody, 'gap-5')}
            aria-labelledby={`${ids}-address`}
          >
            <div className={styles.stepHead}>
              <span className={cx(styles.stepNum, styles.stepNumOn)}>{1}</span>
              <h2 id={`${ids}-address`} className={cx(styles.display, styles.h4)}>
                {t('addressTitle')}
              </h2>
            </div>
            <form
              className={styles.formGrid}
              onSubmit={(event: { preventDefault: () => void }) => {
                event.preventDefault()
              }}
            >
              <Field label={t('recipient')} htmlFor={`${ids}-recipient`}>
                <input id={`${ids}-recipient`} autoComplete="name" className={controlClass} />
              </Field>
              <Field label={t('phone')} htmlFor={`${ids}-phone`}>
                <input id={`${ids}-phone`} type="tel" autoComplete="tel" className={controlClass} />
              </Field>
              <div className={styles.spanTwo}>
                <Field label={t('address')} htmlFor={`${ids}-address-line`}>
                  <input
                    id={`${ids}-address-line`}
                    autoComplete="street-address"
                    className={controlClass}
                  />
                </Field>
              </div>
              <Field label={t('city')} htmlFor={`${ids}-city`}>
                <input id={`${ids}-city`} autoComplete="address-level2" className={controlClass} />
              </Field>
              <Field label={t('country')} htmlFor={`${ids}-country`}>
                <select id={`${ids}-country`} autoComplete="country" className={controlClass}>
                  <option>{t('countryCO')}</option>
                  <option>{t('countryCR')}</option>
                  <option>{t('countryNI')}</option>
                  <option>{t('countryUS')}</option>
                </select>
              </Field>
              <div className={styles.spanTwo}>
                <Field label={t('notes')} htmlFor={`${ids}-notes`} hint={t('optional')}>
                  <input id={`${ids}-notes`} className={controlClass} />
                </Field>
              </div>
            </form>
          </section>

          <section
            className={cx(styles.card, styles.cardBody, 'gap-5')}
            aria-labelledby={`${ids}-payment`}
          >
            <div className={cx(styles.stepHead, 'flex-wrap justify-between')}>
              <div className="flex items-center gap-3">
                <span className={cx(styles.stepNum, styles.stepNumOn)}>{2}</span>
                <h2 id={`${ids}-payment`} className={cx(styles.display, styles.h4)}>
                  {t('paymentTitle')}
                </h2>
              </div>
              <span className={styles.hint}>{t('gatewayName')}</span>
            </div>
            <div role="radiogroup" aria-label={t('paymentTitle')} className={styles.methodGrid}>
              {PAYMENT_METHODS.map((key) => {
                const selected = key === method
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setMethod(key)
                    }}
                    className={cx(styles.method, selected && styles.methodOn)}
                  >
                    <span className="font-medium">{t(`method.${key}`)}</span>
                    <span className="text-caption opacity-80">{t(`methodHint.${key}`)}</span>
                  </button>
                )
              })}
            </div>
            <PreviewBanner>{t('paymentPending')}</PreviewBanner>
          </section>
        </div>

        <aside className={cx(styles.card, styles.sticky)} aria-labelledby={`${ids}-order`}>
          <div className={styles.cardHead}>
            <h2 id={`${ids}-order`} className={cx(styles.display, styles.h4)}>
              {t('orderTitle')}
            </h2>
          </div>
          <ul className="flex flex-col">
            {data.suppliers.map((minimum) => (
              <li key={minimum.supplierId} className={styles.summaryRow}>
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className={styles.groupMark}>
                    {initialsOf(nameOf(minimum.supplierId))}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium">{nameOf(minimum.supplierId)}</span>
                    <span className={styles.muted}>{t('unitsOf', { units: minimum.units })}</span>
                  </span>
                </span>
                <span className="font-semibold">{formatMoney(minimum.subtotal, locale)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.summaryBody}>
            <div className="flex justify-between gap-4">
              <span className={styles.muted}>{t('subtotal')}</span>
              <span>{formatMoney(data.total, locale)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className={styles.muted}>{t('shipping')}</span>
              <span>{t('shippingAtConfirm')}</span>
            </div>
            <div className={styles.totalRow}>
              <span className="text-body">{t('total')}</span>
              <span className={cx(styles.price, styles.priceXl)}>
                {formatMoney(data.total, locale)}
              </span>
            </div>
            <button
              type="button"
              disabled
              className={cx(buttonClass({ size: 'lg', block: true }), 'mt-2')}
            >
              {t('payCta')}
            </button>
            <p className={cx(styles.hint, 'text-center')}>{t('splitNote')}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
