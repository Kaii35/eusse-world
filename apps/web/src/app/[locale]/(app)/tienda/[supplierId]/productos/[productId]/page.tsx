import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { ProductDetail } from '@/components/marketplace/ProductDetail'
import { RequireSession } from '@/components/marketplace/RequireSession'
import styles from '@/components/marketplace/wholesale.module.css'

type PageProps = { params: Promise<{ locale: string; supplierId: string; productId: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, supplierId, productId } = await params
  setRequestLocale(locale)

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <RequireSession>
          <ProductDetail supplierId={supplierId} productId={productId} />
        </RequireSession>
      </div>
    </div>
  )
}
