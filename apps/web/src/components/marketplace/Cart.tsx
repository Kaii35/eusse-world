'use client'

import { Button, Skeleton } from '@eusse/ui'
import { useQueries } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'

import { EmptyState, Notice, Pill, ProgressBar, Surface } from './kit'
import { SUPPLIER_MINIMUM } from './Store'

import type {
  Cart as CartView,
  CartLine,
  Product,
  SupplierMinimum,
} from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import { apiRequest } from '@/lib/marketplace/api/client'
import {
  queryKeys,
  useActiveSuppliers,
  useCart,
  useRemoveCartLine,
} from '@/lib/marketplace/api/queries'
import { formatMoney } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/**
 * Carrito agrupado por proveedor. Todos los importes (líneas, subtotales y total) llegan del
 * servidor: esta pantalla sólo los muestra.
 */
export function Cart() {
  const t = useTranslations('marketplace.cart')
  const cart = useCart()

  if (cart.isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  if (cart.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('emptyBody')}
      </Notice>
    )
  }

  if (cart.data.lines.length === 0) {
    return (
      <EmptyState
        title={t('emptyTitle')}
        body={t('emptyBody')}
        action={
          <Button asChild>
            <Link href="/tienda">{t('emptyCta')}</Link>
          </Button>
        }
      />
    )
  }

  return <CartLayout cart={cart.data} />
}

function CartLayout({ cart }: { cart: CartView }) {
  const names = useProductNames(cart)
  const suppliers = useActiveSuppliers()
  const supplierName = (id: string) => suppliers.data?.find((s) => s.id === id)?.legalName ?? ''

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="flex flex-col gap-6">
        {cart.suppliers.map((minimum) => (
          <SupplierGroup
            key={minimum.supplierId}
            minimum={minimum}
            name={supplierName(minimum.supplierId)}
            lines={cart.lines.filter((line) => line.supplierId === minimum.supplierId)}
            productName={(productId) => names.get(productId) ?? ''}
          />
        ))}
      </div>
      <Summary cart={cart} />
    </div>
  )
}

/** Nombres de producto: el carrito guarda IDs y el nombre sale del catálogo publicado. */
function useProductNames(cart: CartView): Map<string, string> {
  const supplierIds = [...new Set(cart.lines.map((line) => line.supplierId))]
  const results = useQueries({
    queries: supplierIds.map((supplierId) => ({
      queryKey: queryKeys.supplierProducts(supplierId),
      queryFn: () => apiRequest<Product[]>('GET', `/suppliers/${supplierId}/products`),
    })),
  })
  const names = new Map<string, string>()
  for (const result of results) {
    for (const product of result.data ?? []) names.set(product.id, product.name)
  }
  return names
}

function SupplierGroup({
  minimum,
  name,
  lines,
  productName,
}: {
  minimum: SupplierMinimum
  name: string
  lines: CartLine[]
  productName: (productId: string) => string
}) {
  const t = useTranslations('marketplace.cart')
  const locale = useLocale()

  return (
    <Surface labelledBy={`supplier-${minimum.supplierId}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`supplier-${minimum.supplierId}`} className="text-h4 text-foreground font-semibold">
          {name}
        </h2>
        <p className="text-body text-foreground font-semibold">
          {formatMoney(minimum.subtotal, locale)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <ProgressBar value={minimum.units} max={SUPPLIER_MINIMUM} label={name} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-body-sm text-muted-foreground">
            {t('supplierProgress', { units: minimum.units, required: SUPPLIER_MINIMUM })}
          </p>
          {minimum.met ? (
            <Pill tone="success">{t('supplierMet')}</Pill>
          ) : (
            <Pill tone="warning">{t('supplierMissing', { missing: minimum.missing })}</Pill>
          )}
        </div>
      </div>

      <ul className="divide-border flex flex-col divide-y">
        {lines.map((line) => (
          <CartLineRow
            key={line.id}
            line={line}
            productName={productName(line.productId)}
            locale={locale}
          />
        ))}
      </ul>
    </Surface>
  )
}

function CartLineRow({
  line,
  productName,
  locale,
}: {
  line: CartLine
  productName: string
  locale: string
}) {
  const t = useTranslations('marketplace.cart')
  const errorMessage = useApiErrorMessage()
  const remove = useRemoveCartLine()

  const units = Object.values(line.qtyBySize).reduce((sum, qty) => sum + qty, 0)
  const sizes = Object.entries(line.qtyBySize)
    .map(([size, qty]) => `${size} × ${qty}`)
    .join(', ')

  return (
    <li className="flex flex-wrap items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body text-foreground font-semibold">{productName}</span>
        <span className="text-caption text-muted-foreground">
          {line.color} · {sizes}
        </span>
        {line.print ? (
          <span className="text-caption text-muted-foreground">
            {line.print.technique} · {line.print.size} · {line.print.placement}
          </span>
        ) : null}
        <span className="text-caption text-muted-foreground">
          {t('lineUnits', { units })} · {formatMoney(line.unitPrice, locale)}
        </span>
        {remove.error ? (
          <Notice tone="danger" role="alert">
            {errorMessage(remove.error)}
          </Notice>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-body text-foreground font-semibold">
          {formatMoney(line.lineTotal, locale)}
        </span>
        <Button
          variant="link"
          size="sm"
          disabled={remove.isPending}
          onClick={() => {
            remove.mutate(line.id)
          }}
        >
          {t('remove')}
        </Button>
      </div>
    </li>
  )
}

function Summary({ cart }: { cart: CartView }) {
  const t = useTranslations('marketplace.cart')
  const locale = useLocale()
  const blocked = cart.suppliers.some((supplier) => !supplier.met)

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <Surface labelledBy="summary-title">
        <h2 id="summary-title" className="text-h4 text-foreground font-semibold">
          {t('summaryTitle')}
        </h2>
        <dl className="flex flex-col gap-3">
          <div className="flex justify-between gap-4">
            <dt className="text-body-sm text-muted-foreground">{t('summaryUnits')}</dt>
            <dd className="text-body-sm text-foreground tabular-nums">{cart.totalUnits}</dd>
          </div>
          <div className="border-border flex items-baseline justify-between gap-4 border-t pt-3">
            <dt className="text-body font-semibold">{t('summaryTotal')}</dt>
            <dd className="text-h4 text-foreground font-semibold tabular-nums">
              {formatMoney(cart.total, locale)}
            </dd>
          </div>
        </dl>

        {blocked ? (
          <Notice tone="warning">{t('checkoutBlocked')}</Notice>
        ) : (
          <Notice>{t('checkoutSoon')}</Notice>
        )}
        <Button disabled size="lg" className="w-full">
          {t('checkout')}
        </Button>
        <Link
          href="/tienda"
          className="text-primary text-body-sm text-center underline-offset-4 hover:underline"
        >
          {t('continueShopping')}
        </Link>
      </Surface>
    </aside>
  )
}
