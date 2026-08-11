import { Badge } from '@eusse/ui'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type PageProps = { params: Promise<{ locale: string }> }

/**
 * Panel del back-office.
 *
 * Esqueleto del paso A11. Las pantallas de gestión se construyen en el Bloque H
 * (RFC-0011), tras la Puerta F.
 */
export default async function OverviewPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('overview')

  return (
    <main className="max-w-content mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <h1 className="text-h2 font-semibold">{t('title')}</h1>
        <Badge variant="info">{t('phase')}</Badge>
      </header>
      <p className="text-muted-foreground max-w-prose">{t('description')}</p>
    </main>
  )
}
