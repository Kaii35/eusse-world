import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { RequireSession } from '@/components/marketplace/RequireSession'
import { SupplierDirectory } from '@/components/marketplace/Storefront'
import styles from '@/components/marketplace/wholesale.module.css'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function StorePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <RequireSession>
          <SupplierDirectory />
        </RequireSession>
      </div>
    </div>
  )
}
