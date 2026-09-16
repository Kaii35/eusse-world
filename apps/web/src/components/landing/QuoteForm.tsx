import { ArrowRight, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ctaClass } from './cta'
import { QuoteFields, type QuoteLabels } from './QuoteFields'
import { SectionHeading } from './SectionHeading'
import { WHATSAPP_NUMBER, whatsappHref } from './whatsapp'

const SERVICE_KEYS = ['freight', 'trade', 'shopper', 'sourcing', 'warehousing', 'lastMile'] as const
const LABEL_KEYS = [
  'name',
  'company',
  'origin',
  'destination',
  'service',
  'detail',
  'placeCity',
  'placeDetail',
  'submit',
  'sent',
] as const

/**
 * Banda de cotización. Server Component: sólo los campos (QuoteFields) viven en el
 * cliente, así la cabecera y el enlace directo no añaden JavaScript.
 */
export function QuoteForm() {
  const t = useTranslations('landing.quote')
  const tServices = useTranslations('landing.services')

  const labels = Object.fromEntries(LABEL_KEYS.map((key) => [key, t(key)])) as QuoteLabels
  const services = SERVICE_KEYS.map((key) => ({ value: key, label: tServices(key + '.title') }))

  return (
    <section id="quote" className="scroll-mt-20 px-4 pb-24 md:px-6 md:pb-36">
      <div
        data-reveal="scale"
        className="max-w-content from-brand-bright/70 via-night-raised to-night mx-auto rounded-2xl bg-gradient-to-br p-px"
      >
        <div className="bg-night text-on-night relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-2xl p-6 md:p-14 lg:grid-cols-12">
          <div
            aria-hidden
            className="bg-brand-bright/25 motion-safe:animate-drift size-120 pointer-events-none absolute -left-24 -top-24 rounded-full blur-3xl"
          />

          <div className="relative lg:col-span-5">
            <SectionHeading
              index={6}
              eyebrow={t('eyebrow')}
              title={t('title')}
              lead={t('lead')}
              tone="night"
            />

            <div className="border-on-night/15 mt-12 border-t pt-8">
              <p className="text-on-night-muted text-body-sm mb-3">{t('direct')}</p>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-display-md hover:text-brand-glow group inline-flex items-center gap-3 font-bold transition-colors duration-300"
              >
                <MessageCircle strokeWidth={1.5} className="text-brand-glow size-7" />
                {WHATSAPP_NUMBER}
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-5 transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>

          <QuoteFields
            labels={labels}
            services={services}
            submitClassName={ctaClass('brand', 'mt-2 w-full')}
          />
        </div>
      </div>
    </section>
  )
}
