import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import type { Metadata } from 'next'

import { routing, type AppLocale } from '@/lib/i18n/routing'

import '@/styles/globals.css'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams(): { locale: AppLocale }[] {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    title: { default: t('title'), template: `%s | ${t('siteName')}` },
    // El back-office nunca se indexa. Se declara aquí ADEMÁS de en la cabecera
    // X-Robots-Tag: dos controles independientes para un fallo con consecuencias
    // de privacidad (skills/seo.md).
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function AdminLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!routing.locales.includes(locale as AppLocale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale}>
      {/*
        Densidad alta y SIN glassmorphism ni animaciones de entrada: el staff pasa seis
        horas al día aquí y eso sería ruido (docs/12-ux-guidelines.md §7).
      */}
      <body className="bg-background text-foreground text-body-sm min-h-dvh antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
