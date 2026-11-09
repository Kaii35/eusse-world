import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { AccessPanel } from '@/components/marketplace/AccessPanel'

type PageProps = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AccessPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <AccessPanel />
}
