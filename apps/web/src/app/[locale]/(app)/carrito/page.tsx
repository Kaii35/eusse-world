import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { CartView } from '@/components/marketplace/Cart'
import { PageHeader } from '@/components/marketplace/kit'
import { RequireSession } from '@/components/marketplace/RequireSession'
import styles from '@/components/marketplace/wholesale.module.css'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketplace.cart')

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('intro')} />
        <RequireSession>
          <CartView />
        </RequireSession>
      </div>
    </div>
  )
}
