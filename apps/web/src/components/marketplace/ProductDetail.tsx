'use client'

import { SUPPLIER_MINIMUM_UNITS } from '@eusse/contracts'
import { Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  Breadcrumb,
  buttonClass,
  controlClass,
  cx,
  Eyebrow,
  Field,
  Notice,
  Pill,
  Swatch,
} from './kit'
import { readableOn, swatchFor } from './swatch'
import styles from './wholesale.module.css'

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

/**
 * Detalle y configuración de un producto: color, cantidades por talla y estampado opcional.
 * El precio que se muestra es el base; el total lo calcula el servidor en el carrito.
 */
export function ProductDetail({
  supplierId,
  productId,
}: {
  supplierId: string
  productId: string
}) {
  const t = useTranslations('marketplace.store')
  const suppliers = useActiveSuppliers()
  const products = useSupplierProducts(supplierId)

  if (products.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('loadFailed')}
      </Notice>
    )
  }

  if (products.isPending) {
    return <Skeleton className="h-96 w-full" />
  }

  const product = products.data.find((item) => item.id === productId)
  if (!product) {
    return (
      <Notice tone="warning" role="alert">
        {t('productNotFound')}
      </Notice>
    )
  }

  const supplierName = suppliers.data?.find((item) => item.id === supplierId)?.legalName ?? ''

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[
          { href: '/tienda', label: t('breadcrumbStore') },
          { href: `/tienda/${supplierId}`, label: supplierName || '…' },
          { label: product.name },
        ]}
      />
      <Configurator
        key={product.id}
        supplierId={supplierId}
        supplierName={supplierName}
        product={product}
      />
    </div>
  )
}

function Configurator({
  supplierId,
  supplierName,
  product,
}: {
  supplierId: string
  supplierName: string
  product: Product
}) {
  const t = useTranslations('marketplace.store')
  const tc = useTranslations('marketplace.common')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const addLine = useAddCartLine()
  const cart = useCart()

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
  const minimum = cart.data?.suppliers.find((item) => item.supplierId === supplierId)
  const inCart = minimum?.units ?? 0
  const afterAdd = inCart + totalUnits
  const required = SUPPLIER_MINIMUM_UNITS

  function setQty(size: string, next: number) {
    setQuantities((current) => ({ ...current, [size]: Math.max(0, next) }))
    setAdded(false)
  }

  function choosePrint(index: number | null) {
    setPrintIndex(index)
    setPrintSize('')
    setPrintPlacement('')
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

  const firstColor = swatchFor(color)
  const eyebrow = [product.category, supplierName].filter(Boolean).join(' · ')

  return (
    <div className={styles.detailGrid}>
      <aside className={styles.detailPreview} aria-label={t('previewLabel')}>
        <div className={styles.previewCanvas} style={{ background: firstColor }}>
          <span className={styles.tileLabel} style={{ color: readableOn(firstColor) }}>
            {t('previewCaption', { color: color || '—' })}
          </span>
          {option ? (
            <span className={styles.printMock} style={{ borderColor: readableOn(firstColor) }}>
              <span style={{ color: readableOn(firstColor) }}>{printSize || option.technique}</span>
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <Row label={t('summaryColor')} value={color || '—'} />
          <Row label={t('summarySizes')} value={summarizeSizes(quantities)} />
          <Row label={t('summaryPrint')} value={option ? option.technique : t('printNone')} />
          <Row label={t('summaryUnits')} value={String(totalUnits)} />
        </div>
      </aside>

      <section className="flex flex-col gap-7" aria-labelledby="product-title">
        <div className="flex flex-col gap-3">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="product-title" className={cx(styles.display, styles.h2)}>
            {product.name}
          </h1>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={styles.price}>{formatMoney(product.basePrice, locale)}</span>
            <span className={styles.muted}>{t('perUnit')}</span>
          </div>
          <p className={styles.hint}>{t('priceNote')}</p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className={styles.sectionTitle}>{t('colorLabel')}</legend>
          <div role="radiogroup" aria-label={t('colorLabel')} className={styles.chips}>
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
                    setAdded(false)
                  }}
                  className={cx(styles.colorChip, selected && styles.colorChipOn)}
                >
                  <Swatch name={name} />
                  {name}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className={styles.sectionTitle}>{t('sizesLabel')}</legend>
          <ul className={styles.sizeGrid}>
            {product.sizes.map((size) => {
              const value = quantities[size] ?? 0
              return (
                <li key={size} className={cx(styles.sizeCell, value > 0 && styles.sizeCellOn)}>
                  <span className={cx(styles.display, styles.h4)}>{size}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`${t('decrease')} ${size}`}
                      disabled={value === 0}
                      onClick={() => {
                        setQty(size, value - 1)
                      }}
                      className={styles.stepButton}
                    >
                      {tc('minus')}
                    </button>
                    <span aria-live="polite" className={styles.stepValue}>
                      {value}
                    </span>
                    <button
                      type="button"
                      aria-label={`${t('increase')} ${size}`}
                      onClick={() => {
                        setQty(size, value + 1)
                      }}
                      className={styles.stepButton}
                    >
                      {tc('plus')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <p className={styles.muted}>{t('unitsSelected', { units: totalUnits })}</p>
        </fieldset>

        {product.printOptions.length > 0 ? (
          <fieldset className="flex flex-col gap-4">
            <legend className={styles.sectionTitle}>{t('printLabel')}</legend>
            <div role="radiogroup" aria-label={t('printLabel')} className={styles.chips}>
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
                      choosePrint(index)
                    }}
                    className={cx(styles.chip, selected && styles.chipOn)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {option ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('printSize')}
                  htmlFor={`print-size-${product.id}`}
                  hint={t('printFeeNote', {
                    technique: option.technique,
                    fee: formatMoney(option.unitFee, locale),
                  })}
                >
                  <select
                    id={`print-size-${product.id}`}
                    value={printSize}
                    onChange={(event) => {
                      setPrintSize(event.target.value)
                    }}
                    className={controlClass}
                  >
                    <option value="">{t('choose')}</option>
                    {option.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('printPlacement')} htmlFor={`print-place-${product.id}`}>
                  <select
                    id={`print-place-${product.id}`}
                    value={printPlacement}
                    onChange={(event) => {
                      setPrintPlacement(event.target.value)
                    }}
                    className={controlClass}
                  >
                    <option value="">{t('choose')}</option>
                    {option.placements.map((placement) => (
                      <option key={placement} value={placement}>
                        {placement}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Notice tone="info">{t('printDesignPending')}</Notice>
                </div>
              </div>
            ) : null}
          </fieldset>
        ) : null}

        <div className={cx(styles.card, styles.cardBody, 'gap-4')}>
          <p className={cx('text-body-sm', afterAdd >= required ? styles.okText : styles.muted)}>
            {afterAdd >= required
              ? t('minimumWillMeet', { units: afterAdd, required, name: supplierName })
              : t('minimumWillMiss', { units: afterAdd, required, missing: required - afterAdd })}
          </p>

          {localError || addLine.error ? (
            <Notice tone="danger" role="alert">
              {localError ?? errorMessage(addLine.error)}
            </Notice>
          ) : null}
          {added ? (
            <Notice tone="success">
              {t('added')}{' '}
              <Link href="/carrito" className="underline underline-offset-4">
                {t('goCart')}
              </Link>
            </Notice>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={addLine.isPending || totalUnits === 0}
              aria-busy={addLine.isPending}
              className={buttonClass({ size: 'lg' })}
            >
              {totalUnits === 0 ? t('chooseSizes') : t('addToCart')}
            </button>
            <Pill outline>{t('inCart', { units: inCart })}</Pill>
          </div>
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-body-sm flex items-center justify-between gap-4">
      <span className={styles.muted}>{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

/** "S×2 M×3" para el resumen, sin importes. */
function summarizeSizes(quantities: Record<string, number>): string {
  const parts = Object.entries(quantities)
    .filter(([, value]) => value > 0)
    .map(([size, value]) => `${size}×${value}`)
  return parts.length > 0 ? parts.join('  ') : '—'
}
