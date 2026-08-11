import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/ThemeProvider'
import { routing, type AppLocale } from '@/lib/i18n/routing'

import '@/styles/globals.css'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/** Genera las rutas de ambos idiomas en build: estáticas e indexables. */
export function generateStaticParams(): { locale: AppLocale }[] {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    // Sin metadataBase, canonical y hreflang se emiten como rutas RELATIVAS y Google
    // las ignora: exige URLs absolutas (skills/seo.md).
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    title: { default: t('title'), template: `%s | ${t('siteName')}` },
    description: t('description'),
    // hreflang recíproco con x-default (skills/seo.md).
    alternates: {
      canonical: `/${locale}`,
      languages: { es: '/es', en: '/en', 'x-default': '/es' },
    },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!routing.locales.includes(locale as AppLocale)) notFound()

  // Habilita el renderizado estático de las rutas hijas.
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    // `suppressHydrationWarning` porque ThemeProvider ajusta la clase antes de hidratar:
    // sin ello habría un parpadeo de tema claro en cada carga.
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
