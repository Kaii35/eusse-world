import { cn } from '@eusse/ui'
import { Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionHeading } from './SectionHeading'

const QUOTES = ['one', 'two', 'three'] as const

/** La primera cita manda: bloque grande a la izquierda y dos apoyos a la derecha. */
export function Testimonials() {
  const t = useTranslations('landing.testimonials')

  return (
    <section className="border-line bg-page-alt border-y py-24 md:py-36">
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index={4} eyebrow={t('eyebrow')} title={t('title')} />
          <p className="border-brand/30 text-brand text-caption rounded-full border px-4 py-1.5 font-mono">
            {t('notice')}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {QUOTES.map((quote, index) => {
            const featured = index === 0
            return (
              <figure
                key={quote}
                data-reveal
                className={cn(
                  'border-line hover:border-brand/30 group flex flex-col rounded-xl border p-8 transition duration-500',
                  featured
                    ? 'from-brand-tint to-page bg-gradient-to-br md:p-14 lg:col-span-7 lg:row-span-2'
                    : 'bg-page lg:col-span-5',
                )}
              >
                <Quote
                  aria-hidden
                  strokeWidth={1}
                  className={cn(
                    'text-brand mb-8 transition duration-700 group-hover:-rotate-6',
                    featured ? 'size-12' : 'size-8',
                  )}
                />
                <blockquote
                  className={cn(
                    'font-display text-balance font-medium',
                    featured ? 'text-display-md' : 'text-h4',
                  )}
                >
                  {t(quote + '.text')}
                </blockquote>
                <figcaption className="border-line text-ink-muted text-body-sm mt-auto border-t pt-6">
                  {t(quote + '.author')}
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
