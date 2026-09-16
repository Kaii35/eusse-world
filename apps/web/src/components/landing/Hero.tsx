import { cn } from '@eusse/ui'
import { ArrowDown, ArrowRight, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ctaClass } from './cta'
import { InteractiveGlobe } from './InteractiveGlobe'
import { CORRIDORS, EXPANSION_MARKERS, HUB_KEYS, HUBS, NETWORK_CONNECTIONS } from './network'
import { whatsappHref } from './whatsapp'

import type { GlobeMarker } from './InteractiveGlobe'

const STATS = ['countries', 'services', 'modes'] as const

export function Hero() {
  const t = useTranslations('landing.hero')
  const tRoutes = useTranslations('landing.routes')
  const tStats = useTranslations('landing.stats')

  const markers: GlobeMarker[] = [
    ...HUB_KEYS.map((hub) => ({ ...HUBS[hub], label: tRoutes(hub + '.city') })),
    ...EXPANSION_MARKERS,
  ]

  return (
    <section className="from-brand-tint via-page to-page relative isolate overflow-hidden bg-gradient-to-b">
      {/* Atmósfera: halos azules que derivan despacio y retícula de puntos. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div data-parallax="0.12" className="absolute -right-40 top-10">
          <div className="bg-brand-bright/15 motion-safe:animate-drift size-160 rounded-full blur-3xl" />
        </div>
        <div data-parallax="0.2" className="absolute -left-32 bottom-0">
          <div className="bg-brand/10 motion-safe:animate-drift size-120 rounded-full blur-3xl" />
        </div>
        <div className="bg-dot-grid absolute inset-0 opacity-60" />
      </div>

      <div className="max-w-content mx-auto grid min-h-svh grid-cols-1 items-center gap-8 px-6 pb-12 pt-32 lg:grid-cols-12 lg:pt-28">
        <div className="relative z-10 lg:col-span-7">
          <p className="motion-safe:animate-rise rise-delay-1 border-line bg-page/80 text-ink-muted text-body-sm shadow-card mb-8 inline-flex items-center gap-3 rounded-full border py-1.5 pl-2 pr-4 backdrop-blur">
            <span className="relative flex size-2.5 items-center justify-center">
              <span className="bg-brand motion-safe:animate-glow absolute inset-0 rounded-full" />
              <span className="bg-brand relative size-1.5 rounded-full" />
            </span>
            {t('eyebrow')}
          </p>

          {/* El h1 no se anima: es el LCP (ADR-0016). Sólo se dibuja la barra de acento. */}
          <h1 className="font-display text-display-xl max-w-headline mb-8 font-extrabold">
            <span className="block">{t('titleLead')}</span>
            <span className="relative inline-block">
              <span className="from-brand-bright via-brand to-brand-strong bg-gradient-to-r bg-clip-text text-transparent">
                {t('titleAccent')}
              </span>
              <span
                aria-hidden
                className="from-brand-bright to-brand motion-safe:animate-draw absolute -bottom-3 left-1 h-1.5 w-28 origin-left rounded-full bg-gradient-to-r"
              />
            </span>
          </h1>

          <p className="motion-safe:animate-rise rise-delay-3 text-lead max-w-lead text-ink/85 mb-4">
            {t('lead')}
          </p>
          <p className="motion-safe:animate-rise rise-delay-4 text-ink-muted text-body max-w-lead mb-10">
            {t('support')}
          </p>

          <div className="motion-safe:animate-rise rise-delay-5 mb-14 flex flex-wrap gap-3">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClass('brand')}
            >
              <MessageCircle strokeWidth={1.75} />
              {t('ctaPrimary')}
              <ArrowRight strokeWidth={1.75} className="group-hover/cta:translate-x-1" />
            </a>
            <a href="#services" className={ctaClass('ghost')}>
              {t('ctaSecondary')}
              <ArrowDown strokeWidth={1.75} className="group-hover/cta:translate-y-0.5" />
            </a>
          </div>

          <dl className="motion-safe:animate-rise rise-delay-6 border-line grid max-w-lg grid-cols-3 border-t pt-8">
            {STATS.map((key, index) => (
              <div
                key={key}
                className={cn(
                  'flex flex-col-reverse justify-end gap-2 pr-4',
                  index > 0 && 'border-line border-l pl-4 sm:pl-6',
                )}
              >
                <dt className="text-ink-subtle text-caption max-w-28">{tStats(key + '.label')}</dt>
                <dd className="font-display text-stat text-brand-strong font-bold" data-numeric>
                  {tStats(key + '.value')}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="motion-safe:animate-emerge rise-delay-2 max-w-globe relative mx-auto aspect-square w-full lg:-mr-16 lg:ml-auto">
            {/* Órbitas: anillos finos que giran en sentidos opuestos alrededor del globo. */}
            <div
              aria-hidden
              className="border-line motion-safe:animate-orbit absolute inset-0 rounded-full border border-dashed"
            >
              <span className="bg-brand shadow-brand absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full" />
            </div>
            <div
              aria-hidden
              className="border-line motion-safe:animate-orbit-reverse absolute inset-12 rounded-full border"
            >
              <span className="bg-brand-bright absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full" />
            </div>

            <div className="absolute inset-6">
              <InteractiveGlobe markers={markers} connections={NETWORK_CONNECTIONS} />
            </div>
          </div>
          <p className="text-ink-subtle text-eyebrow tracking-eyebrow mt-4 text-center font-mono uppercase">
            {t('globeHint')}
          </p>
        </div>
      </div>

      {/* Cinta de corredores: se duplica para que el bucle no tenga costura. */}
      <div className="border-line bg-page/80 relative border-t py-5 backdrop-blur">
        <p className="sr-only">{t('corridors')}</p>
        <div className="mask-fade-x flex overflow-hidden">
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
              className="motion-safe:animate-marquee flex shrink-0 items-center gap-12 pr-12"
            >
              {CORRIDORS.map(([from, to]) => (
                <li
                  key={from + to}
                  className="text-ink-muted text-body-sm flex shrink-0 items-center gap-4"
                >
                  <span className="text-ink font-mono">{HUBS[from].code}</span>
                  <ArrowRight aria-hidden strokeWidth={1.5} className="text-brand size-4" />
                  <span className="text-ink font-mono">{HUBS[to].code}</span>
                  <span className="font-display text-body flex items-center gap-2 font-semibold">
                    <span>{tRoutes(from + '.city')}</span>
                    <span aria-hidden className="bg-ink-subtle h-px w-3" />
                    <span>{tRoutes(to + '.city')}</span>
                  </span>
                  <span aria-hidden className="bg-line-strong ml-8 size-1 rounded-full" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
