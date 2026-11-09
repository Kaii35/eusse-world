'use client'

import { SUPPLIER_MINIMUM_UNITS } from '@eusse/contracts'
import { Button, Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { EmptyState, Notice, Pill, ProgressBar, Surface } from './kit'

import type { PrintChoice, PrintOption, Product } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useActiveSuppliers,
  useAddCartLine,
  useCart,
  useSupplierProducts,
} from '@/lib/marketplace/api/queries'
import { formatMoney } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/** Mínimo por proveedor, desde el contrato compartido con la API (RFC-0016). */
export const SUPPLIER_MINIMUM = SUPPLIER_MINIMUM_UNITS

/** Proveedores activos como tarjetas. Cada una lleva a su catálogo. */
export function SupplierList() {
  const t = useTranslations('marketplace.store')
  const suppliers = useActiveSuppliers()

  if (suppliers.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    )
  }

  if (suppliers.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('empty')}
      </Notice>
    )
  }

  if (suppliers.data.length === 0) {
    return <EmptyState title={t('suppliers')} body={t('empty')} />
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.data.map((supplier) => (
        <li key={supplier.id}>
          <Surface
            as="article"
            className="h-full justify-between"
            labelledBy={`supplier-${supplier.id}`}
          >
            <div className="flex flex-col gap-3">
              <h2 id={`supplier-${supplier.id}`} className="text-h4 text-foreground font-semibold">
                {supplier.legalName}
              </h2>
              <Pill tone="info">{t('minimumChip', { required: SUPPLIER_MINIMUM })}</Pill>
            </div>
            <Button asChild variant="secondary" size="md">
              <Link href={`/tienda/${supplier.id}`}>{t('supplierCard')}</Link>
            </Button>
          </Surface>
        </li>
      ))}
    </ul>
  )
}

/**
 * Catálogo publicado de un proveedor. Muestra cuánto lleva el comprador de ese proveedor
 * frente al mínimo, para que sepa cuánto le falta antes de agregar más.
 */
export function SupplierCatalog({ supplierId }: { supplierId: string }) {
  const t = useTranslations('marketplace.store')
  const products = useSupplierProducts(supplierId)
  const cart = useCart()
  const supplierName = useActiveSuppliers().data?.find((s) => s.id === supplierId)?.legalName ?? ''

  const minimum = cart.data?.suppliers.find((s) => s.supplierId === supplierId)
  const units = minimum?.units ?? 0

  return (
    <div className="flex flex-col gap-8">
      <Surface labelledBy="supplier-heading">
        <div className="flex flex-col gap-2">
          <h1 id="supplier-heading" className="text-h2 text-foreground font-semibold">
            {supplierName}
          </h1>
          <p className="text-body text-muted-foreground">{t('catalogIntro')}</p>
        </div>
        <div className="flex flex-col gap-2 md:max-w-md">
          <p className="text-body-sm text-foreground">
            {units >= SUPPLIER_MINIMUM
              ? t('minimumMet')
              : t('minimumProgress', { units, required: SUPPLIER_MINIMUM })}
          </p>
          <ProgressBar value={units} max={SUPPLIER_MINIMUM} label={supplierName} />
        </div>
      </Surface>

      {products.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {products.isSuccess && products.data.length === 0 ? (
        <EmptyState title={t('catalogTitle')} body={t('noProducts')} />
      ) : null}

      {products.isSuccess && products.data.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {products.data.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('marketplace.store')
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  return (
    <Surface as="article" labelledBy={`product-${product.id}`} className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={`product-${product.id}`} className="text-h4 text-foreground font-semibold">
            {product.name}
          </h2>
          <p className="text-caption text-muted-foreground">{product.category}</p>
        </div>
        <p className="text-body text-foreground whitespace-nowrap font-semibold">
          {formatMoney(product.basePrice, locale)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {product.colors.map((color) => (
          <Pill key={color}>{color}</Pill>
        ))}
      </div>
      <p className="text-caption text-muted-foreground">{product.sizes.join(' · ')}</p>
      {product.printOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.printOptions.map((option) => (
            <Pill key={option.technique} tone="info">
              {option.technique}
            </Pill>
          ))}
        </div>
      ) : null}

      {open ? (
        <OrderPanel
          product={product}
          onClose={() => {
            setOpen(false)
          }}
        />
      ) : (
        <Button
          variant="secondary"
          aria-expanded={false}
          aria-controls={`order-${product.id}`}
          onClick={() => {
            setOpen(true)
          }}
        >
          {t('configure')}
        </Button>
      )}
    </Surface>
  )
}

/** Configuración de un pedido: color, cantidades por talla y estampado opcional. */
function OrderPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const t = useTranslations('marketplace.store')
  const tc = useTranslations('marketplace.common')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const addLine = useAddCartLine()

  const [color, setColor] = useState(product.colors[0] ?? '')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [printIndex, setPrintIndex] = useState<number | null>(null)
  const [printSize, setPrintSize] = useState('')
  const [printPlacement, setPrintPlacement] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const option: PrintOption | null =
    printIndex === null ? null : (product.printOptions[printIndex] ?? null)
  const totalUnits = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)

  function setQty(size: string, next: number) {
    setQuantities((current) => ({ ...current, [size]: Math.max(0, next) }))
    setAdded(false)
  }

  function submit() {
    setLocalError(null)
    const qtyBySize: Record<string, number> = {}
    for (const size of product.sizes) {
      const value = quantities[size] ?? 0
      if (value > 0) qtyBySize[size] = value
    }
    if (Object.keys(qtyBySize).length === 0) {
      setLocalError(t('noQuantity'))
      return
    }
    let print: PrintChoice | null = null
    if (option) {
      if (!printSize || !printPlacement) {
        setLocalError(t('printIncomplete'))
        return
      }
      print = { technique: option.technique, size: printSize, placement: printPlacement }
    }
    addLine.mutate(
      { productId: product.id, color, qtyBySize, print },
      {
        onSuccess: () => {
          setQuantities({})
          setAdded(true)
        },
      },
    )
  }

  return (
    <div id={`order-${product.id}`} className="border-border flex flex-col gap-5 border-t pt-5">
      <div className="flex flex-col gap-2">
        <span className="text-body-sm text-foreground font-medium">{t('colorLabel')}</span>
        <div role="radiogroup" aria-label={t('colorLabel')} className="flex flex-wrap gap-2">
          {product.colors.map((name) => {
            const selected = name === color
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setColor(name)
                }}
                className={
                  selected
                    ? 'border-primary bg-primary-subtle text-primary-subtle-foreground text-body-sm rounded-full border-2 px-4 py-1.5 font-semibold'
                    : 'border-border text-foreground text-body-sm hover:bg-surface-raised rounded-full border px-4 py-1.5'
                }
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-body-sm text-foreground font-medium">{t('sizesLabel')}</span>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.sizes.map((size) => {
            const value = quantities[size] ?? 0
            return (
              <li
                key={size}
                className="border-border flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <span className="text-body font-semibold">{size}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`${t('decrease')} ${size}`}
                    disabled={value === 0}
                    onClick={() => {
                      setQty(size, value - 1)
                    }}
                    className="border-border text-foreground size-8 rounded-md border disabled:opacity-40"
                  >
                    {tc('minus')}
                  </button>
                  <span aria-live="polite" className="text-body w-8 text-center tabular-nums">
                    {value}
                  </span>
                  <button
                    type="button"
                    aria-label={`${t('increase')} ${size}`}
                    onClick={() => {
                      setQty(size, value + 1)
                    }}
                    className="border-border text-foreground size-8 rounded-md border"
                  >
                    {tc('plus')}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="text-caption text-muted-foreground">
          {t('unitsSelected', { units: totalUnits })}
        </p>
      </div>

      {product.printOptions.length > 0 ? (
        <div className="flex flex-col gap-3">
          <span className="text-body-sm text-foreground font-medium">{t('printLabel')}</span>
          <div role="radiogroup" aria-label={t('printLabel')} className="flex flex-wrap gap-2">
            {[null, ...product.printOptions.map((_, index) => index)].map((index) => {
              const selected = index === printIndex
              const label =
                index === null ? t('printNone') : (product.printOptions[index]?.technique ?? '')
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setPrintIndex(index)
                    setPrintSize('')
                    setPrintPlacement('')
                  }}
                  className={
                    selected
                      ? 'border-primary bg-primary-subtle text-primary-subtle-foreground text-body-sm rounded-full border-2 px-4 py-1.5 font-semibold'
                      : 'border-border text-foreground text-body-sm hover:bg-surface-raised rounded-full border px-4 py-1.5'
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
          {option ? (
            <div className="flex flex-col gap-3">
              <p className="text-caption text-muted-foreground">
                {t('printFeeNote', {
                  technique: option.technique,
                  fee: formatMoney(option.unitFee, locale),
                })}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-body-sm flex flex-col gap-2">
                  {t('printSize')}
                  <select
                    value={printSize}
                    onChange={(event) => {
                      setPrintSize(event.target.value)
                    }}
                    className="border-border bg-surface text-foreground text-body h-11 rounded-md border px-3"
                  >
                    <option value="">—</option>
                    {option.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-body-sm flex flex-col gap-2">
                  {t('printPlacement')}
                  <select
                    value={printPlacement}
                    onChange={(event) => {
                      setPrintPlacement(event.target.value)
                    }}
                    className="border-border bg-surface text-foreground text-body h-11 rounded-md border px-3"
                  >
                    <option value="">—</option>
                    {option.placements.map((placement) => (
                      <option key={placement} value={placement}>
                        {placement}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-caption text-muted-foreground">
        {t('basePriceNote', { price: formatMoney(product.basePrice, locale) })}
      </p>

      {localError || addLine.error ? (
        <Notice tone="danger" role="alert">
          {localError ?? errorMessage(addLine.error)}
        </Notice>
      ) : null}
      {added ? <Notice tone="success">{t('added')}</Notice> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} isLoading={addLine.isPending} disabled={addLine.isPending}>
          {t('addToCart')}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  )
}
