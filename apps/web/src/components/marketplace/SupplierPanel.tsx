'use client'

import { Badge, Button, Skeleton } from '@eusse/ui'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  errorClass,
  fieldClass,
  headingClass,
  hintClass,
  labelClass,
  listClass,
  noticeClass,
  sectionClass,
} from './ui'

import type { OwnSupplier, PrintTechnique, Product } from '@/lib/marketplace/api/types'

import { Link } from '@/lib/i18n/navigation'
import {
  useCreateProduct,
  useMe,
  useMyProducts,
  useMySupplier,
  usePublishProduct,
  useRegisterSupplier,
  type ProductInput,
} from '@/lib/marketplace/api/queries'
import { formatMoney, parseList, toMinorUnits } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

const TECHNIQUES: readonly PrintTechnique[] = ['DTF', 'SCREEN', 'EMBROIDERY', 'SUBLIMATION']
const CURRENCIES = ['COP', 'USD', 'EUR'] as const
type Currency = (typeof CURRENCIES)[number]

/** Panel del proveedor: registro, estado, catálogo y alta de productos. */
export function SupplierPanel() {
  const t = useTranslations('marketplace.supplier')
  const tNav = useTranslations('marketplace.nav')
  const me = useMe()
  const supplier = useMySupplier()

  if (me.isError) {
    return (
      <Shell title={t('title')}>
        <p role="alert" className={errorClass}>
          <Link href="/acceso" className="underline">
            {tNav('access')}
          </Link>
        </p>
      </Shell>
    )
  }

  if (supplier.isPending) {
    return (
      <Shell title={t('title')}>
        <Skeleton className="h-40 w-full" />
      </Shell>
    )
  }

  const own = supplier.data
  if (!own) {
    return (
      <Shell title={t('title')}>
        <RegisterSupplier />
      </Shell>
    )
  }

  return (
    <Shell title={t('title')}>
      <SupplierStatus supplier={own} />
      <Catalog />
    </Shell>
  )
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className={headingClass}>{title}</h1>
      {children}
    </div>
  )
}

function RegisterSupplier() {
  const t = useTranslations('marketplace.supplier')
  const tAccess = useTranslations('marketplace.access')
  const errorMessage = useApiErrorMessage()
  const register = useRegisterSupplier()
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')

  function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    register.mutate({ legalName, taxId })
  }

  return (
    <section className={sectionClass} aria-labelledby="register-supplier">
      <h2 id="register-supplier" className="text-h3 font-semibold">
        {t('registerTitle')}
      </h2>
      <p className={hintClass}>{t('registerBody')}</p>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
        <label className={labelClass}>
          {tAccess('legalName')}
          <input
            required
            value={legalName}
            onChange={(e) => {
              setLegalName(e.target.value)
            }}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          {tAccess('taxId')}
          <input
            required
            value={taxId}
            onChange={(e) => {
              setTaxId(e.target.value)
            }}
            className={fieldClass}
          />
        </label>
        {register.error ? (
          <p role="alert" className={errorClass}>
            {errorMessage(register.error)}
          </p>
        ) : null}
        <Button type="submit" isLoading={register.isPending} disabled={register.isPending}>
          {t('register')}
        </Button>
      </form>
    </section>
  )
}

function SupplierStatus({ supplier }: { supplier: OwnSupplier }) {
  const t = useTranslations('marketplace.supplier')
  const variant = supplier.status === 'ACTIVE' ? 'success' : 'neutral'
  return (
    <section className={sectionClass} aria-labelledby="supplier-status">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="supplier-status" className="text-h3 font-semibold">
          {supplier.legalName}
        </h2>
        <Badge variant={variant}>{t(`status${supplier.status}`)}</Badge>
      </div>
      {supplier.status === 'PENDING_REVIEW' ? (
        <p className={noticeClass}>{t('pendingNotice')}</p>
      ) : null}
      {supplier.rejectionReason ? (
        <p className={errorClass}>
          {t('rejectionReasonText', { reason: supplier.rejectionReason })}
        </p>
      ) : null}
    </section>
  )
}

function Catalog() {
  const t = useTranslations('marketplace.supplier')
  const locale = useLocale()
  const errorMessage = useApiErrorMessage()
  const products = useMyProducts(true)
  const publish = usePublishProduct()

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className={sectionClass} aria-labelledby="my-products">
        <h2 id="my-products" className="text-h3 font-semibold">
          {t('products')}
        </h2>
        {products.isPending ? <Skeleton className="h-24 w-full" /> : null}
        {products.isSuccess && products.data.length === 0 ? (
          <p className={hintClass}>{t('noProducts')}</p>
        ) : null}
        {products.isSuccess && products.data.length > 0 ? (
          <ul className={listClass}>
            {products.data.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                locale={locale}
                publishing={publish.isPending && publish.variables === product.id}
                onPublish={() => {
                  publish.mutate(product.id)
                }}
              />
            ))}
          </ul>
        ) : null}
        {publish.error ? (
          <p role="alert" className={errorClass}>
            {errorMessage(publish.error)}
          </p>
        ) : null}
      </section>

      <ProductForm />
    </div>
  )
}

function ProductRow({
  product,
  locale,
  publishing,
  onPublish,
}: {
  product: Product
  locale: string
  publishing: boolean
  onPublish: () => void
}) {
  const t = useTranslations('marketplace.supplier')
  const published = product.status === 'PUBLISHED'
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{product.name}</span>
        <span className={hintClass}>
          {formatMoney(product.basePrice, locale)} · {product.colors.join(', ')} ·{' '}
          {product.sizes.join(', ')}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={published ? 'success' : 'neutral'}>
          {published ? t('published') : t('draft')}
        </Badge>
        {published ? null : (
          <Button size="sm" onClick={onPublish} isLoading={publishing} disabled={publishing}>
            {publishing ? t('publishing') : t('publish')}
          </Button>
        )}
      </div>
    </li>
  )
}

function ProductForm() {
  const t = useTranslations('marketplace.supplier')
  const errorMessage = useApiErrorMessage()
  const create = useCreateProduct()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<Currency>('COP')
  const [colors, setColors] = useState('')
  const [sizes, setSizes] = useState('')
  const [withPrint, setWithPrint] = useState(false)
  const [technique, setTechnique] = useState<PrintTechnique>('DTF')
  const [printSizes, setPrintSizes] = useState('')
  const [placements, setPlacements] = useState('')
  const [printFee, setPrintFee] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    setLocalError(null)

    const basePrice = toMinorUnits(price)
    if (Number.isNaN(basePrice)) {
      setLocalError(t('priceInvalid'))
      return
    }
    const feeAmount = withPrint ? toMinorUnits(printFee) : 0
    if (Number.isNaN(feeAmount)) {
      setLocalError(t('printFeeInvalid'))
      return
    }

    const input: ProductInput = {
      name,
      category,
      basePrice: { amount: basePrice, currency },
      colors: parseList(colors),
      sizes: parseList(sizes),
      printOptions: withPrint
        ? [
            {
              technique,
              sizes: parseList(printSizes),
              placements: parseList(placements),
              unitFee: { amount: feeAmount, currency },
            },
          ]
        : [],
    }
    create.mutate(input, {
      onSuccess: () => {
        setName('')
        setPrice('')
        setColors('')
        setSizes('')
        setWithPrint(false)
      },
    })
  }

  return (
    <section className={sectionClass} aria-labelledby="new-product">
      <h2 id="new-product" className="text-h3 font-semibold">
        {t('addProduct')}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <label className={labelClass}>
          {t('name')}
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          {t('category')}
          <input
            required
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
            }}
            className={fieldClass}
          />
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,8rem)] gap-3">
          <label className={labelClass}>
            {t('price')}
            <input
              required
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
              }}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            {t('currency')}
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as Currency)
              }}
              className={fieldClass}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          {t('colors')}
          <input
            required
            value={colors}
            onChange={(e) => {
              setColors(e.target.value)
            }}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          {t('sizes')}
          <input
            required
            value={sizes}
            onChange={(e) => {
              setSizes(e.target.value)
            }}
            className={fieldClass}
          />
        </label>

        <fieldset className="border-border flex flex-col gap-3 border-t pt-4">
          <legend className="text-body font-semibold">{t('printTitle')}</legend>
          <label className="text-body-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={withPrint}
              onChange={(e) => {
                setWithPrint(e.target.checked)
              }}
            />
            {t('printTitle')}
          </label>
          {withPrint ? (
            <>
              <label className={labelClass}>
                {t('printTechnique')}
                <select
                  value={technique}
                  onChange={(e) => {
                    setTechnique(e.target.value as PrintTechnique)
                  }}
                  className={fieldClass}
                >
                  {TECHNIQUES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                {t('printSizes')}
                <input
                  required
                  value={printSizes}
                  onChange={(e) => {
                    setPrintSizes(e.target.value)
                  }}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                {t('printPlacements')}
                <input
                  required
                  value={placements}
                  onChange={(e) => {
                    setPlacements(e.target.value)
                  }}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                {t('printFee')}
                <input
                  required
                  inputMode="decimal"
                  value={printFee}
                  onChange={(e) => {
                    setPrintFee(e.target.value)
                  }}
                  className={fieldClass}
                />
              </label>
            </>
          ) : null}
        </fieldset>

        {localError || create.error ? (
          <p role="alert" className={errorClass}>
            {localError ?? errorMessage(create.error)}
          </p>
        ) : null}
        <Button type="submit" isLoading={create.isPending} disabled={create.isPending}>
          {t('save')}
        </Button>
      </form>
    </section>
  )
}
