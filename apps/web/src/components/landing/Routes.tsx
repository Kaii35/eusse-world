import { useTranslations } from 'next-intl'

import { HUB_KEYS, HUBS } from './network'
import { SectionHeading } from './SectionHeading'
import { WorldMap } from './WorldMap'

export function Routes() {
  const t = useTranslations('landing.routes')

  const labels = HUB_KEYS.map((hub) => ({
    place: hub,
    title: t(hub + '.city'),
    detail: HUBS[hub].code,
    // San José y Medellín quedan muy cerca en el mapa: su etiqueta va debajo.
    side: hub === 'sanJose' ? ('below' as const) : HUBS[hub].labelSide,
  }))

  return (
    <section
      id="routes"
      className="border-line bg-page-alt relative scroll-mt-20 overflow-hidden border-y py-24 md:py-36"
    >
      <div className="max-w-content mx-auto px-6">
        <SectionHeading
          index={2}
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
          align="center"
          wordByWord
        />

        <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <figure
            data-reveal="fade"
            className="border-line bg-page shadow-float relative overflow-hidden rounded-2xl border p-4 sm:p-8 lg:col-span-8"
          >
            <WorldMap labels={labels} />
            <figcaption className="text-ink-subtle text-eyebrow tracking-eyebrow mt-2 text-right font-mono uppercase">
              {t('caption')}
            </figcaption>
          </figure>

          <div className="lg:col-span-4">
            <p className="text-ink-subtle text-eyebrow tracking-eyebrow mb-3 font-mono uppercase">
              {t('hubs')}
            </p>
            <ol className="border-line border-t">
              {HUB_KEYS.map((hub) => (
                <li
                  key={hub}
                  data-reveal="left"
                  className="border-line group flex items-center gap-4 border-b py-5"
                >
                  <span className="bg-brand-tint text-brand text-body-sm grid h-9 w-14 place-items-center rounded-md font-mono font-medium">
                    {HUBS[hub].code}
                  </span>
                  <span className="font-display text-h4 font-semibold transition duration-500 group-hover:translate-x-1.5">
                    {t(hub + '.city')}
                  </span>
                  <span className="text-ink-subtle text-body-sm ml-auto">
                    {t(hub + '.country')}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
