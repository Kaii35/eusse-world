'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { buttonClass, controlClass, Field, Notice, Pill, PageHeader, Surface } from './kit'
import { RequireSession } from './RequireSession'
import styles from './wholesale.module.css'

import type { PrintTechnique } from '@/lib/marketplace/api/types'

import { Link, useRouter } from '@/lib/i18n/navigation'
import { useCreateProduct, useMySupplier, type ProductInput } from '@/lib/marketplace/api/queries'
import { parseList, toMinorUnits } from '@/lib/marketplace/format'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

const TECHNIQUES: readonly PrintTechnique[] = ['DTF', 'SCREEN', 'EMBROIDERY', 'SUBLIMATION']
const CURRENCIES = ['COP', 'USD', 'EUR'] as const
type Currency = (typeof CURRENCIES)[number]

/**
 * Alta de un producto en tres pasos visibles, con una lista de verificación que se actualiza
 * mientras se escribe. La lista orienta; el servidor es quien valida al guardar.
 */
export function ProductForm() {
  return (
    <RequireSession>
      <ProductFormBody />
    </RequireSession>
  )
}

function ProductFormBody() {
  const t = useTranslations('marketplace.supplier')
  const supplier = useMySupplier()
  const router = useRouter()
  const ids = useId()
  const errorMessage = useApiErrorMessage()
  const create = useCreateProduct()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<Currency>('COP')
  const [colorsText, setColorsText] = useState('')
  const [sizesText, setSizesText] = useState('')
  const [withPrint, setWithPrint] = useState(false)
  const [technique, setTechnique] = useState<PrintTechnique>('DTF')
  const [printSizesText, setPrintSizesText] = useState('')
  const [placementsText, setPlacementsText] = useState('')
  const [printFee, setPrintFee] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const colors = parseList(colorsText)
  const sizes = parseList(sizesText)
  const printSizes = parseList(printSizesText)
  const placements = parseList(placementsText)
  const priceMinor = toMinorUnits(price)
  const feeMinor = toMinorUnits(printFee)

  const checks = [
    { label: t('checkName'), ok: name.trim().length > 0 },
    { label: t('checkCategory'), ok: category.trim().length > 0 },
    { label: t('checkPrice'), ok: Number.isFinite(priceMinor) && priceMinor > 0 },
    { label: t('checkColors'), ok: colors.length > 0 },
    { label: t('checkSizes'), ok: sizes.length > 0 },
    ...(withPrint
      ? [
          {
            label: t('checkPrint'),
            ok:
              printSizes.length > 0 &&
              placements.length > 0 &&
              Number.isFinite(feeMinor) &&
              feeMinor >= 0,
          },
        ]
      : []),
  ]

  function submit() {
    setLocalError(null)
    if (!Number.isFinite(priceMinor)) {
      setLocalError(t('priceInvalid'))
      return
    }
    if (withPrint && !Number.isFinite(feeMinor)) {
      setLocalError(t('printFeeInvalid'))
      return
    }
    const input: ProductInput = {
      name,
      category,
      basePrice: { amount: priceMinor, currency },
      colors,
      sizes,
      printOptions: withPrint
        ? [
            {
              technique,
              sizes: printSizes,
              placements,
              unitFee: { amount: feeMinor, currency },
            },
          ]
        : [],
    }
    create.mutate(input, {
      onSuccess: () => {
        router.push('/proveedor')
      },
    })
  }

  if (supplier.data && supplier.data.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader level="h2" title={t('newProductTitle')} />
        <Notice tone="warning">{t('pendingNotice')}</Notice>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        level="h2"
        title={t('newProductTitle')}
        description={t('newProductBody')}
        actions={
          <Link
            href="/proveedor"
            className="text-primary text-body-sm underline-offset-4 hover:underline"
          >
            {t('cancel')}
          </Link>
        }
      />

      <div className={styles.formLayout}>
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event: { preventDefault: () => void }) => {
            event.preventDefault()
            submit()
          }}
        >
          <Surface labelledBy={`${ids}-basics`}>
            <h2 id={`${ids}-basics`} className="text-h4 text-foreground font-semibold">
              {t('sectionBasics')}
            </h2>
            <Field label={t('name')} htmlFor={`${ids}-name`}>
              <input
                id={`${ids}-name`}
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                }}
                className={controlClass}
              />
            </Field>
            <Field label={t('category')} htmlFor={`${ids}-cat`}>
              <input
                id={`${ids}-cat`}
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                }}
                className={controlClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,9rem)]">
              <Field label={t('price')} htmlFor={`${ids}-price`}>
                <input
                  id={`${ids}-price`}
                  required
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                  }}
                  className={controlClass}
                />
              </Field>
              <Field label={t('currency')} htmlFor={`${ids}-currency`}>
                <select
                  id={`${ids}-currency`}
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value as Currency)
                  }}
                  className={controlClass}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Surface>

          <Surface labelledBy={`${ids}-variants`}>
            <h2 id={`${ids}-variants`} className="text-h4 text-foreground font-semibold">
              {t('sectionVariants')}
            </h2>
            <Field label={t('colors')} hint={t('colorsHint')} htmlFor={`${ids}-colors`}>
              <input
                id={`${ids}-colors`}
                required
                value={colorsText}
                onChange={(e) => {
                  setColorsText(e.target.value)
                }}
                className={controlClass}
              />
            </Field>
            {colors.length > 0 ? (
              <div className="flex flex-wrap gap-2" aria-label={t('colors')}>
                {colors.map((color) => (
                  <Pill key={color}>{color}</Pill>
                ))}
              </div>
            ) : null}
            <Field label={t('sizes')} hint={t('sizesHint')} htmlFor={`${ids}-sizes`}>
              <input
                id={`${ids}-sizes`}
                required
                value={sizesText}
                onChange={(e) => {
                  setSizesText(e.target.value)
                }}
                className={controlClass}
              />
            </Field>
            {sizes.length > 0 ? (
              <div className="flex flex-wrap gap-2" aria-label={t('sizes')}>
                {sizes.map((size) => (
                  <Pill key={size}>{size}</Pill>
                ))}
              </div>
            ) : null}
          </Surface>

          <Surface labelledBy={`${ids}-print`}>
            <h2 id={`${ids}-print`} className="text-h4 text-foreground font-semibold">
              {t('sectionPrint')}
            </h2>
            <label className="text-body-sm text-foreground flex items-center gap-3">
              <input
                type="checkbox"
                checked={withPrint}
                onChange={(e) => {
                  setWithPrint(e.target.checked)
                }}
                className="size-4"
              />
              {t('printToggle')}
            </label>
            <p className="text-caption text-muted-foreground">{t('printHint')}</p>
            {withPrint ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('printTechnique')} htmlFor={`${ids}-tech`}>
                  <select
                    id={`${ids}-tech`}
                    value={technique}
                    onChange={(e) => {
                      setTechnique(e.target.value as PrintTechnique)
                    }}
                    className={controlClass}
                  >
                    {TECHNIQUES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('printFee')} htmlFor={`${ids}-fee`}>
                  <input
                    id={`${ids}-fee`}
                    inputMode="decimal"
                    value={printFee}
                    onChange={(e) => {
                      setPrintFee(e.target.value)
                    }}
                    className={controlClass}
                  />
                </Field>
                <Field label={t('printSizes')} hint={t('printSizesHint')} htmlFor={`${ids}-psizes`}>
                  <input
                    id={`${ids}-psizes`}
                    value={printSizesText}
                    onChange={(e) => {
                      setPrintSizesText(e.target.value)
                    }}
                    className={controlClass}
                  />
                </Field>
                <Field
                  label={t('printPlacements')}
                  hint={t('printPlacementsHint')}
                  htmlFor={`${ids}-place`}
                >
                  <input
                    id={`${ids}-place`}
                    value={placementsText}
                    onChange={(e) => {
                      setPlacementsText(e.target.value)
                    }}
                    className={controlClass}
                  />
                </Field>
              </div>
            ) : null}
          </Surface>

          {localError || create.error ? (
            <Notice tone="danger" role="alert">
              {localError ?? errorMessage(create.error)}
            </Notice>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={create.isPending}
              aria-busy={create.isPending}
              className={buttonClass({ size: 'lg' })}
            >
              {t('saveDraft')}
            </button>
            <Link href="/proveedor" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
              {t('cancel')}
            </Link>
          </div>
        </form>

        <aside className={styles.sticky}>
          <Surface labelledBy={`${ids}-check`}>
            <h2 id={`${ids}-check`} className="text-h4 text-foreground font-semibold">
              {t('checklistTitle')}
            </h2>
            <ul className="flex flex-col gap-3">
              {checks.map((check) => (
                <li key={check.label} className="text-body-sm flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      check.ok
                        ? 'bg-success-subtle text-success-subtle-foreground flex size-5 items-center justify-center rounded-full'
                        : 'border-border size-5 rounded-full border'
                    }
                  >
                    {check.ok ? '✓' : ''}
                  </span>
                  <span className={check.ok ? 'text-foreground' : 'text-muted-foreground'}>
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
          </Surface>
        </aside>
      </div>
    </div>
  )
}
