import { MessageCircle, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ctaClass } from './cta'
import { SectionHeading } from './SectionHeading'
import { whatsappHref } from './whatsapp'

const QUESTIONS = ['volume', 'customs', 'transit', 'shopper', 'tracking'] as const

/**
 * Disclosure nativo: funciona sin JavaScript y es navegable con teclado. El "+" gira
 * a "×" al abrir y la respuesta sube suavemente.
 */
export function Faq() {
  const t = useTranslations('landing.faq')

  return (
    <section id="faq" className="scroll-mt-20 py-24 md:py-36">
      <div className="max-w-content mx-auto grid grid-cols-1 gap-14 px-6 lg:grid-cols-12 lg:gap-12">
        <div className="self-start lg:sticky lg:top-32 lg:col-span-5">
          <SectionHeading index={5} eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass('ghost', 'mt-10')}
          >
            <MessageCircle strokeWidth={1.75} />
            {t('cta')}
          </a>
        </div>

        <div className="border-line border-t lg:col-span-7">
          {QUESTIONS.map((question) => (
            <details key={question} data-reveal className="border-line group border-b">
              <summary className="hover:text-brand text-body-lg flex cursor-pointer list-none items-center justify-between gap-6 py-7 font-medium transition-colors duration-300 [&::-webkit-details-marker]:hidden">
                {t(question + '.q')}
                <span className="border-line group-open:border-brand/50 group-open:text-brand grid size-10 shrink-0 place-items-center rounded-full border transition duration-500 group-open:rotate-45">
                  <Plus aria-hidden strokeWidth={1.5} className="size-4" />
                </span>
              </summary>
              <p className="text-ink-muted max-w-lead motion-safe:animate-unfold pb-8 pr-16">
                {t(question + '.a')}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
