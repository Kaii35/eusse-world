'use client'

import { Skeleton } from '@eusse/ui'
import { useTranslations } from 'next-intl'

import { buttonClass, cx, Surface } from './kit'
import styles from './wholesale.module.css'

import type { ReactNode } from 'react'

import { Link } from '@/lib/i18n/navigation'
import { useMe } from '@/lib/marketplace/api/queries'

/**
 * Protege una pantalla de la cuenta. Sin sesión muestra por qué no puede ver lo que busca
 * y cómo entrar, en lugar de una lista vacía sin explicación.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const t = useTranslations('marketplace.gate')
  const me = useMe()

  if (me.isPending) return <Skeleton className="h-48 w-full" />

  if (me.isError) {
    return (
      <Surface className={cx(styles.gate)}>
        <h2 className={cx(styles.display, styles.h3)}>{t('title')}</h2>
        <p className={styles.muted}>{t('body')}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/acceso" className={buttonClass()}>
            {t('signIn')}
          </Link>
          <Link href="/acceso?modo=registro" className={buttonClass({ variant: 'secondary' })}>
            {t('createAccount')}
          </Link>
        </div>
      </Surface>
    )
  }

  return children
}
