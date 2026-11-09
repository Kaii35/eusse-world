import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { SupplierList } from '@/components/marketplace/Store'
import { headingClass, pageClass, hintClass } from '@/components/marketplace/ui'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function StorePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.store')

  return (
    <div className={pageClass}>
      <header className="flex flex-col gap-2">
        <h1 className={headingClass}>{t('title')}</h1>
        <p className={hintClass}>{t('intro')}</p>
      </header>
      <SupplierList />
    </div>
  )
}
