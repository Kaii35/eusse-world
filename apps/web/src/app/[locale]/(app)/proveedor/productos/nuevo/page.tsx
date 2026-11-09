import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { ProductForm } from '@/components/marketplace/ProductForm'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function NewProductPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ProductForm />
}
