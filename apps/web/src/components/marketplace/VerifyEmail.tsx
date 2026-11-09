'use client'

import { Button, Skeleton } from '@eusse/ui'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Notice, Surface } from './kit'

import { Link } from '@/lib/i18n/navigation'
import { useVerifyEmail } from '@/lib/marketplace/api/queries'

/** Consume el enlace del correo una sola vez y muestra el resultado con su siguiente paso. */
export function VerifyEmail({ token }: { token: string | null }) {
  const t = useTranslations('marketplace.access')
  const verify = useVerifyEmail()
  const { mutate } = verify

  useEffect(() => {
    if (token) mutate(token)
  }, [token, mutate])

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Surface labelledBy="verify-title">
        {!token ? (
          <Failure />
        ) : verify.isPending ? (
          <div className="flex flex-col gap-4" aria-live="polite">
            <h1 id="verify-title" className="text-h3 text-foreground font-semibold">
              {t('verifying')}
            </h1>
            <Skeleton className="h-12 w-full" />
          </div>
        ) : verify.isError ? (
          <Failure />
        ) : verify.isSuccess ? (
          <div className="flex flex-col gap-4" aria-live="polite">
            <h1 id="verify-title" className="text-h3 text-foreground font-semibold">
              {t('verifiedTitle')}
            </h1>
            <Notice>{t('verifiedBody')}</Notice>
            <Button asChild size="lg">
              <Link href="/acceso">{t('goLogin')}</Link>
            </Button>
          </div>
        ) : null}
      </Surface>
    </div>
  )

  function Failure() {
    return (
      <div className="flex flex-col gap-4">
        <h1 id="verify-title" className="text-h3 text-foreground font-semibold">
          {t('verifyFailedTitle')}
        </h1>
        <Notice tone="danger" role="alert">
          {t('verifyFailed')}
        </Notice>
        <Button asChild variant="secondary">
          <Link href="/acceso?modo=registro">{t('register')}</Link>
        </Button>
      </div>
    )
  }
}
