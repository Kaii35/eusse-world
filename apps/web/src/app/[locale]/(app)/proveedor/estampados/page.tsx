import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { PanelPrint } from '@/components/marketplace/SupplierPanel'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function PanelPrintPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PanelPrint />
}
