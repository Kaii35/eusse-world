'use client'

import { Button, Skeleton } from '@eusse/ui'
import { useTranslations } from 'next-intl'

import { Surface } from './kit'

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
      <Surface className="mx-auto max-w-lg">
        <h2 className="text-h3 text-foreground font-semibold">{t('title')}</h2>
        <p className="text-body text-muted-foreground">{t('body')}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/acceso">{t('signIn')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/acceso?modo=registro">{t('createAccount')}</Link>
          </Button>
        </div>
      </Surface>
    )
  }

  return children
}
