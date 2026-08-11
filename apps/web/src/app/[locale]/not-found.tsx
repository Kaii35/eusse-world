import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'

import { Link } from '@/lib/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <main className="max-w-content mx-auto flex min-h-dvh flex-col items-start justify-center gap-4 px-6">
      <p className="text-muted-foreground text-body-sm font-medium">{t('code')}</p>
      <h1 className="text-h1 font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      <Button asChild>
        <Link href="/">{t('action')}</Link>
      </Button>
    </main>
  )
}
