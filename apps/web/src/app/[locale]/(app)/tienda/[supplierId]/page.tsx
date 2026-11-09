import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { SupplierCatalog } from '@/components/marketplace/Store'
import { headingClass, pageClass } from '@/components/marketplace/ui'
import { Link } from '@/lib/i18n/navigation'

type PageProps = { params: Promise<{ locale: string; supplierId: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SupplierCatalogPage({ params }: PageProps) {
  const { locale, supplierId } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.store')

  return (
    <div className={pageClass}>
      <Link href="/tienda" className="text-primary text-body-sm underline-offset-4 hover:underline">
        {t('back')}
      </Link>
      <h1 className={headingClass}>{t('catalog')}</h1>
      <SupplierCatalog supplierId={supplierId} />
    </div>
  )
}
