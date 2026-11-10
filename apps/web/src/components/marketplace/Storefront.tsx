'use client'

import { SUPPLIER_MINIMUM_UNITS } from '@eusse/contracts'
import { Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import {
  Breadcrumb,
  buttonClass,
  cx,
  EmptyState,
  Eyebrow,
  Notice,
  Pill,
  ProgressBar,
  Swatch,
} from './kit'
import { readableOn, swatchFor } from './swatch'
import styles from './wholesale.module.css'

import type { Product, PublicSupplier } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useActiveSuppliers,
  useCart,
  useSupplierCatalogs,
  useSupplierProducts,
} from '@/lib/marketplace/api/queries'
import { formatMoney, initialsOf, sizeRange } from '@/lib/marketplace/format'

/** Mínimo por proveedor, desde el contrato compartido con la API (RFC-0016). */
export const SUPPLIER_MINIMUM = SUPPLIER_MINIMUM_UNITS

/* ── Directorio de proveedores (02) ────────────────────────────────────── */

/**
 * Proveedores activos con su catálogo. La búsqueda y las categorías salen de los productos
 * publicados, así que cada tarjeta muestra lo que de verdad se puede comprar.
 */
export function SupplierDirectory() {
  const t = useTranslations('marketplace.store')
  const suppliers = useActiveSuppliers()
  const supplierList = useMemo(() => suppliers.data ?? [], [suppliers.data])
  const catalogs = useSupplierCatalogs(supplierList.map((supplier) => supplier.id))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const names = new Set<string>()
    for (const result of catalogs) {
      for (const product of result.data ?? []) names.add(product.category)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [catalogs])

  if (suppliers.isPending) {
    return (
      <div className={styles.grid3}>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (suppliers.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('loadFailed')}
      </Notice>
    )
  }

  const needle = query.trim().toLowerCase()
  const visible = supplierList.filter((supplier, index) => {
    const products = catalogs[index]?.data ?? []
    if (category && !products.some((product) => product.category === category)) return false
    if (!needle) return true
    return (
      supplier.legalName.toLowerCase().includes(needle) ||
      products.some((product) => product.name.toLowerCase().includes(needle))
    )
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h1 className={cx(styles.display, styles.h1)}>{t('title')}</h1>
            <p className={styles.lead}>{t('intro')}</p>
          </div>
          <div className={styles.banner}>
            <span aria-hidden="true" className={styles.dot} />
            <span>{t('minimumNotice', { required: SUPPLIER_MINIMUM })}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className={styles.searchBox}>
            <span className="sr-only">{t('searchLabel')}</span>
            <input
              type="search"
              value={query}
              placeholder={t('searchPlaceholder')}
              onChange={(event) => {
                setQuery(event.target.value)
              }}
              className={styles.input}
            />
          </label>
          <span className={styles.muted}>{t('count', { count: visible.length })}</span>
        </div>

        <div role="group" aria-label={t('categoriesLabel')} className={styles.chips}>
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => {
              setCategory(null)
            }}
            className={cx(styles.chip, category === null && styles.chipOn)}
          >
            {t('allCategories')}
          </button>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => {
                setCategory(name)
              }}
              className={cx(styles.chip, category === name && styles.chipOn)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={t('emptyTitle')}
          body={supplierList.length === 0 ? t('empty') : t('noMatches')}
        />
      ) : (
        <ul className={styles.grid3}>
          {visible.map((supplier) => {
            const index = supplierList.findIndex((item) => item.id === supplier.id)
            return (
              <li key={supplier.id}>
                <SupplierCard supplier={supplier} products={catalogs[index]?.data} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SupplierCard({
  supplier,
  products,
}: {
  supplier: PublicSupplier
  products: Product[] | undefined
}) {
  const t = useTranslations('marketplace.store')
  const locale = useLocale()
  const list = products ?? []
  const colors = [...new Set(list.flatMap((product) => product.colors))].slice(0, 4)
  const categories = [...new Set(list.map((product) => product.category))]
  const prints = list.some((product) => product.printOptions.length > 0)
  const cheapest = list.reduce<Product | null>(
    (best, product) =>
      best === null || product.basePrice.amount < best.basePrice.amount ? product : best,
    null,
  )

  return (
    <Link
      href={`/tienda/${supplier.id}`}
      aria-labelledby={`supplier-${supplier.id}`}
      className={styles.supplierCard}
    >
      <div className={styles.stripes} aria-hidden="true">
        <div
          className={cx(styles.tile, styles.stripeMain)}
          style={colors[0] ? { background: swatchFor(colors[0]) } : undefined}
        >
          <span
            className={styles.tileLabel}
            style={{ color: readableOn(swatchFor(colors[0] ?? '')) }}
          >
            {initialsOf(supplier.legalName)}
          </span>
        </div>
        <div style={colors[1] ? { background: swatchFor(colors[1]) } : undefined} />
        <div style={colors[2] ? { background: swatchFor(colors[2]) } : undefined} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 id={`supplier-${supplier.id}`} className={cx(styles.display, styles.h4)}>
            {supplier.legalName}
          </h2>
          <span className={cx(styles.muted, 'text-body-sm')}>
            {products === undefined
              ? t('loadingCatalog')
              : t('productCount', { count: list.length })}
          </span>
        </div>

        {categories.length > 0 ? <p className="text-body-sm">{categories.join(' · ')}</p> : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Pill outline>{t('minimumChip', { required: SUPPLIER_MINIMUM })}</Pill>
          <Pill outline>{prints ? t('printYes') : t('printNo')}</Pill>
          {cheapest ? (
            <Pill outline>
              {t('fromPrice', { price: formatMoney(cheapest.basePrice, locale) })}
            </Pill>
          ) : null}
        </div>

        <span className={buttonClass({ variant: 'secondary', size: 'sm' })}>
          {t('supplierCard')}
        </span>
      </div>
    </Link>
  )
}

/* ── Perfil del proveedor (03) ─────────────────────────────────────────── */

/** Perfil de un proveedor: su marca, qué estampado ofrece, su catálogo y el avance del mínimo. */
export function SupplierProfile({ supplierId }: { supplierId: string }) {
  const t = useTranslations('marketplace.store')
  const products = useSupplierProducts(supplierId)
  const cart = useCart()
  const suppliers = useActiveSuppliers()
  const supplier = suppliers.data?.find((item) => item.id === supplierId)
  const [category, setCategory] = useState<string | null>(null)

  if (products.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('loadFailed')}
      </Notice>
    )
  }

  const list = products.data ?? []
  const categories = [...new Set(list.map((product) => product.category))]
  const printTechniques = [...new Set(list.flatMap((p) => p.printOptions.map((o) => o.technique)))]
  const minimum = cart.data?.suppliers.find((item) => item.supplierId === supplierId)
  const units = minimum?.units ?? 0
  const name = supplier?.legalName ?? ''
  const shown = category ? list.filter((product) => product.category === category) : list

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        items={[{ href: '/tienda', label: t('breadcrumbStore') }, { label: name || '…' }]}
      />

      <div className={styles.profileTop}>
        <section
          className={cx(styles.card, styles.cardBody, styles.heroDark)}
          aria-labelledby="supplier-heading"
        >
          <div className="flex flex-wrap items-center gap-6">
            <span aria-hidden="true" className={cx(styles.display, styles.heroMark)}>
              {initialsOf(name)}
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <Eyebrow onDark>{t('profileEyebrow')}</Eyebrow>
              <h1 id="supplier-heading" className={cx(styles.display, styles.h2)}>
                {name}
              </h1>
            </div>
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt className={styles.heroLabel}>{t('kpiProducts')}</dt>
              <dd className={cx(styles.display, styles.h4)}>{list.length}</dd>
            </div>
            <div>
              <dt className={styles.heroLabel}>{t('kpiCategories')}</dt>
              <dd className={cx(styles.display, styles.h4)}>{categories.length}</dd>
            </div>
            <div>
              <dt className={styles.heroLabel}>{t('kpiMinimum')}</dt>
              <dd className={cx(styles.display, styles.h4)}>
                {t('minimumValue', { required: SUPPLIER_MINIMUM })}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={cx(styles.card, styles.cardBody, 'gap-4')}
          aria-labelledby="print-heading"
        >
          <h2 id="print-heading" className={cx(styles.display, styles.h4)}>
            {t('printHeading')}
          </h2>
          {printTechniques.length > 0 ? (
            <div className={styles.chips}>
              {printTechniques.map((technique) => (
                <Pill key={technique}>{technique}</Pill>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>{t('noPrint')}</p>
          )}
          <p className={styles.hint}>{t('printHint')}</p>
        </section>
      </div>

      <div className={cx(styles.card, styles.cardBody, styles.progressRow)}>
        <p className={cx('text-body', styles.progressText)}>
          {units >= SUPPLIER_MINIMUM
            ? t('minimumMet')
            : t('minimumProgress', { units, required: SUPPLIER_MINIMUM })}
        </p>
        <div className={styles.progressBox}>
          <ProgressBar value={units} max={SUPPLIER_MINIMUM} label={name} />
        </div>
        {units > 0 ? (
          <Link href="/carrito" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
            {t('goCart')}
          </Link>
        ) : null}
      </div>

      {categories.length > 0 ? (
        <div role="group" aria-label={t('categoriesLabel')} className={styles.chips}>
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => {
              setCategory(null)
            }}
            className={cx(styles.chip, category === null && styles.chipOn)}
          >
            {t('allCategories')}
          </button>
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => {
                setCategory(name)
              }}
              className={cx(styles.chip, category === name && styles.chipOn)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      {products.isPending ? (
        <div className={styles.grid4}>
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : null}

      {products.isSuccess && list.length === 0 ? (
        <EmptyState title={t('catalogTitle')} body={t('noProducts')} />
      ) : null}

      {shown.length > 0 ? (
        <ul className={styles.grid4}>
          {shown.map((product) => (
            <li key={product.id}>
              <ProductCard supplierId={supplierId} product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Tarjeta de producto. Lleva a la página de configuración donde se eligen colores y tallas. */
export function ProductCard({ supplierId, product }: { supplierId: string; product: Product }) {
  const t = useTranslations('marketplace.store')
  const locale = useLocale()
  const first = product.colors[0] ?? ''

  return (
    <Link
      href={`/tienda/${supplierId}/productos/${product.id}`}
      aria-labelledby={`product-${product.id}`}
      className={styles.productCard}
    >
      <div className={styles.tile} style={{ background: swatchFor(first) }}>
        <span className={styles.tileLabel} style={{ color: readableOn(swatchFor(first)) }}>
          {product.category}
        </span>
        {product.printOptions.length > 0 ? (
          <span className={styles.tileTag}>{t('customizable')}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 id={`product-${product.id}`} className="text-body font-medium leading-snug">
          {product.name}
        </h3>
        <div className="flex items-end justify-between gap-3">
          <span className={styles.price}>{formatMoney(product.basePrice, locale)}</span>
          <span className="text-caption text-muted-foreground">{sizeRange(product.sizes)}</span>
        </div>
        <div className="mt-auto flex gap-2">
          {product.colors.map((color) => (
            <Swatch key={color} name={color} />
          ))}
        </div>
      </div>
    </Link>
  )
}
