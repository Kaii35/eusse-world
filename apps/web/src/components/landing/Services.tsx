import { cn } from '@eusse/ui'
import {
  ArrowUpRight,
  FileCheck,
  Handshake,
  Plane,
  Ship,
  ShoppingBag,
  Truck,
  Warehouse,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionHeading } from './SectionHeading'

import type { LucideIcon } from 'lucide-react'

type Service = { key: string; Icon: LucideIcon; featured?: boolean; span: string }

/** Bento: transporte ocupa el bloque grande; el resto, celdas iguales. */
const SERVICES: Service[] = [
  { key: 'freight', Icon: Ship, featured: true, span: 'md:col-span-2 lg:col-span-4 lg:row-span-2' },
  { key: 'trade', Icon: FileCheck, span: 'lg:col-span-2' },
  { key: 'shopper', Icon: ShoppingBag, span: 'lg:col-span-2' },
  { key: 'sourcing', Icon: Handshake, span: 'lg:col-span-2' },
  { key: 'warehousing', Icon: Warehouse, span: 'lg:col-span-2' },
  { key: 'lastMile', Icon: Truck, span: 'lg:col-span-2' },
]

const MODES = [
  { key: 'air', Icon: Plane },
  { key: 'sea', Icon: Ship },
  { key: 'land', Icon: Truck },
] as const

export function Services() {
  const t = useTranslations('landing.services')

  return (
    <section id="services" className="relative scroll-mt-20 py-24 md:py-36">
      <div className="max-w-content mx-auto px-6">
        <SectionHeading index={1} eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

        <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map(({ key, Icon, featured, span }, index) => (
            <li key={key} data-reveal className={span}>
              <article
                data-spotlight
                className={cn(
                  'border-line bg-page hover:border-brand/30 group relative flex h-full flex-col overflow-hidden rounded-xl border p-7 transition duration-500 hover:-translate-y-1 md:p-8',
                  featured && 'from-brand-tint to-page bg-gradient-to-br md:p-12',
                )}
              >
                <div className="mb-10 flex items-start justify-between">
                  <span className="border-line bg-brand-tint text-brand group-hover:border-brand/40 grid size-12 place-items-center rounded-full border transition duration-500">
                    <Icon strokeWidth={1.5} className="size-5" />
                  </span>
                  <span className="text-ink-subtle text-caption flex items-center gap-2 font-mono">
                    {String(index + 1).padStart(2, '0')}
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1.5}
                      className="text-brand size-4 -translate-x-1 translate-y-1 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                    />
                  </span>
                </div>

                <h3
                  className={cn(
                    'font-display mb-3 text-balance font-semibold',
                    featured ? 'text-display-lg max-w-title font-bold' : 'text-h4',
                  )}
                >
                  {t(key + '.title')}
                </h3>
                <p
                  className={cn(
                    'text-ink-muted',
                    featured ? 'text-lead max-w-blurb' : 'text-body-sm',
                  )}
                >
                  {t(key + '.body')}
                </p>

                {featured ? (
                  <>
                    <ul className="mt-auto flex flex-wrap gap-2 pt-12">
                      {MODES.map(({ key: mode, Icon: ModeIcon }) => (
                        <li
                          key={mode}
                          className="border-line text-ink text-body-sm flex items-center gap-2 rounded-full border px-4 py-2"
                        >
                          <ModeIcon strokeWidth={1.5} className="text-brand size-4" />
                          {t(mode)}
                        </li>
                      ))}
                    </ul>
                    <Ship
                      aria-hidden
                      strokeWidth={0.5}
                      className="text-brand/5 absolute -bottom-10 -right-10 size-80 transition duration-1000 group-hover:-translate-x-4"
                    />
                  </>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
