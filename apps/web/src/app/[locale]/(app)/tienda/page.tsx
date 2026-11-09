import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { PageHeader } from '@/components/marketplace/kit'
import { RequireSession } from '@/components/marketplace/RequireSession'
import { SupplierList } from '@/components/marketplace/Store'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function StorePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.store')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader title={t('title')} description={t('intro')} />
      <RequireSession>
        <SupplierList />
      </RequireSession>
    </div>
  )
}
