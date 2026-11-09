'use client'

import { useTranslations } from 'next-intl'

import { ApiError } from './api/client'

/**
 * Traduce un error de la API a un mensaje. La interfaz reacciona al código, nunca al texto
 * técnico (docs/02-domain-model.md §6). Un código sin traducción cae en un mensaje genérico.
 */
export function useApiErrorMessage(): (error: unknown) => string {
  const t = useTranslations('marketplace.errors')
  return (error) => {
    const code = error instanceof ApiError ? error.code : 'unknown'
    return t.has(code) ? t(code) : t('unknown')
  }
}
