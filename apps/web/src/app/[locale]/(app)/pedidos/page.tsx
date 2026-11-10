import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { MerchantOrders } from '@/components/marketplace/Orders'
import { RequireSession } from '@/components/marketplace/RequireSession'
import styles from '@/components/marketplace/wholesale.module.css'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <RequireSession>
          <MerchantOrders />
        </RequireSession>
      </div>
    </div>
  )
}
