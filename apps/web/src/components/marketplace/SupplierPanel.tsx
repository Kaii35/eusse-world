'use client'

import { Button, Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { controlClass, EmptyState, Field, Notice, Pill, PageHeader, Surface } from './kit'
import { RequireSession } from './RequireSession'

import type { PillTone } from './kit'
import type { OwnSupplier, Product, SupplierStatus } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useMyProducts,
  useMySupplier,
  usePublishProduct,
  useRegisterSupplier,
} from '@/lib/marketplace/api/queries'
import { formatMoney } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

const STATUS_TONE: Record<SupplierStatus, PillTone> = {
  PENDING_REVIEW: 'warning',
  ACTIVE: 'success',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
}

/** Panel del proveedor: sin empresa, pide registrarla; con empresa, muestra su estado y catálogo. */
export function SupplierPanel() {
  return (
    <RequireSession>
      <SupplierArea />
    </RequireSession>
  )
}

function SupplierArea() {
  const t = useTranslations('marketplace.supplier')
  const supplier = useMySupplier()

  if (supplier.isPending) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (supplier.isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Notice tone="danger" role="alert">
          {t('registerBody')}
        </Notice>
      </div>
    )
  }

  if (!supplier.data) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <PageHeader title={t('title')} />
        <RegisterSupplier />
      </div>
    )
  }

  return <Dashboard supplier={supplier.data} />
}

function RegisterSupplier() {
  const t = useTranslations('marketplace.supplier')
  const tAccess = useTranslations('marketplace.access')
  const errorMessage = useApiErrorMessage()
  const register = useRegisterSupplier()
  const ids = useId()
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')

  return (
    <Surface labelledBy={`${ids}-title`}>
      <div className="flex flex-col gap-2">
        <h2 id={`${ids}-title`} className="text-h3 text-foreground font-semibold">
          {t('registerTitle')}
        </h2>
        <p className="text-body text-muted-foreground">{t('registerBody')}</p>
      </div>
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
        <Button
          type="submit"
          size="lg"
          isLoading={register.isPending}
          disabled={register.isPending}
        >
          {t('register')}
        </Button>
      </form>
    </Surface>
  )
}

function Dashboard({ supplier }: { supplier: OwnSupplier }) {
  const t = useTranslations('marketplace.supplier')
  const products = useMyProducts(true)
  const list = products.data ?? []
  const published = list.filter((p) => p.status === 'PUBLISHED').length
  const drafts = list.filter((p) => p.status === 'DRAFT').length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <Surface labelledBy="supplier-name">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-caption text-muted-foreground">{t('title')}</p>
            <h1 id="supplier-name" className="text-h2 text-foreground font-semibold">
              {supplier.legalName}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-caption text-muted-foreground">{t('statusLabel')}</span>
            <Pill tone={STATUS_TONE[supplier.status]}>{t(`status${supplier.status}`)}</Pill>
          </div>
        </div>
        {supplier.status === 'PENDING_REVIEW' ? (
          <Notice tone="warning">{t('pendingNotice')}</Notice>
        ) : null}
        {supplier.rejectionReason ? (
          <Notice tone="danger" role="alert">
            {t('rejectionReasonText', { reason: supplier.rejectionReason })}
          </Notice>
        ) : null}
      </Surface>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Kpi label={t('kpiProducts')} value={list.length} />
        <Kpi label={t('kpiPublished')} value={published} />
        <Kpi label={t('kpiDrafts')} value={drafts} />
      </dl>

      <Catalog products={products.data} isPending={products.isPending} isError={products.isError} />
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-surface shadow-raised flex flex-col gap-1 rounded-lg border p-5">
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd className="text-h2 text-foreground font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function Catalog({
  products,
  isPending,
  isError,
}: {
  products: Product[] | undefined
  isPending: boolean
  isError: boolean
}) {
  const t = useTranslations('marketplace.supplier')
  const c = useTranslations('marketplace.common')

  return (
    <Surface labelledBy="catalog-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="catalog-title" className="text-h3 text-foreground font-semibold">
            {t('productsTitle')}
          </h2>
          <p className="text-body-sm text-muted-foreground">{t('productsIntro')}</p>
        </div>
        <Button asChild>
          <Link href="/proveedor/productos/nuevo">{t('newProduct')}</Link>
        </Button>
      </div>

      {isPending ? <Skeleton className="h-32 w-full" /> : null}
      {isError ? (
        <Notice tone="danger" role="alert">
          {c('loadFailed')}
        </Notice>
      ) : null}
      {products?.length === 0 ? (
        <EmptyState title={t('productsTitle')} body={t('noProducts')} />
      ) : null}
      {products && products.length > 0 ? (
        <ul className="divide-border flex flex-col divide-y">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      ) : null}
    </Surface>
  )
}

function ProductRow({ product }: { product: Product }) {
  const t = useTranslations('marketplace.supplier')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const publish = usePublishProduct()
  const published = product.status === 'PUBLISHED'

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body text-foreground font-semibold">{product.name}</span>
        <span className="text-caption text-muted-foreground">
          {t('productSummary', {
            price: formatMoney(product.basePrice, locale),
            colors: product.colors.length,
            sizes: product.sizes.length,
          })}
        </span>
        {publish.error && publish.variables === product.id ? (
          <Notice tone="danger" role="alert">
            {errorMessage(publish.error)}
          </Notice>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Pill tone={published ? 'success' : 'neutral'}>
          {published ? t('published') : t('draft')}
        </Pill>
        {published ? null : (
          <Button
            size="sm"
            isLoading={publish.isPending && publish.variables === product.id}
            disabled={publish.isPending}
            onClick={() => {
              publish.mutate(product.id)
            }}
          >
            {t('publish')}
          </Button>
        )}
      </div>
    </li>
  )
}
