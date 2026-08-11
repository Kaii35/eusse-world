import { Button } from '@eusse/ui'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/lib/i18n/navigation'

type PageProps = { params: Promise<{ locale: string }> }

/**
 * Landing. Server Component: sin JavaScript de cliente salvo lo estrictamente
 * interactivo (ADR-0003).
 *
 * Esqueleto del paso A10. La landing completa se construye en el Bloque C
 * (RFC-0009), donde se define la estructura de secciones y el sistema de movimiento.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  return (
    <main className="max-w-content mx-auto flex min-h-dvh flex-col items-start justify-center gap-6 px-6">
      <p className="text-muted-foreground text-body-sm font-medium uppercase tracking-wide">
        {t('eyebrow')}
      </p>

      {/* El h1 NO se anima: es el LCP y esperar a una animación es autolesionarse
          (ADR-0016). */}
      <h1 className="text-display max-w-prose text-balance font-semibold">{t('title')}</h1>

      <p className="text-muted-foreground text-body-lg max-w-prose">{t('subtitle')}</p>

      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/register">{t('ctaPrimary')}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/catalog">{t('ctaSecondary')}</Link>
        </Button>
      </div>
    </main>
  )
}
