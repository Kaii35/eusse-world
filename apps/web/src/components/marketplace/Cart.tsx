'use client'

import { Button, Skeleton } from '@eusse/ui'
import { useQueries } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'

import { errorClass, hintClass, headingClass, sectionClass } from './ui'

import type {
  Cart as CartView,
  CartLine,
  Product,
  SupplierMinimum,
} from '@/lib/marketplace/api/types'

import { apiRequest } from '@/lib/marketplace/api/client'
import {
  queryKeys,
  useActiveSuppliers,
  useCart,
  useRemoveCartLine,
} from '@/lib/marketplace/api/queries'
import { formatMoney } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/** Carrito agrupado por proveedor, con el progreso hacia el mínimo de cada uno. */
export function Cart() {
  const t = useTranslations('marketplace.cart')
  const cart = useCart()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <h1 className={headingClass}>{t('title')}</h1>
      {cart.isPending ? <Skeleton className="h-40 w-full" /> : null}
      {cart.isSuccess && cart.data.lines.length === 0 ? (
        <p className={hintClass}>{t('empty')}</p>
      ) : null}
      {cart.isSuccess && cart.data.lines.length > 0 ? <CartGroups cart={cart.data} /> : null}
    </div>
  )
}

function CartGroups({ cart }: { cart: CartView }) {
  const suppliers = useActiveSuppliers()
  const names = useProductNames(cart.lines)
  const supplierName = (id: string) =>
    suppliers.data?.find((supplier) => supplier.id === id)?.legalName ?? ''

  return (
    <>
      {cart.suppliers.map((minimum) => (
        <SupplierGroup
          key={minimum.supplierId}
          minimum={minimum}
          name={supplierName(minimum.supplierId)}
          lines={cart.lines.filter((line) => line.supplierId === minimum.supplierId)}
          productName={(productId) => names.get(productId) ?? ''}
        />
      ))}
    </>
  )
}

/**
 * Nombres de producto para las líneas. El carrito guarda IDs; el nombre sale del catálogo
 * publicado de cada proveedor, que ya se consulta en la tienda.
 */
function useProductNames(lines: CartLine[]): Map<string, string> {
  const supplierIds = [...new Set(lines.map((line) => line.supplierId))]
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
  // Sólo la anchura de la barra: el progreso es visual, no un precio.
  const progress = Math.min(100, Math.round((minimum.units / minimum.required) * 100))

  return (
    <section className={sectionClass} aria-labelledby={`supplier-${minimum.supplierId}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`supplier-${minimum.supplierId}`} className="text-h3 font-semibold">
          {name}
        </h2>
        <span className="font-medium">{formatMoney(minimum.subtotal, locale)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-sm">
          {t('supplierProgress', { units: minimum.units, required: minimum.required })}
        </p>
        <div
          role="progressbar"
          aria-label={name}
          aria-valuemin={0}
          aria-valuemax={minimum.required}
          aria-valuenow={Math.min(minimum.units, minimum.required)}
          className="bg-surface-sunken h-2 w-full overflow-hidden rounded-full"
        >
          <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
        </div>
        <p
          className={
            minimum.met ? 'text-success-subtle-foreground text-body-sm' : 'text-danger text-body-sm'
          }
        >
          {minimum.met ? t('supplierMet') : t('supplierMissing', { missing: minimum.missing })}
        </p>
      </div>

      <ul className="divide-border flex flex-col divide-y">
        {lines.map((line) => (
          <CartLineRow key={line.id} line={line} productName={productName(line.productId)} />
        ))}
      </ul>
    </section>
  )
}

function CartLineRow({ line, productName }: { line: CartLine; productName: string }) {
  const t = useTranslations('marketplace.cart')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const remove = useRemoveCartLine()

  const units = Object.values(line.qtyBySize).reduce((sum, qty) => sum + qty, 0)
  const sizes = Object.entries(line.qtyBySize)
    .map(([size, qty]) => `${size}×${qty}`)
    .join(' ')

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{productName}</span>
        <span className={hintClass}>
          {line.color} · {sizes}
          {line.print
            ? ` · ${line.print.technique} ${line.print.size} · ${line.print.placement}`
            : ''}
        </span>
        <span className={hintClass}>
          {t('lineUnits', { units })} · {formatMoney(line.unitPrice, locale)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium">{formatMoney(line.lineTotal, locale)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            remove.mutate(line.id)
          }}
          isLoading={remove.isPending && remove.variables === line.id}
        >
          {t('remove')}
        </Button>
      </div>
      {remove.error ? (
        <p role="alert" className={errorClass}>
          {errorMessage(remove.error)}
        </p>
      ) : null}
    </li>
  )
}
