import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { RequireSession } from '@/components/marketplace/RequireSession'
import { SupplierProfile } from '@/components/marketplace/Storefront'
import styles from '@/components/marketplace/wholesale.module.css'

type PageProps = { params: Promise<{ locale: string; supplierId: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SupplierProfilePage({ params }: PageProps) {
  const { locale, supplierId } = await params
  setRequestLocale(locale)

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <RequireSession>
          <SupplierProfile supplierId={supplierId} />
        </RequireSession>
      </div>
    </div>
  )
}
