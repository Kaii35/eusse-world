import { setRequestLocale } from 'next-intl/server'

import { Landing } from '@/components/marketing/landing/Landing'

type PageProps = { params: Promise<{ locale: string }> }

/**
 * Landing (RFC-0009). Estática por idioma: se prerenderiza en build.
 * La composición y el movimiento viven en `components/marketing/landing`.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <Landing />
}
