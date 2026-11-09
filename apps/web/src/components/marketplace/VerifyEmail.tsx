'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { errorClass, headingClass, noticeClass, sectionClass } from './ui'

import { useVerifyEmail } from '@/lib/marketplace/api/queries'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

/** Consume el token del enlace de correo una sola vez al abrir la página. */
export function VerifyEmail({ token }: { token: string | null }) {
  const t = useTranslations('marketplace.access')
  const errorMessage = useApiErrorMessage()
  const verify = useVerifyEmail()
  const { mutate } = verify

  useEffect(() => {
    if (token) mutate(token)
  }, [token, mutate])

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-12">
      <section className={sectionClass} aria-live="polite">
        {!token || verify.isError ? (
          <p role="alert" className={errorClass}>
            {!token ? t('verifyFailed') : errorMessage(verify.error)}
          </p>
        ) : verify.isSuccess ? (
          <>
            <h1 className={headingClass}>{t('verifiedTitle')}</h1>
            <p className={noticeClass}>{t('verifiedBody')}</p>
          </>
        ) : (
          <p className="text-muted-foreground">{t('verifying')}</p>
        )}
      </section>
    </div>
  )
}
