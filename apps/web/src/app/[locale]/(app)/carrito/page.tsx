import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { Cart } from '@/components/marketplace/Cart'
import { PageHeader } from '@/components/marketplace/kit'
import { RequireSession } from '@/components/marketplace/RequireSession'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.cart')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader title={t('title')} />
      <RequireSession>
        <Cart />
      </RequireSession>
    </div>
  )
}
