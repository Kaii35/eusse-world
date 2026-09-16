import { MapPinCheck, MessageSquareText, PackageCheck, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionHeading } from './SectionHeading'

const STEPS = [
  { key: 'brief', Icon: MessageSquareText },
  { key: 'pickup', Icon: PackageCheck },
  { key: 'customs', Icon: ShieldCheck },
  { key: 'delivery', Icon: MapPinCheck },
] as const

/**
 * Línea de tiempo: la guía azul se dibuja al entrar en pantalla (horizontal en
 * escritorio, vertical en móvil) y cada paso aparece sobre ella.
 */
export function Process() {
  const t = useTranslations('landing.process')

  return (
    <section id="process" className="scroll-mt-20 py-24 md:py-36">
      <div className="max-w-content mx-auto px-6">
        <SectionHeading index={3} eyebrow={t('eyebrow')} title={t('title')} />

        <div className="relative mt-20">
          {/* Guía: pista tenue y trazo azul que la recorre. */}
          <div aria-hidden className="bg-line absolute inset-x-0 top-6 hidden h-px lg:block" />
          <div
            aria-hidden
            data-reveal-line
            className="from-brand via-brand/60 absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r to-transparent lg:block"
          />
          <div aria-hidden className="bg-line absolute bottom-0 left-6 top-0 w-px lg:hidden" />
          <div
            aria-hidden
            data-reveal-line="y"
            className="from-brand via-brand/60 absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b to-transparent lg:hidden"
          />

          <ol className="relative grid grid-cols-1 gap-14 lg:grid-cols-4 lg:gap-10">
            {STEPS.map(({ key, Icon }, index) => (
              <li key={key} data-reveal className="group relative pl-20 lg:pl-0">
                <span className="border-line-strong bg-page text-brand group-hover:border-brand/60 absolute left-0 top-0 grid size-12 place-items-center rounded-full border transition duration-500 group-hover:scale-110 lg:static lg:mb-10">
                  <Icon strokeWidth={1.5} className="size-5" />
                </span>
                <p className="text-brand text-eyebrow tracking-eyebrow mb-3 font-mono uppercase">
                  {t('step')} {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-h4 mb-3 font-semibold">{t(key + '.title')}</h3>
                <p className="text-ink-muted text-body-sm max-w-blurb">{t(key + '.body')}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
