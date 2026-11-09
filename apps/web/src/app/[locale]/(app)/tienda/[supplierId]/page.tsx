import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/marketplace/kit'
import { RequireSession } from '@/components/marketplace/RequireSession'
import { SupplierCatalog } from '@/components/marketplace/Store'

type PageProps = { params: Promise<{ locale: string; supplierId: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SupplierCatalogPage({ params }: PageProps) {
  const { locale, supplierId } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.store')
  const c = await getTranslations('marketplace.common')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <Breadcrumb items={[{ href: '/tienda', label: t('back') }, { label: c('breadcrumb') }]} />
      <RequireSession>
        <SupplierCatalog supplierId={supplierId} />
      </RequireSession>
    </div>
  )
}
