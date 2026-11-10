'use client'

import { Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState, type ReactNode } from 'react'

import {
  buttonClass,
  controlClass,
  cx,
  Eyebrow,
  Field,
  Notice,
  Pill,
  PreviewBanner,
  Surface,
  Swatch,
} from './kit'
import { Figure, OrderTrack, StepTag } from './Orders'
import { RequireSession } from './RequireSession'
import { SAMPLE_ORDERS } from './sample'
import styles from './wholesale.module.css'

import type { OwnSupplier, Product } from '@/lib/marketplace/api/types'

import { Link, usePathname } from '@/lib/i18n/navigation'
import {
  useMyProducts,
  useMySupplier,
  usePublishProduct,
  useRegisterSupplier,
} from '@/lib/marketplace/api/queries'
import { formatMoney, initialsOf, sizeRange } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/* ── Marco del panel ───────────────────────────────────────────────────── */

const PANEL_SECTIONS = [
  { href: '/proveedor', key: 'overview' },
  { href: '/proveedor/ordenes', key: 'orders' },
  { href: '/proveedor/catalogo', key: 'catalog' },
  { href: '/proveedor/estampados', key: 'print' },
] as const

/** Barra lateral en azul de la landing, con la sección actual resaltada. */
export function PanelShell({ children }: { children: ReactNode }) {
  const t = useTranslations('marketplace.panel')
  const tSupplier = useTranslations('marketplace.supplier')
  const locale = useLocale()
  const pathname = usePathname()
  const supplier = useMySupplier()
  const todayText = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const today = todayText.charAt(0).toUpperCase() + todayText.slice(1)

  const activeKey = currentSection(pathname)
  const activeLabel = t(`nav.${activeKey}`)

  return (
    <div className={styles.panelShell}>
      <aside className={styles.panelSide} aria-label={t('label')}>
        <div className={styles.panelBrand}>
          <span className={styles.brandSub}>{t('brand')}</span>
        </div>
        <nav aria-label={t('label')}>
          <ul className={styles.panelNav}>
            {PANEL_SECTIONS.map((section) => {
              const current = section.key === activeKey
              return (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    aria-current={current ? 'page' : undefined}
                    className={cx(styles.panelLink, current && styles.panelLinkOn)}
                  >
                    {t(`nav.${section.key}`)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className={styles.panelUser}>
          <span aria-hidden="true" className={styles.groupMark}>
            {supplier.data ? initialsOf(supplier.data.legalName) : '··'}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className={styles.panelUserName}>
              {supplier.data?.legalName ?? t('noSupplierName')}
            </span>
            <span>{supplier.data ? tSupplier(`status.${supplier.data.status}`) : ''}</span>
          </span>
        </div>
      </aside>

      <div className={styles.panelMain}>
        <header className={styles.panelTop}>
          <h1 className={cx(styles.display, styles.h4)}>{activeLabel}</h1>
          <span className={cx(styles.muted, 'text-body-sm')}>{today}</span>
        </header>
        <div className={styles.panelBody}>
          <RequireSession>
            <SupplierGate>{children}</SupplierGate>
          </RequireSession>
        </div>
      </div>
    </div>
  )
}

function currentSection(pathname: string): (typeof PANEL_SECTIONS)[number]['key'] {
  if (pathname.includes('/proveedor/productos')) return 'catalog'
  const match = PANEL_SECTIONS.find(
    (section) => section.href !== '/proveedor' && pathname.includes(section.href),
  )
  return match?.key ?? 'overview'
}

/**
 * Decide qué puede ver el proveedor según su estado (RFC-0016). Sin registro, pide la
 * empresa. En revisión, puede preparar productos pero no publicarlos. Rechazado o suspendido,
 * sólo ve el motivo.
 */
export function SupplierGate({ children }: { children: ReactNode }) {
  const t = useTranslations('marketplace.supplier')
  const supplier = useMySupplier()

  if (supplier.isPending) return <Skeleton className="h-64 w-full" />

  if (supplier.isError) {
    return (
      <Notice tone="danger" role="alert">
        {t('loadFailed')}
      </Notice>
    )
  }

  if (supplier.data === null) return <RegisterSupplier />

  const data: OwnSupplier = supplier.data
  if (data.status === 'REJECTED' || data.status === 'SUSPENDED') {
    return (
      <Surface labelledBy="status-title">
        <h2 id="status-title" className={cx(styles.display, styles.h3)}>
          {t(`status.${data.status}`)}
        </h2>
        <Notice tone="danger">
          {data.rejectionReason
            ? t('rejectionReasonText', { reason: data.rejectionReason })
            : t('blockedNotice')}
        </Notice>
      </Surface>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {data.status === 'PENDING_REVIEW' ? <Notice tone="info">{t('pendingNotice')}</Notice> : null}
      {children}
    </div>
  )
}

/** Registro de la empresa como proveedor. Operaciones lo aprueba antes de publicar. */
export function RegisterSupplier() {
  const t = useTranslations('marketplace.supplier')
  const tAccess = useTranslations('marketplace.access')
  const errorMessage = useApiErrorMessage()
  const register = useRegisterSupplier()
  const ids = useId()
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')

  return (
    <div className={styles.splitEven}>
      <div className="flex flex-col gap-4">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h2 className={cx(styles.display, styles.h2)}>{t('registerTitle')}</h2>
        <p className={styles.lead}>{t('registerBody')}</p>
      </div>
      <Surface labelledBy={`${ids}-title`}>
        <h3 id={`${ids}-title`} className={cx(styles.display, styles.h4)}>
          {t('register')}
        </h3>
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={(event: { preventDefault: () => void }) => {
            event.preventDefault()
            register.mutate({ legalName, taxId })
          }}
        >
          <Field label={tAccess('legalName')} htmlFor={`${ids}-legal`}>
            <input
              id={`${ids}-legal`}
              required
              value={legalName}
              onChange={(event) => {
                setLegalName(event.target.value)
              }}
              className={controlClass}
            />
          </Field>
          <Field label={tAccess('taxId')} htmlFor={`${ids}-tax`}>
            <input
              id={`${ids}-tax`}
              required
              value={taxId}
              onChange={(event) => {
                setTaxId(event.target.value)
              }}
              className={controlClass}
            />
          </Field>
          {register.error ? (
            <Notice tone="danger" role="alert">
              {errorMessage(register.error)}
            </Notice>
          ) : null}
          <button
            type="submit"
            disabled={register.isPending}
            aria-busy={register.isPending}
            className={buttonClass({ size: 'lg', block: true })}
          >
            {t('register')}
          </button>
        </form>
      </Surface>
    </div>
  )
}

/* ── Resumen (08) ──────────────────────────────────────────────────────── */

export function PanelOverview() {
  const t = useTranslations('marketplace.panel')
  const products = useMyProducts(true)
  const list = products.data ?? []
  const published = list.filter((item) => item.status === 'PUBLISHED').length
  const drafts = list.filter((item) => item.status === 'DRAFT').length

  return (
    <div className="flex flex-col gap-8">
      <div className={styles.kpis}>
        <Kpi label={t('kpiProducts')} value={products.isPending ? '—' : String(list.length)} />
        <Kpi label={t('kpiPublished')} value={products.isPending ? '—' : String(published)} />
        <Kpi label={t('kpiDrafts')} value={products.isPending ? '—' : String(drafts)} />
        <Kpi
          label={t('kpiPending')}
          value={String(SAMPLE_ORDERS.filter((o) => o.step === 0).length)}
          sample
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface padded={false} labelledBy="recent-products">
          <div className={styles.cardHead}>
            <h2 id="recent-products" className="text-body font-semibold">
              {t('recentProducts')}
            </h2>
            <Link href="/proveedor/catalogo" className={buttonClass({ variant: 'ghost' })}>
              {t('seeCatalog')}
            </Link>
          </div>
          {products.isPending ? (
            <Skeleton className="m-5 h-40" />
          ) : (
            <ProductRows products={list.slice(0, 5)} compact />
          )}
        </Surface>

        <Surface padded={false} labelledBy="recent-orders">
          <div className={styles.cardHead}>
            <h2 id="recent-orders" className="text-body font-semibold">
              {t('recentOrders')}
            </h2>
            <Link href="/proveedor/ordenes" className={buttonClass({ variant: 'ghost' })}>
              {t('seeOrders')}
            </Link>
          </div>
          <div className="p-5">
            <PreviewBanner>{t('previewOrders')}</PreviewBanner>
          </div>
          <ul>
            {SAMPLE_ORDERS.slice(0, 3).map((order) => (
              <li key={order.id} className={cx(styles.row, styles.rowRecent)}>
                <span className="flex flex-col">
                  <span className="font-medium">{order.id}</span>
                  <span className={styles.muted}>{t('ordersUnits', { units: order.units })}</span>
                </span>
                <StepTag order={order} />
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </div>
  )
}

function Kpi({ label, value, sample = false }: { label: string; value: string; sample?: boolean }) {
  const t = useTranslations('marketplace.panel')
  return (
    <div className={styles.kpi}>
      <span className={cx(styles.muted, 'text-body-sm')}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
      {sample ? <span className="text-caption text-muted-foreground">{t('sampleTag')}</span> : null}
    </div>
  )
}

/* ── Órdenes (09) ──────────────────────────────────────────────────────── */

export function PanelOrders() {
  const t = useTranslations('marketplace.panel')
  const tSample = useTranslations('marketplace.sample')
  const tOrders = useTranslations('marketplace.orders')
  const locale = useLocale()
  const [selectedId, setSelectedId] = useState(SAMPLE_ORDERS[0]?.id ?? '')
  const selected = SAMPLE_ORDERS.find((order) => order.id === selectedId) ?? SAMPLE_ORDERS[0]

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner>{t('previewOrders')}</PreviewBanner>
      <div className={styles.ordersSplit}>
        <Surface padded={false} labelledBy="orders-list">
          <h2 id="orders-list" className="sr-only">
            {t('nav.orders')}
          </h2>
          <div className={cx(styles.row, styles.rowHead, styles.rowOrders)}>
            <span>{t('colOrder')}</span>
            <span>{t('colMerchant')}</span>
            <span>{t('colUnits')}</span>
            <span>{t('colStatus')}</span>
          </div>
          <ul>
            {SAMPLE_ORDERS.map((order) => {
              const current = order.id === selected?.id
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    aria-pressed={current}
                    onClick={() => {
                      setSelectedId(order.id)
                    }}
                    className={cx(
                      styles.row,
                      styles.rowButton,
                      styles.rowOrders,
                      current && styles.rowOn,
                    )}
                  >
                    <span className={styles.muted}>{order.id}</span>
                    <span>{tSample(order.merchantKey)}</span>
                    <span>{order.units}</span>
                    <StepTag order={order} />
                  </button>
                </li>
              )
            })}
          </ul>
        </Surface>

        {selected ? (
          <Surface labelledBy="order-detail">
            <div className="flex flex-col gap-1">
              <span className={cx(styles.muted, 'text-body-sm')}>{selected.id}</span>
              <h2 id="order-detail" className={cx(styles.display, styles.h3)}>
                {tSample(selected.merchantKey)}
              </h2>
            </div>
            <OrderTrack step={selected.step} />
            <div className={styles.figureGrid}>
              <Figure label={tOrders('units')} value={String(selected.units)} />
              <Figure
                label={tOrders('total')}
                value={formatMoney(
                  { amount: selected.totalMinor, currency: selected.currency },
                  locale,
                )}
              />
            </div>
            <Notice tone="info">{t('advanceUnavailable')}</Notice>
            <button type="button" disabled className={buttonClass({ block: true })}>
              {t('advance')}
            </button>
          </Surface>
        ) : null}
      </div>
    </div>
  )
}

/* ── Catálogo (10) ─────────────────────────────────────────────────────── */

export function PanelCatalog() {
  const t = useTranslations('marketplace.panel')
  const products = useMyProducts(true)

  return (
    <div className="flex flex-col gap-8">
      <div className={styles.splitEven}>
        <div className={styles.dropzone} aria-disabled="true">
          <span className={cx(styles.muted, 'text-body-sm')}>{t('pdfTitle')}</span>
          <span className="text-body font-medium">{t('pdfBody')}</span>
          <PreviewBanner>{t('pdfPending')}</PreviewBanner>
        </div>
        <Surface labelledBy="manual-title">
          <h2 id="manual-title" className={cx(styles.display, styles.h4)}>
            {t('manualTitle')}
          </h2>
          <p className={styles.muted}>{t('manualBody')}</p>
          <Link href="/proveedor/productos/nuevo" className={buttonClass({ block: true })}>
            {t('newProduct')}
          </Link>
        </Surface>
      </div>

      <Surface padded={false} labelledBy="catalog-list">
        <div className={styles.cardHead}>
          <h2 id="catalog-list" className="text-body font-semibold">
            {t('catalogList')}
          </h2>
          <span className={styles.muted}>
            {t('productCount', { count: products.data?.length ?? 0 })}
          </span>
        </div>
        {products.isPending ? <Skeleton className="m-5 h-40" /> : null}
        {products.isSuccess && products.data.length === 0 ? (
          <p className="text-body text-muted-foreground p-6">{t('noProducts')}</p>
        ) : null}
        {products.isSuccess && products.data.length > 0 ? (
          <ProductRows products={products.data} />
        ) : null}
      </Surface>
    </div>
  )
}

/** Filas de producto con su estado y, si es borrador, el botón para publicarlo. */
export function ProductRows({
  products,
  compact = false,
}: {
  products: Product[]
  compact?: boolean
}) {
  const t = useTranslations('marketplace.panel')
  const locale = useLocale()
  const publish = usePublishProduct()
  const errorMessage = useApiErrorMessage()

  if (products.length === 0) {
    return <p className="text-body text-muted-foreground p-6">{t('noProducts')}</p>
  }

  return (
    <div className={styles.table}>
      {compact ? null : (
        <div className={cx(styles.row, styles.rowHead, styles.rowFull)}>
          <span>{t('colProduct')}</span>
          <span>{t('colDetails')}</span>
          <span>{t('colPrice')}</span>
          <span>{t('colState')}</span>
        </div>
      )}
      {products.map((product) => (
        <div
          key={product.id}
          className={cx(styles.row, compact ? styles.rowCompact : styles.rowFull)}
        >
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{product.name}</span>
            <span className={styles.muted}>{product.category}</span>
          </span>
          {compact ? null : (
            <span className={cx(styles.muted, 'text-body-sm')}>
              {t('productSummary', {
                colors: product.colors.length,
                sizes: sizeRange(product.sizes),
              })}
            </span>
          )}
          {compact ? null : (
            <span className="font-medium">{formatMoney(product.basePrice, locale)}</span>
          )}
          <span className="flex items-center gap-2">
            <Pill outline={product.status !== 'PUBLISHED'}>
              {product.status === 'PUBLISHED' ? t('statePublished') : t('stateDraft')}
            </Pill>
            {product.status === 'DRAFT' ? (
              <button
                type="button"
                disabled={publish.isPending}
                onClick={() => {
                  publish.mutate(product.id)
                }}
                className={buttonClass({ variant: 'ghost', size: 'sm' })}
              >
                {publish.isPending && publish.variables === product.id
                  ? t('publishing')
                  : t('publish')}
              </button>
            ) : null}
          </span>
        </div>
      ))}
      {publish.error ? (
        <div className="px-5 pb-4">
          <Notice tone="danger" role="alert">
            {errorMessage(publish.error)}
          </Notice>
        </div>
      ) : null}
    </div>
  )
}

/* ── Estampados (11) ───────────────────────────────────────────────────── */

export function PanelPrint() {
  const t = useTranslations('marketplace.panel')
  const locale = useLocale()
  const products = useMyProducts(true)
  const options = collectPrintOptions(products.data ?? [])

  return (
    <div className={styles.printLayout}>
      <div className="flex flex-col gap-6">
        <p className={styles.lead}>{t('printIntro')}</p>
        <PreviewBanner>{t('printPending')}</PreviewBanner>
        {products.isPending ? <Skeleton className="h-40 w-full" /> : null}
        {products.isSuccess && options.length === 0 ? (
          <p className="text-body text-muted-foreground p-6">{t('noPrint')}</p>
        ) : null}
        {options.map((entry) => (
          <Surface key={entry.technique} padded={false} labelledBy={`tech-${entry.technique}`}>
            <div className={styles.cardHead}>
              <h2 id={`tech-${entry.technique}`} className="text-body font-semibold">
                {entry.technique}
              </h2>
              <span className={styles.muted}>{t('usedBy', { count: entry.products })}</span>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-3">
              <Figure label={t('sizesOffered')} value={entry.sizes.join(' · ')} />
              <Figure label={t('placements')} value={entry.placements.join(' · ')} />
              <Figure label={t('feeLabel')} value={formatMoney(entry.fee, locale)} />
            </div>
          </Surface>
        ))}
      </div>

      <Surface labelledBy="print-preview">
        <h2 id="print-preview" className={cx(styles.display, styles.h4)}>
          {t('previewTitle')}
        </h2>
        <p className={styles.muted}>{t('previewBody')}</p>
        <div className={styles.chips}>
          {options.map((entry) => (
            <Pill key={entry.technique} outline>
              <Swatch name={entry.technique} />
              {entry.technique}
            </Pill>
          ))}
        </div>
        <button type="button" disabled className={buttonClass({ block: true })}>
          {t('saveDisabled')}
        </button>
      </Surface>
    </div>
  )
}

type PrintSummaryEntry = {
  technique: string
  sizes: string[]
  placements: string[]
  fee: { amount: number; currency: 'COP' | 'USD' | 'EUR' }
  products: number
}

/** Agrupa los estampados de los productos del proveedor por técnica. Sólo lee datos reales. */
function collectPrintOptions(products: Product[]): PrintSummaryEntry[] {
  const byTechnique = new Map<string, PrintSummaryEntry>()
  for (const product of products) {
    for (const option of product.printOptions) {
      const entry = byTechnique.get(option.technique) ?? {
        technique: option.technique,
        sizes: [],
        placements: [],
        fee: option.unitFee,
        products: 0,
      }
      entry.sizes = [...new Set([...entry.sizes, ...option.sizes])]
      entry.placements = [...new Set([...entry.placements, ...option.placements])]
      entry.products += 1
      byTechnique.set(option.technique, entry)
    }
  }
  return [...byTechnique.values()]
}
