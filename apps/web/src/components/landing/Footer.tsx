import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ctaClass } from './cta'
import { HUB_KEYS } from './network'
import { whatsappHref } from './whatsapp'

const LINKS = ['services', 'routes', 'process', 'quote'] as const

export function Footer() {
  const t = useTranslations('landing.footer')
  const tNav = useTranslations('landing.nav')
  const tRoutes = useTranslations('landing.routes')

  return (
    <footer className="bg-night text-on-night relative overflow-hidden pt-20">
      <div className="max-w-content mx-auto grid grid-cols-1 gap-14 px-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-display text-display-md mb-4 font-extrabold">{tNav('brand')}</p>
          <p className="text-on-night-muted max-w-blurb mb-8">{t('blurb')}</p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass('brand')}
          >
            <MessageCircle strokeWidth={1.75} />
            {t('contact')}
          </a>
        </div>

        <div className="lg:col-span-3">
          <p className="text-brand-glow text-eyebrow tracking-eyebrow mb-5 font-mono uppercase">
            {t('operations')}
          </p>
          <ul className="text-on-night-muted flex flex-col gap-3">
            {HUB_KEYS.map((hub) => (
              <li key={hub} className="flex items-center gap-3">
                <span aria-hidden className="bg-brand-bright size-1 rounded-full" />
                {tRoutes(hub + '.country')}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-brand-glow text-eyebrow tracking-eyebrow mb-5 font-mono uppercase">
            {t('sections')}
          </p>
          <ul className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <li key={link}>
                <a
                  href={'#' + link}
                  className="text-on-night-muted hover:text-on-night group inline-flex items-center gap-2 transition-colors duration-300"
                >
                  {link === 'quote' ? t('quote') : tNav(link)}
                  <ArrowUpRight
                    aria-hidden
                    strokeWidth={1.5}
                    className="size-4 opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Firma: la marca a sangre, desvaneciéndose hacia el borde inferior. */}
      <p
        aria-hidden
        data-reveal
        className="font-display text-wordmark from-on-night/15 to-on-night/0 mt-20 select-none whitespace-nowrap bg-gradient-to-b bg-clip-text text-center font-extrabold text-transparent"
      >
        {tNav('brand')}
      </p>

      <div className="border-on-night/10 relative border-t">
        <p className="max-w-content text-on-night-muted text-caption mx-auto px-6 py-6">
          {t('rights')}
        </p>
      </div>
    </footer>
  )
}
