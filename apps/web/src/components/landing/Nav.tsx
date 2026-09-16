import { cn } from '@eusse/ui'
import { Globe2, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ctaClass } from './cta'
import { WHATSAPP_NUMBER, whatsappHref } from './whatsapp'

import { getPathname } from '@/lib/i18n/navigation'
import { routing } from '@/lib/i18n/routing'

const SECTIONS = ['services', 'routes', 'process', 'faq'] as const

/**
 * Barra flotante. Arriba del todo es transparente; al hacer scroll se condensa en una
 * píldora de vidrio (variante `scrolled`, que activa LandingMotion).
 *
 * Los enlaces de idioma usan getPathname y no <Link>: en un Server Component el Link de
 * next-intl es asíncrono (espera a getLocale) y suspendería el prerender, dejando la
 * página invisible sin JavaScript. getPathname da la misma URL de forma síncrona.
 */
export function Nav() {
  const t = useTranslations('landing.nav')
  const tA11y = useTranslations('a11y')
  const locale = useLocale()

  return (
    <>
      <a
        href="#content"
        className="bg-brand text-on-night sr-only z-50 rounded-full px-5 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {tA11y('skipToContent')}
      </a>
      <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 md:pt-5">
        <div className="max-w-content scrolled:py-2 relative mx-auto flex items-center gap-6 rounded-full py-3 pl-5 pr-2 transition-[padding] duration-500 md:pl-7">
          {/* Capa de vidrio: aparece por opacidad, sin animar el fondo. */}
          <span
            aria-hidden
            className="border-line bg-page/80 shadow-float scrolled:opacity-100 absolute inset-0 -z-10 rounded-full border opacity-0 backdrop-blur-xl transition-opacity duration-500"
          />

          {/* Marca en texto a la manera del logotipo: globo azul, EUSSE y WORLD entre filetes.
            Se sustituye por el archivo del logotipo cuando esté en el repositorio. */}
          <a
            href={getPathname({ href: '/', locale })}
            aria-label={t('home')}
            className="group mr-auto flex items-center gap-3"
          >
            <span className="from-brand-bright to-brand-strong shadow-brand text-on-night grid size-10 place-items-center rounded-full bg-gradient-to-br transition duration-700 group-hover:rotate-12">
              <Globe2 aria-hidden strokeWidth={1.5} className="size-5" />
            </span>
            <span className="flex flex-col items-center leading-none">
              <span className="font-display text-body-lg font-extrabold tracking-wider">
                {t('brandMain')}
              </span>
              <span className="text-ink-muted text-eyebrow tracking-eyebrow mt-1 flex items-center gap-1.5 font-semibold">
                <span aria-hidden className="bg-ink-subtle h-px w-2.5" />
                {t('brandSub')}
                <span aria-hidden className="bg-ink-subtle h-px w-2.5" />
              </span>
            </span>
          </a>

          <nav aria-label={t('label')} className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((section) => (
              <a
                key={section}
                href={'#' + section}
                className="text-ink-muted hover:text-ink hover:bg-brand-tint text-body-sm rounded-full px-4 py-2 transition-colors duration-300"
              >
                {t(section)}
              </a>
            ))}
          </nav>

          <div
            role="group"
            aria-label={t('language')}
            className="border-line text-eyebrow hidden items-center rounded-full border p-1 font-mono uppercase md:flex"
          >
            {routing.locales.map((option) => (
              <a
                key={option}
                href={getPathname({ href: '/', locale: option })}
                hrefLang={option}
                aria-current={option === locale ? 'true' : undefined}
                className={cn(
                  'rounded-full px-2.5 py-1 transition-colors duration-300',
                  option === locale
                    ? 'bg-brand-tint text-brand-strong'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {option}
              </a>
            ))}
          </div>

          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass('brand', 'h-10 px-4 md:px-5')}
          >
            <MessageCircle strokeWidth={1.75} />
            <span className="sr-only sm:not-sr-only">{t('cta')}</span>
            <span className="sr-only">{WHATSAPP_NUMBER}</span>
          </a>
        </div>
      </header>
    </>
  )
}
