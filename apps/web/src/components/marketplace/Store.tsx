'use client'

import { Badge, Button, Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { errorClass, hintClass, fieldClass, labelClass, noticeClass, sectionClass } from './ui'

import type { PrintChoice, PrintOption, Product } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useActiveSuppliers,
  useAddCartLine,
  useSupplierProducts,
} from '@/lib/marketplace/api/queries'
import { formatMoney } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/** Proveedores activos. Cada uno lleva a su catálogo. */
export function SupplierList() {
  const t = useTranslations('marketplace.store')
  const suppliers = useActiveSuppliers()

  return (
    <section className={sectionClass} aria-labelledby="suppliers-heading">
      <h2 id="suppliers-heading" className="text-h3 font-semibold">
        {t('suppliers')}
      </h2>
      {suppliers.isPending ? <Skeleton className="h-24 w-full" /> : null}
      {suppliers.isSuccess && suppliers.data.length === 0 ? (
        <p className={hintClass}>{t('empty')}</p>
      ) : null}
      {suppliers.isSuccess && suppliers.data.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {suppliers.data.map((supplier) => (
            <li key={supplier.id}>
              <Link
                href={`/tienda/${supplier.id}`}
                className="border-border hover:bg-surface-raised flex items-center justify-between gap-3 rounded-md border p-4"
              >
                <span className="font-medium">{supplier.legalName}</span>
                <Badge variant="success">{t('catalog')}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** Catálogo publicado de un proveedor, con el formulario de pedido de cada producto. */
export function SupplierCatalog({ supplierId }: { supplierId: string }) {
  const t = useTranslations('marketplace.store')
  const products = useSupplierProducts(supplierId)

  return (
    <section className="flex flex-col gap-4" aria-labelledby="catalog-heading">
      <h2 id="catalog-heading" className="text-h3 font-semibold">
        {t('catalog')}
      </h2>
      {products.isPending ? <Skeleton className="h-40 w-full" /> : null}
      {products.isSuccess && products.data.length === 0 ? (
        <p className={hintClass}>{t('noProducts')}</p>
      ) : null}
      {products.isSuccess
        ? products.data.map((product) => <ProductOrder key={product.id} product={product} />)
        : null}
    </section>
  )
}

function ProductOrder({ product }: { product: Product }) {
  const t = useTranslations('marketplace.store')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const addLine = useAddCartLine()

  const [color, setColor] = useState(product.colors[0] ?? '')
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [printIndex, setPrintIndex] = useState<number | null>(null)
  const [printSize, setPrintSize] = useState('')
  const [printPlacement, setPrintPlacement] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const option: PrintOption | null =
    printIndex === null ? null : (product.printOptions[printIndex] ?? null)

  function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    setLocalError(null)
    setAdded(false)

    const qtyBySize: Record<string, number> = {}
    for (const size of product.sizes) {
      const value = Number.parseInt(quantities[size] ?? '', 10)
      if (Number.isInteger(value) && value > 0) qtyBySize[size] = value
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
    <article className={sectionClass} aria-labelledby={`product-${product.id}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id={`product-${product.id}`} className="text-h3 font-semibold">
          {product.name}
        </h3>
        <span className="text-body font-medium">{formatMoney(product.basePrice, locale)}</span>
      </div>
      <p className={hintClass}>{product.category}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <label className={labelClass}>
          {t('color')}
          <select
            value={color}
            onChange={(e) => {
              setColor(e.target.value)
            }}
            className={fieldClass}
          >
            {product.colors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-body-sm font-medium">{t('sizes')}</legend>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {product.sizes.map((size) => (
              <label key={size} className={labelClass}>
                {size}
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={quantities[size] ?? ''}
                  onChange={(e) => {
                    setQuantities({ ...quantities, [size]: e.target.value })
                  }}
                  className={fieldClass}
                />
              </label>
            ))}
          </div>
        </fieldset>

        {product.printOptions.length > 0 ? (
          <fieldset className="border-border flex flex-col gap-3 border-t pt-4">
            <legend className="text-body-sm font-medium">{t('print')}</legend>
            <label className={labelClass}>
              {t('print')}
              <select
                value={printIndex === null ? '' : String(printIndex)}
                onChange={(e) => {
                  const value = e.target.value
                  setPrintIndex(value === '' ? null : Number(value))
                  setPrintSize('')
                  setPrintPlacement('')
                }}
                className={fieldClass}
              >
                <option value="">{t('printNone')}</option>
                {product.printOptions.map((item, index) => (
                  <option key={item.technique} value={index}>
                    {item.technique} · {formatMoney(item.unitFee, locale)}
                  </option>
                ))}
              </select>
            </label>
            {option ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  {t('printSize')}
                  <select
                    value={printSize}
                    onChange={(e) => {
                      setPrintSize(e.target.value)
                    }}
                    className={fieldClass}
                  >
                    <option value="" />
                    {option.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  {t('printPlacement')}
                  <select
                    value={printPlacement}
                    onChange={(e) => {
                      setPrintPlacement(e.target.value)
                    }}
                    className={fieldClass}
                  >
                    <option value="" />
                    {option.placements.map((placement) => (
                      <option key={placement} value={placement}>
                        {placement}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {localError || addLine.error ? (
          <p role="alert" className={errorClass}>
            {localError ?? errorMessage(addLine.error)}
          </p>
        ) : null}
        {added ? (
          <p role="status" className={noticeClass}>
            {t('added')}
          </p>
        ) : null}
        <Button type="submit" isLoading={addLine.isPending} disabled={addLine.isPending}>
          {t('addToCart')}
        </Button>
      </form>
    </article>
  )
}
