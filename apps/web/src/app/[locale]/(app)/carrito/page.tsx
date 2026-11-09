import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { Cart } from '@/components/marketplace/Cart'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <Cart />
}
