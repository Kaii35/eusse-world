import { getRequestConfig } from 'next-intl/server'

import { routing, type AppLocale } from './routing'

import type { AbstractIntlMessages } from 'next-intl'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: AppLocale = routing.locales.includes(requested as AppLocale)
    ? (requested as AppLocale)
    : routing.defaultLocale

  const messages = (await import(`../../../messages/${locale}.json`)) as {
    default: AbstractIntlMessages
  }

  return {
    locale,
    messages: messages.default,
    // Zona horaria por defecto del negocio. La UI formatea con Intl usando el locale
    // del usuario y la moneda del importe, nunca la del idioma (skills/i18n.md).
    timeZone: 'America/Bogota',
  }
})
