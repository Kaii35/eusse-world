import { setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { VerifyEmail } from '@/components/marketplace/VerifyEmail'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function VerifyPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const { token } = await searchParams
  return <VerifyEmail token={token ?? null} />
}
