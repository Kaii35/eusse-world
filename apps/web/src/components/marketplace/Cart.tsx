'use client'

import { SUPPLIER_MINIMUM_UNITS } from '@eusse/contracts'
import { Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'

import { buttonClass, cx, EmptyState, Notice, Pill, ProgressBar, Swatch } from './kit'
import styles from './wholesale.module.css'

import type { Cart, CartLine, Money, PrintChoice, Product } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useActiveSuppliers,
  useCart,
  useRemoveCartLine,
  useSupplierProducts,
} from '@/lib/marketplace/api/queries'
import { formatMoney, initialsOf } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/**
 * Carrito agrupado por proveedor. Cada grupo muestra cuánto falta para el mínimo. Todos los
 * importes llegan calculados por el servidor; aquí sólo se muestran.
 */
export function CartView() {
  const t = useTranslations('marketplace.cart')
  const cart = useCart()

  if (cart.isPending) {
    return <Skeleton className="h-96 w-full" />
  }

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
        body={t('emptyBody', { required: SUPPLIER_MINIMUM_UNITS })}
        action={
          <Link href="/tienda" className={buttonClass({ size: 'md' })}>
            {t('emptyCta')}
          </Link>
        }
      />
    )
  }

  return (
    <div className={styles.twoCol}>
      <div className="flex flex-col gap-6">
        {data.suppliers.map((minimum) => (
          <SupplierGroup
            key={minimum.supplierId}
            supplierId={minimum.supplierId}
            lines={data.lines.filter((line) => line.supplierId === minimum.supplierId)}
            units={minimum.units}
            required={minimum.required}
            met={minimum.met}
            missing={minimum.missing}
            subtotal={minimum.subtotal}
          />
        ))}
      </div>
      <Summary cart={data} />
    </div>
  )
}

function SupplierGroup({
  supplierId,
  lines,
  units,
  required,
  met,
  missing,
  subtotal,
}: {
  supplierId: string
  lines: CartLine[]
  units: number
  required: number
  met: boolean
  missing: number
  subtotal: Money
}) {
  const t = useTranslations('marketplace.cart')
  const locale = useLocale()
  const suppliers = useActiveSuppliers()
  const products = useSupplierProducts(supplierId)
  const name = suppliers.data?.find((item) => item.id === supplierId)?.legalName ?? ''
  const byId = new Map((products.data ?? []).map((product) => [product.id, product]))

  return (
    <section className={styles.card} aria-labelledby={`group-${supplierId}`}>
      <header className={cx(styles.cardHead, 'flex-wrap')}>
        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden="true" className={styles.groupMark}>
            {initialsOf(name)}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id={`group-${supplierId}`} className={cx(styles.display, styles.h4)}>
              {name || '…'}
            </h2>
            <span className={cx(styles.muted, 'text-body-sm')}>
              {met ? t('supplierMet') : t('supplierMissing', { missing })}
            </span>
          </div>
        </div>
        <Link href={`/tienda/${supplierId}`} className={buttonClass({ variant: 'ghost' })}>
          {t('addMore')}
        </Link>
      </header>

      <div className={styles.groupBar}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar value={units} max={required} label={name} />
          </div>
          <span className="text-body-sm whitespace-nowrap">
            {t('supplierProgress', { units, required })}
          </span>
        </div>
      </div>

      <ul className="flex flex-col">
        {lines.map((line) => {
          const product: Product | undefined = byId.get(line.productId)
          const sizes = Object.entries(line.qtyBySize)
            .filter(([, value]) => value > 0)
            .map(([size, value]) => `${size}×${value}`)
            .join('  ')
          const units = Object.values(line.qtyBySize).reduce((sum, value) => sum + value, 0)
          return (
            <li key={line.id} className={styles.lineRow}>
              <Swatch name={line.color} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium">{product?.name ?? '…'}</span>
                <span className={cx(styles.muted, 'text-body-sm')}>
                  {line.color} · {sizes}
                </span>
                {line.print ? <PrintSummary print={line.print} /> : null}
              </div>
              <div className="text-body-sm flex flex-col items-end gap-1">
                <span className={styles.muted}>
                  {t('lineUnits', { units })} × {formatMoney(line.unitPrice, locale)}
                </span>
                <span className={cx(styles.price, styles.priceSm)}>
                  {formatMoney(line.lineTotal, locale)}
                </span>
              </div>
              <RemoveLine lineId={line.id} />
            </li>
          )
        })}
      </ul>

      <footer className={styles.groupFoot}>
        <span className={styles.muted}>{t('subtotal')}</span>
        <strong className="font-semibold">{formatMoney(subtotal, locale)}</strong>
      </footer>
    </section>
  )
}

function PrintSummary({ print }: { print: PrintChoice }) {
  return (
    <span className="text-body-sm">
      <Pill outline>
        {print.technique} · {print.size} · {print.placement}
      </Pill>
    </span>
  )
}

function RemoveLine({ lineId }: { lineId: string }) {
  const t = useTranslations('marketplace.cart')
  const errorMessage = useApiErrorMessage()
  const remove = useRemoveCartLine()
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={remove.isPending}
        onClick={() => {
          remove.mutate(lineId)
        }}
        className={buttonClass({ variant: 'ghost', size: 'sm' })}
      >
        {t('remove')}
      </button>
      {remove.error ? (
        <span role="alert" className="text-caption text-danger">
          {errorMessage(remove.error)}
        </span>
      ) : null}
    </div>
  )
}

function Summary({ cart }: { cart: Cart }) {
  const t = useTranslations('marketplace.cart')
  const locale = useLocale()
  const blocked = cart.suppliers.filter((minimum) => !minimum.met)
  const ready = blocked.length === 0

  return (
    <aside
      className={cx(styles.card, styles.cardBody, styles.sticky, 'gap-4')}
      aria-labelledby="cart-summary"
    >
      <h2 id="cart-summary" className={cx(styles.display, styles.h4)}>
        {t('summaryTitle')}
      </h2>
      <dl className="text-body-sm flex flex-col gap-3">
        <div className="flex justify-between gap-4">
          <dt className={styles.muted}>{t('summaryUnits')}</dt>
          <dd>{cart.totalUnits}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className={styles.muted}>{t('summarySuppliersLabel')}</dt>
          <dd>{t('summarySuppliers', { count: cart.suppliers.length })}</dd>
        </div>
      </dl>
      <div className={styles.totalRow}>
        <span className="text-body">{t('summaryTotal')}</span>
        <span className={cx(styles.price, styles.priceXl)}>{formatMoney(cart.total, locale)}</span>
      </div>
      <p className={styles.hint}>{t('shippingNote')}</p>

      {ready ? (
        <Link href="/carrito/pago" className={buttonClass({ size: 'lg', block: true })}>
          {t('checkout')}
        </Link>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="button" disabled className={buttonClass({ size: 'lg', block: true })}>
            {t('checkout')}
          </button>
          <Notice tone="warning">{t('checkoutBlocked')}</Notice>
        </div>
      )}
      <Link href="/tienda" className={buttonClass({ variant: 'ghost' })}>
        {t('continueShopping')}
      </Link>
    </aside>
  )
}
