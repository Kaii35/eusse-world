'use client'

import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'

/**
 * Frontera de error de la ruta.
 *
 * Dice qué pasó, si es recuperable y ofrece la acción de salida. Nunca muestra el
 * mensaje técnico al usuario: el `digest` es lo que permite a soporte rastrearlo
 * (skills/ux-design.md).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  return (
    <main
      role="alert"
      className="max-w-content mx-auto flex min-h-dvh flex-col items-start justify-center gap-4 px-6"
    >
      <h1 className="text-h1 font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground max-w-prose">{t('description')}</p>
      {error.digest ? (
        <p className="text-subtle-foreground text-caption">
          {t('reference')}
          <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
      <Button onClick={reset}>{t('retry')}</Button>
    </main>
  )
}
